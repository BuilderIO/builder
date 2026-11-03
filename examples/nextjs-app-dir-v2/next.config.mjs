/** @type {import('next').NextConfig} */
const nextConfig = {
  // The Builder SDK uses `isolated-vm` on the server to safely run bindings.
  serverExternalPackages: ['isolated-vm'],
};

export default nextConfig;
