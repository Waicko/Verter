import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/**" },
      { protocol: "https", hostname: "*.supabase.in", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "i.imgur.com", pathname: "/**" },
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "http", hostname: "localhost", pathname: "/**" },
      { protocol: "http", hostname: "127.0.0.1", pathname: "/**" },
    ],
  },
  // Ensure root / redirects to /fi on Vercel (fallback if middleware has edge cases)
  async redirects() {
    return [
      {
        source: "/",
        destination: "/fi",
        permanent: false,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
