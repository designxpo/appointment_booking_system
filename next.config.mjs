/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Self-contained server bundle for Docker / DigitalOcean / Hostinger.
  output: "standalone",
  images: {
    remotePatterns: [
      // Supabase Storage public bucket URLs (CMS-uploaded images)
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
