const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    }
    // libsodium-wrappers-sumo ESM build does a relative ./libsodium-sumo.mjs
    // import that webpack can't resolve. Force the CJS build instead.
    config.resolve.alias = {
      ...config.resolve.alias,
      'libsodium-wrappers-sumo': path.resolve(
        __dirname,
        'node_modules/libsodium-wrappers-sumo/dist/modules-sumo/libsodium-wrappers.js'
      ),
    }
    return config
  },
}

module.exports = nextConfig
