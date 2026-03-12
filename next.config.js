/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
  eslint: {
    dirs: ["app", "components", "lib", "tests"],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    domains: [],
  },
  compiler: {
    styledComponents: false,
  },
};

module.exports = nextConfig;
