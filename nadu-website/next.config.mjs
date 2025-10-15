/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/nadu-api/:path*',
        destination: 'http://localhost/nadu/nadu-api/:path*',
      },
    ]
  },
}

export default nextConfig
