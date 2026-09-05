// Data source for the app: the Voratoon backend.
//
// The pages below consume a slightly friendlier shape than the raw API:
//   - list endpoints return `{ data, hasMore, ... }` (pages paginate with
//     `offset`, Voratoon paginates with `page` + a `meta` block)
//   - genre items are flattened from `{ id, data: { name } }` to `{ id, name }`
//   - series list items / detail / chapters pass through as-is (nested `data`
//     + top-level `chapters` with `chapterIndex`), which is what the UI reads.
// Same-origin path: next.config.mjs rewrites /api/* to the Voratoon backend,
// so requests never hit CORS and work from any host.
const BASE_URL = '/api';

// How many of the latest chapters to embed per series on the home feed.
// The cards only render the newest chapter, so 1 keeps the payload small
// (each embedded chapter can carry a full image list).
const DEFAULT_TAKE_CHAPTER = 1;

const listParams = (take, page) => {
  const params = new URLSearchParams();
  params.set('take', String(take));
  params.set('page', String(page));
  params.set('includeMeta', 'true');
  return params;
};

const getPayload = async (url, { allow404 = false } = {}) => {
  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) {
    if (allow404 && res.status === 404) return null;
    throw new Error(`Failed to fetch ${url} (${res.status} ${res.statusText})`);
  }

  return res.json();
};

// Voratoon list payloads: `{ status, message, data: [], meta: { total, page, lastPage } }`
// The pages expect `{ data, hasMore }` with offset-based paging.
const toListResult = (payload, offset, take) => {
  const data = payload?.data ?? [];
  const total = payload?.meta?.total;
  const hasMore = typeof total === 'number'
    ? offset + data.length < total
    : data.length >= take;

  return {
    status: payload?.status ?? 200,
    data,
    hasMore,
    total,
    page: payload?.meta?.page,
    lastPage: payload?.meta?.lastPage,
  };
};

// offset (page-level) -> page (server-level)
const toPage = (offset, take) => Math.floor(offset / take) + 1;

export const getSeries = async (offset = 0, take = 20) => {
  const params = listParams(take, toPage(offset, take));
  params.set('preset', 'rilisan_terbaru');
  params.set('takeChapter', String(DEFAULT_TAKE_CHAPTER));

  const payload = await getPayload(`${BASE_URL}/series?${params.toString()}`);
  return toListResult(payload, offset, take);
};

export const searchSeries = async (keyword = '', offset = 0, take = 20, filters = {}) => {
  const params = listParams(take, toPage(offset, take));
  params.set('takeChapter', '0');

  // Voratoon filters:
  //   keyword  -> title      (case-insensitive contains)
  //   genre    -> genreIds   (numeric ids, comma list = must contain all)
  //   status   -> status     (Ongoing/Completed/Hiatus)
  //   type     -> format     (Manga/Manhwa/Manhua — the UI calls it "type")
  const { genreIds = [], status = '', type = '' } = filters;

  if (keyword) params.set('title', keyword);
  if (Array.isArray(genreIds) && genreIds.length > 0) {
    params.set('genreIds', genreIds.join(','));
  }
  if (status) params.set('status', status);
  if (type) params.set('format', type);

  const payload = await getPayload(`${BASE_URL}/series?${params.toString()}`);
  return toListResult(payload, offset, take);
};

export const getGenres = async () => {
  const payload = await getPayload(`${BASE_URL}/genres`);

  // Raw genre items: `{ id, data: { name, ... } }` -> flatten for the UI.
  const data = (payload?.data ?? []).map((g) => ({ id: g.id, ...(g.data ?? {}) }));
  return { status: payload?.status ?? 200, data };
};

export const getSeriesDetail = async (slug) => {
  return getPayload(
    `${BASE_URL}/series/${encodeURIComponent(slug)}?includeMeta=true`,
    { allow404: true },
  );
};

export const getSeriesChapters = async (slug) => {
  return getPayload(
    `${BASE_URL}/series/${encodeURIComponent(slug)}/chapters`,
    { allow404: true },
  );
};

export const getChapterDetail = async (slug, chapterIndex) => {
  return getPayload(
    `${BASE_URL}/series/${encodeURIComponent(slug)}/chapters/${encodeURIComponent(chapterIndex)}`,
    { allow404: true },
  );
};
