/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
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
