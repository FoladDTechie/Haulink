/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },

  // Required for @meshsdk/core WebAssembly modules
  experimental: {
    asyncWebAssembly: true,
  },

  webpack: (config, { isServer }) => {
    // Mesh SDK uses WASM + native crypto — must be client-side only
    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        '@meshsdk/core',
        '@meshsdk/core-csl',
        '@meshsdk/core-cst',
        'libsodium-wrappers-sumo',
        '@sidan-lab/sidan-csl-rs-browser',
        '@cardano-sdk/crypto',
      ]
    }

    // Tell webpack how to handle .wasm files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    })

    return config
  },
}

module.exports = nextConfig
