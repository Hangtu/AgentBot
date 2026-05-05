// @ts-check
import createNextIntlPlugin from "next-intl/plugin";
import { withSentryConfig } from "@sentry/nextjs";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // React Compiler — eliminates need for manual useMemo/useCallback
  reactCompiler: true,
  // Required for Docker multi-stage build optimization
  output: "standalone",
  experimental: {
    // Required for root-level not-found.tsx in Next.js 16
    globalNotFound: true,
    // Tree-shake heavy packages for smaller client bundles
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
};

const configWithIntl = withNextIntl(nextConfig);

export default withSentryConfig(configWithIntl, {
  // Sentry organization slug — update after creating your Sentry project
  org: process.env.SENTRY_ORG,

  // Sentry project slug
  project: process.env.SENTRY_PROJECT,

  // Required in CI/Vercel to upload source maps
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload a larger set of source maps for prettier stack traces
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers
  tunnelRoute: "/monitoring",

  webpack: {
    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
