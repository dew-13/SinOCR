const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ["localhost"],
  },
  experimental: {
    serverComponentsExternalPackages: ["@neondatabase/serverless"],
  },
}

module.exports = nextConfig
