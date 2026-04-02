/** @type {import('next').NextConfig} */
const isProduction =
  /** @type {any} */ (globalThis).process?.env.NODE_ENV === 'production';

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
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
        },
        ...(isProduction
          ? [
              {
                key: 'Strict-Transport-Security',
                value: 'max-age=63072000; includeSubDomains; preload',
              },
            ]
          : []),
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on',
        },
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cloud.umami.is https://www.clarity.ms https://*.dynatrace.com",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https://asset1.cxnmarksandspencer.com https://static.marksandspencer.com",
            "font-src 'self' https://static.marksandspencer.com",
            "connect-src 'self' https://*.marksandspencer.com https://*.dynatrace.com https://cloud.umami.is https://www.clarity.ms",
            "object-src 'none'",
            "frame-src 'none'",
            "worker-src 'self'",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
          ].join('; '),
        },
      ],
    },
  ],
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
    {
      source: '/global/rulesets',
      destination: '/global',
      permanent: false,
    },

    {
      source: '/global/facets',
      destination: '/global',
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
  turbopack: {
    rules: {
      '*.yml': {
        loaders: ['yaml-loader'],
        as: '*.js',
      },
    },
  },
  serverExternalPackages: ['@vercel/otel'],
};

export default nextConfig;
