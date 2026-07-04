/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  webpack: (config, { isServer }) => {
    if (isServer) config.externals.push('esbuild');
    return config;
  },
  transpilePackages: ['react-email']
};
export default nextConfig;