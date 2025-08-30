/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static generation to avoid React 19 SSR issues
  output: 'standalone',
}

module.exports = nextConfig
