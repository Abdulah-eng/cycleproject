/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['bikes.fan'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bikes.fan',
        pathname: '/wp-content/uploads/bike_images/**',
      },
    ],
  },
}

module.exports = nextConfig
