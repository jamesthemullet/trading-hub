/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  pageExtensions: ['page.tsx', 'page.ts'],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'asset1.cxnmarksandspencer.com',
        port: '',
        pathname: '/is/image/mands/**',
      },
    ],
  },
  redirects: async () => [
    {
      source: '/category/rulesets',
      destination: '/category',
      permanent: false,
    },

    {
      source: '/category/facets',
      destination: '/category',
      permanent: false,
    },
    {
      source: '/search/rulesets',
      destination: '/search',
      permanent: false,
    },

    {
      source: '/search/facets',
      destination: '/search',
      permanent: false,
    },
  ],
  webpack: (config) => {
    config.module.rules.push({
      test: /\.ya?ml$/,
      use: 'yaml-loader',
    });
    return config;
  },
};

export default nextConfig;
