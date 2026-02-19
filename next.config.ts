import type { NextConfig } from "next";

const rawPublicApiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
const normalizedPublicApiUrl = rawPublicApiUrl.replace(/\/+$/, "");
const isAbsolutePublicApiUrl = /^https?:\/\//i.test(normalizedPublicApiUrl);

const rawBackendApiUrl =
  process.env.BACKEND_API_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:3000/api" : "");
const normalizedBackendApiUrl = rawBackendApiUrl.replace(/\/+$/, "");
const isAbsoluteBackendApiUrl = /^https?:\/\//i.test(normalizedBackendApiUrl);

const rewriteApiTarget = isAbsolutePublicApiUrl
  ? normalizedPublicApiUrl
  : isAbsoluteBackendApiUrl
    ? normalizedBackendApiUrl
    : null;

let backendOrigin: string | null = null;
if (rewriteApiTarget) {
  try {
    backendOrigin = new URL(rewriteApiTarget).origin;
  } catch {
    backendOrigin = null;
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

    if (rewriteApiTarget) {
      rules.push({
        source: "/api/:path*",
        destination: `${rewriteApiTarget}/:path*`,
      });
    }

    if (backendOrigin) {
      rules.push({
        source: "/uploads/:path*",
        destination: `${backendOrigin}/uploads/:path*`,
      });
    }

    return rules;
  },
};

export default nextConfig;
