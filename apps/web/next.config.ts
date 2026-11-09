import type { NextConfig } from "next";
import path from "path";
import { config as loadEnv } from "dotenv";

// Load root .env so all NEXT_PUBLIC_* vars are available without a local .env
loadEnv({ path: path.resolve(__dirname, "../../.env") });

const nextConfig: NextConfig = {
  output: "standalone",
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
    // App icons (favicon.ico, icon.svg, apple-icon.png) live in app/ and are
    // linked with a content-hash query, so they need no override here. The
    // logo filenames are not hashed: a short TTL lets a future swap show up
    // within the hour.
    return [
      {
        source: "/:logo(logo|logo-dark-mode).png",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
