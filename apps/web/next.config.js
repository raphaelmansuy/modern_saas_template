/** @type {import('next').NextConfig} */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

const nextConfig = {
  // Disable static generation to avoid React 19 SSR issues
  output: 'standalone',
  // Set the output file tracing root to avoid warnings
  outputFileTracingRoot: path.join(__dirname, '../../'),
  // Experimental features for better SSR handling
  experimental: {
    // Disable optimizePackageImports to avoid issues with Clerk
    optimizePackageImports: [],
  },
  // Configure webpack to handle Clerk properly
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    }
    return config
  },
}

module.exports = nextConfig
