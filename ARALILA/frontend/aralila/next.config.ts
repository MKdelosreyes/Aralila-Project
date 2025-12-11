import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["images.unsplash.com"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "aralila-backend.onrender.com",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "dnrwenixinuxocwdlmwk.supabase.co",
        pathname: "/storage/v1/object/public/**", // ← required for Supabase images
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
