/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "https://cdn.noitatnemucod.net" },
      { protocol: "https", hostname: "i.animepahe.ru" },
      { protocol: "https", hostname: "cdn.myanimelist.net" },
      { protocol: "https", hostname: "s4.anilist.co" }, // opsional
    ],
  },
};

export default nextConfig;
