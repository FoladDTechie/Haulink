/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
  webpack: (config) => {
    // Enable WebAssembly (required by @meshsdk/core-csl / @sidan-lab)
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    }
    // Explicitly type .wasm files — Next.js asset rules can intercept them
    // before the asyncWebAssembly experiment applies.
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    })
    return config
  },
}

module.exports = nextConfig
