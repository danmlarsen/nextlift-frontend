import type { NextConfig } from "next";

// Baseline security headers applied to every route. A strict Content-Security
// -Policy is intentionally deferred: reCAPTCHA v3, Vercel Analytics and the
// shadcn chart's inline styles would each need explicit allowances, so that is
// tracked as a follow-up rather than shipped half-configured.
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    // No `preload`: the directive only has effect served from a registrable
    // apex domain, and the app lives on a subdomain.
    value: "max-age=63072000; includeSubDomains",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
