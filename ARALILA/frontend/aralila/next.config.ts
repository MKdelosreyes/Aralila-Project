import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["dnrwenixinuxocwdlmwk.supabase.co"],
  },
  eslint: {
    ignoreDuringBuilds: true, // prevents ESLint errors from failing deployment
  },
  reactStrictMode: false,
};

export default nextConfig;
