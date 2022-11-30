/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config, _options) {
    config.resolve.alias["~"] = __dirname
    return config
  },
}

module.exports = nextConfig
