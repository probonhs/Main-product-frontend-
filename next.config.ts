import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Standalone output builds a self-contained Node server at
   * `.next/standalone/server.js` (what Azure App Service runs via
   * `node server.js`). It is OFF by default because on Vercel it breaks the
   * post-build trace step (`onBuildComplete` fails with ENOENT on
   * `.next/next-server.js.nft.json`). Enable it only for a self-hosted build
   * (e.g. Azure) by setting BUILD_STANDALONE=1.
   */
  output: process.env.BUILD_STANDALONE ? "standalone" : undefined,
  outputFileTracingIncludes: {
    "/workspace": ["./fixtures/engine/ask-*.json"],
    "/api/workspace/ask": ["./fixtures/engine/ask-*.json"],
    "/workspace/ask": ["./fixtures/engine/ask-*.json"],
  },
  async headers() {
    return [{
      source: "/workspace/:path*",
      headers: [
        { key: "Referrer-Policy", value: "no-referrer" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Content-Security-Policy", value: `default-src 'self'; script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'${process.env.NODE_ENV === "development" ? " ws: wss:" : ""}; frame-ancestors 'none'; form-action 'self'; base-uri 'self'; object-src 'none'` },
      ],
    }];
  },
  /**
   * The development-only route badge sits bottom-left, exactly where the console's account
   * avatar is, and reads as a broken avatar. Off; compile and runtime errors still show.
   */
  devIndicators: false,
};

export default nextConfig;
