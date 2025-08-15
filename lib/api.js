export const getHomeAnime = async () => {
  const data = await fetch(
    "https://api-aniwatch-two.vercel.app/api/v2/hianime/home"
  );
  const res = await data.json();
  return res;
};

// GET TRENDING ANIME
export const getTrendingAnime = async () => {
  const data = await fetch(
    "https://anime-app-gold.vercel.app/meta/anilist/trending?page=1&perPage=10"
  );
  const res = await data.json();
  return res;
};
// GET POPULAR ANIME
export const getPopularAnime = async () => {
  const data = await fetch(
    "https://anime-app-gold.vercel.app/anime/zoro/most-popular?page=1"
  );
  const res = await data.json();
  return res;
};
// last update
export const recentEpisodes = async () => {
  const data = await fetch(
    "https://anime-app-gold.vercel.app/anime/zoro/recent-episodes?page=1"
  );
  const res = await data.json();
  return res;
};

// detail anime
export const getDetailAnime = async (id) => {
  const data = await fetch(
    `https://api-aniwatch-two.vercel.app/api/v2/hianime/anime/${id}`
  );
  const res = await data.json();
  return res;
};
export const getAnimeEpisode = async (id) => {
  const res = await fetch(
    `https://api-aniwatch-two.vercel.app/api/v2/hianime/anime/${id}/episodes`
  );
  const { data } = await res.json();
  return data;
};
export const getAnimeEpisodeServer = async (id) => {
  const resp = await fetch(
    `https://api-aniwatch-two.vercel.app/api/v2/hianime/episode/servers?animeEpisodeId=${id}`
  );
  const { data } = await resp.json();
  return data;
};
export const getAnimeEpisodeLink = async (id, server) => {
  const resp = await fetch(
    `https://api-aniwatch-two.vercel.app/api/v2/hianime/episode/sources?animeEpisodeId=${id}?server=${server}&category={dub || sub || raw}`
  );
  const data = await resp.json();
};
