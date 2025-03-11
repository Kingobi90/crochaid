/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
    unoptimized: true
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['crochaid-42dfd.web.app', 'localhost:3000', 'localhost:3001', 'localhost:3002']
    }
  }
};

module.exports = nextConfig; 