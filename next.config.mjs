/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', poweredByHeader: false, devIndicators: false,
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${process.env.INTERNAL_API_URL || 'http://127.0.0.1:4001'}/api/:path*` },
      { source: '/uploads/:path*', destination: `${process.env.INTERNAL_API_URL || 'http://127.0.0.1:4001'}/uploads/:path*` },
    ];
  },
};
export default nextConfig;
