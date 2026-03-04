import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
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
