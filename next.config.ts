import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Codespaces forwards through a proxy, so x-forwarded-host is the
      // public hostname while origin stays localhost. Next.js rejects the
      // mismatch. Development only — Vercel does not need this.
      allowedOrigins: [
        "localhost:5000",
        "automatic-zebra-966vxr5wv6v9hx779-5000.app.github.dev",
      ],
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
