import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Product photos hosted by Stripe when products are managed in the Stripe dashboard.
      { protocol: "https", hostname: "files.stripe.com" },
      // Photos Kristine uploads in Sanity Studio.
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },
};

export default nextConfig;
