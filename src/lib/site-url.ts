function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  // Vercel builds without the var (e.g. previews): use the deployment URL so
  // metadata/OG images resolve to the host actually serving them.
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3002"; // matches `pnpm dev` (-p 3002)
}

export const SITE_URL = resolveSiteUrl();
