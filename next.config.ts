import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? "/ready-2-print" : "",
  assetPrefix: isProd ? "/ready-2-print/" : "",
  images: {
    unoptimized: true,
  },
  sassOptions: {
    implementation: "sass-embedded",
  },
};

export default nextConfig;
