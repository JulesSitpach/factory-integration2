/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: [
      'localhost',
      'images.unsplash.com',
      'via.placeholder.com',
      'picsum.photos',
      'source.unsplash.com',
      'ui-avatars.com',
      'github.com',
      'githubusercontent.com',
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
      'cdn.jsdelivr.net',
      'flagcdn.com',
      'countryflags.io',
      'www.countryflags.io'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: false,
  },
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/dashboard/en',
        permanent: true,
      },
      {
        source: '/dashboard/',
        destination: '/dashboard/en',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/dashboard/en/:path*',
        destination: '/dashboard/:path*',
      },
    ];
  },
};

module.exports = nextConfig;