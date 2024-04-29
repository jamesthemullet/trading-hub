/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  pageExtensions: ['page.tsx', 'page.ts'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'asset1.cxnmarksandspencer.com',
        port: '',
        pathname: '/is/image/mands/**',
      },
    ],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.ya?ml$/,
      use: 'yaml-loader',
    });
    return config;
  },
};

export default nextConfig;
