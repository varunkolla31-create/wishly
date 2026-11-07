import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@node-rs/argon2", "pg"],
  poweredByHeader: false,
  outputFileTracingRoot: projectRoot,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }],
  },
  async headers() {
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://*.clerk.accounts.dev https://clerk.com https://*.clerk.com https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://i.ytimg.com https://*.ytimg.com https://img.clerk.com https://*.clerk.com https://*.r2.cloudflarestorage.com https://*.amazonaws.com",
      "font-src 'self' data:",
      "connect-src 'self' ws: https://*.clerk.accounts.dev https://clerk.com https://*.clerk.com https://api.clerk.com https://clerk-telemetry.com https://challenges.cloudflare.com https://*.r2.cloudflarestorage.com https://*.amazonaws.com",
      "frame-src https://www.youtube-nocookie.com https://www.youtube.com https://challenges.cloudflare.com https://*.clerk.accounts.dev",
      "media-src 'self' blob: https://*.r2.cloudflarestorage.com https://*.amazonaws.com",
      "worker-src 'self' blob:",
      "form-action 'self' https://*.clerk.accounts.dev https://clerk.com",
    ].join("; ");
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
      {
        source: "/w/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/c/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/contribute/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
