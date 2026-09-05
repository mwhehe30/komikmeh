/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy the JSON API through the app so browsers never hit CORS and the
  // FE can call the same-origin /api/* path in dev and production.
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://v1.voratoon.com/backend/:path*',
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Mengizinkan semua hostname
      },
      {
        protocol: 'http',
        hostname: '**', // Mengizinkan semua hostname
      },
    ],
  },
};

export default nextConfig;
