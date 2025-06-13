/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  },
};

// Adjust configuration based on deployment target
if (process.env.NETLIFY === 'true') {
  // For Netlify, use static exports
  nextConfig.output = 'export';
  nextConfig.distDir = 'out';
}

module.exports = nextConfig;
