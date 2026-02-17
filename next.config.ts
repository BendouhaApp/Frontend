import type { NextConfig } from "next";

const rawApiUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.BACKEND_API_URL ||
  (process.env.NODE_ENV === "production" ? "/api" : "http://localhost:3000/api");
const normalizedApiUrl = rawApiUrl.replace(/\/+$/, "");
const isAbsoluteApiUrl = /^https?:\/\//i.test(normalizedApiUrl);
let backendOrigin = "http://localhost:3000";

if (isAbsoluteApiUrl) {
  try {
    backendOrigin = new URL(normalizedApiUrl).origin;
  } catch {
    // Keep fallback origin
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "react-icons",
      "framer-motion",
      "@radix-ui/react-dialog",
    ],
  },
  async rewrites() {
    const rules = [];

    if (isAbsoluteApiUrl) {
      rules.push({
        source: "/api/:path*",
        destination: `${normalizedApiUrl}/:path*`,
      });

      rules.push({
        source: "/uploads/:path*",
        destination: `${backendOrigin}/uploads/:path*`,
      });
    }

    return rules;
  },
};

export default nextConfig;
