/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export default nextConfig
