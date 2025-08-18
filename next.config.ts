import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const nextConfig: NextConfig = {
  basePath: isProd ? "/ready-2-print" : "",
  assetPrefix: isProd ? "/ready-2-print/" : "",
  sassOptions: {
    implementation: "sass-embedded",
  },
};

export default nextConfig;
