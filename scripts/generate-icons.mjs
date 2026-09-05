// KomikMeh PWA icon generator — pure Node, no dependencies.
// Draws a black app tile with a white notched bookmark glyph and writes the
// PNG set used by manifest.json (any + maskable) and apple-touch-icon.
//
//   npm run icons
//
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public');

// ---------------------------------------------------------------- PNG writer
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePng(size, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const stride = size * 4 + 1;
  const raw = Buffer.alloc(size * stride);
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0; // filter: none
    rgba.copy(raw, y * stride + 1, y * size * 4, (y + 1) * size * 4);
  }
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ------------------------------------------------------------ math helpers
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function roundRectSdf(px, py, x0, y0, x1, y1, r) {
  const qx = Math.abs(px - (x0 + x1) / 2) - ((x1 - x0) / 2 - r);
  const qy = Math.abs(py - (y0 + y1) / 2) - ((y1 - y0) / 2 - r);
  const ax = Math.max(qx, 0);
  const ay = Math.max(qy, 0);
  return Math.hypot(ax, ay) + Math.min(Math.max(qx, qy), 0) - r;
}

function segDist(px, py, ax, ay, bx, by) {
  const abx = bx - ax;
  const aby = by - ay;
  const t = clamp(((px - ax) * abx + (py - ay) * aby) / (abx * abx + aby * aby), 0, 1);
  return Math.hypot(px - (ax + abx * t), py - (ay + aby * t));
}

// Signed distance to a CCW triangle; negative inside. a=(bottom-left),
// b=(apex up), c=(bottom-right). Antialiasing via the returned value.
function triSdf(px, py, ax, ay, bx, by, cx, cy) {
  const cross = (x1, y1, x2, y2) => x1 * y2 - y1 * x2;

  const e0x = bx - ax, e0y = by - ay; // a->b
  const e1x = cx - bx, e1y = cy - by; // b->c
  const e2x = ax - cx, e2y = ay - cy; // c->a

  const s1 = cross(e0x, e0y, px - ax, py - ay);
  const s2 = cross(e1x, e1y, px - bx, py - by);
  const s3 = cross(e2x, e2y, px - cx, py - cy);
  const inside = s1 >= 0 && s2 >= 0 && s3 >= 0;

  const d = Math.min(
    segDist(px, py, ax, ay, bx, by),
    segDist(px, py, bx, by, cx, cy),
    segDist(px, py, cx, cy, ax, ay),
  );
  return inside ? -d : d;
}

const coverage = (d) => clamp(0.5 - d, 0, 1);

// ------------------------------------------------------------------ render
function render(size, { rounded, glyphW, glyphH, notch }) {
  const px = new Uint8Array(size * size * 4);
  const tileR = 0.22 * size;
  const bg = [2, 2, 2]; // near-black, blends on both black & white launchers

  const w = glyphW * size;
  const h = glyphH * size;
  const x0 = (size - w) / 2;
  const x1 = size - x0;
  const yTop = (size - h) / 2;
  const yBot = size - yTop;
  const cr = clamp(w * 0.22, 4, 26);
  const notchH = notch * size;
  const apexY = yBot - notchH;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const pp = x + 0.5;
      const q = y + 0.5;

      const aBg = rounded ? coverage(roundRectSdf(pp, q, 0, 0, size, size, tileR)) : 1;
      if (aBg <= 0) continue;

  const body = coverage(roundRectSdf(pp, q, x0, yTop, x1, yBot, cr));
  // V-notch near the bottom, leaving two small “feet” at the outer corners
  const foot = w * 0.16;
  const cut = coverage(
    triSdf(pp, q, x0 + foot, yBot, size / 2, apexY, x1 - foot, yBot),
  );
  const g = clamp(body - cut, 0, 1);

      const idx = (y * size + x) * 4;
      px[idx] = Math.round(bg[0] + (255 - bg[0]) * g);
      px[idx + 1] = Math.round(bg[1] + (255 - bg[1]) * g);
      px[idx + 2] = Math.round(bg[2] + (255 - bg[2]) * g);
      px[idx + 3] = Math.round(255 * aBg);
    }
  }
  return Buffer.from(px.buffer);
}

const jobs = [
  // purpose "any" — rounded tile with transparent corners
  { file: 'icon-192x192.png', size: 192, rounded: true, glyphW: 0.36, glyphH: 0.56, notch: 0.16 },
  { file: 'icon-512x512.png', size: 512, rounded: true, glyphW: 0.36, glyphH: 0.56, notch: 0.16 },
  // purpose "maskable" — full-bleed tile, glyph inside the safe zone
  { file: 'maskable-192x192.png', size: 192, rounded: false, glyphW: 0.32, glyphH: 0.5, notch: 0.15 },
  { file: 'maskable-512x512.png', size: 512, rounded: false, glyphW: 0.32, glyphH: 0.5, notch: 0.15 },
  // apple-touch-icon — opaque square
  { file: 'apple-touch-icon.png', size: 180, rounded: false, glyphW: 0.4, glyphH: 0.62, notch: 0.16 },
];

for (const job of jobs) {
  const rgba = render(job.size, job);
  const file = join(OUT, job.file);
  writeFileSync(file, encodePng(job.size, rgba));
  console.log(`✓ ${job.file} (${job.size}x${job.size})`);
}
console.log('Icons written to public/');
