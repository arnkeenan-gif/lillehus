import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product photos hosted by Stripe when products are managed in the Stripe dashboard.
    remotePatterns: [{ protocol: "https", hostname: "files.stripe.com" }],
  },
};

export default nextConfig;
