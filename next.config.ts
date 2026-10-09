import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // The shop was called "bageri" until Kristine named it "Bagværk" (October 2026).
    return [
      { source: "/bageri", destination: "/bagvaerk", permanent: true },
      { source: "/bageri/:path*", destination: "/bagvaerk/:path*", permanent: true },
    ];
  },
  images: {
    // 75 for everything, 90 for the hero photos (Next only serves listed qualities).
    qualities: [75, 90],
    remotePatterns: [
      // Product photos hosted by Stripe when products are managed in the Stripe dashboard.
      { protocol: "https", hostname: "files.stripe.com" },
      // Photos Kristine uploads in Sanity Studio.
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },
};

export default nextConfig;
