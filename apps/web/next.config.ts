import type { NextConfig } from "next";
import path from "path";
import { config as loadEnv } from "dotenv";

// Load root .env so all NEXT_PUBLIC_* vars are available without a local .env
loadEnv({ path: path.resolve(__dirname, "../../.env") });

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../../"),
  transpilePackages: ["@withintech-learn/shared"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        // S3 virtual-hosted style: <bucket>.s3.<region>.amazonaws.com
        // and direct S3: s3.amazonaws.com
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      {
        // CloudFront CDN
        protocol: "https",
        hostname: "**.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
    dangerouslyAllowSVG: true,
  },
  async headers() {
    return [
      {
        source: "/favicon.ico",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/logo.png",
        headers: [{ key: "Cache-Control", value: "no-cache" }],
      },
    ];
  },
};

export default nextConfig;
