/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Required: prevent webpack from bundling native/WASM modules used by @xenova/transformers
  serverExternalPackages: ["@xenova/transformers"],
  // Turbopack config — silences the "webpack config present, no turbopack config" warning
  turbopack: {},
  webpack(config) {
    // onnxruntime-node uses native binaries — mark as external for server bundles
    config.externals = [...(config.externals ?? []), { "onnxruntime-node": "commonjs onnxruntime-node" }]
    return config
  },
}

export default nextConfig
