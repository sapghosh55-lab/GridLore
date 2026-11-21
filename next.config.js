/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['three'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'hls.js': false,
    };
    return config;
  },
};

module.exports = nextConfig;
