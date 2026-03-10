import type { NextConfig } from "next";
import path from "path";

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
    ],
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
