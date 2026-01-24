/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bikes.fan',
        pathname: '/wp-content/uploads/bike_images/**',
      },
      {
        protocol: 'https',
        hostname: 'bikes-iq.s3.eu-central-1.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
