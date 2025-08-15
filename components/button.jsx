"use client";
import { getAnimeEpisodeServer } from "@/lib/api";

export default function Button({ number, episode, id, name }) {
  async function getSingleEpisodeLink(episodeNumber) {
    const eps = episode.find((ep) => ep.episodeId === episodeNumber);
    if (!eps) {
      throw new Error(`Episode ${episodeNumber} not found`);
    }
    try {
      const response = await fetch(
        `https://api-aniwatch-two.vercel.app/api/v2/hianime/episode/sources?animeEpisodeId=${eps.episodeId}`
      );
      const data = await response.json();
      console.log("data", data);

      return {
        ...eps,
        sources: data,
      };
    } catch (error) {
      console.error(`Error fetching episode ${episodeNumber}:`, error);
      throw error;
    }
  }

  return (
    <a
      href="#"
      className="opacity-40 px-2 rounded-xl text-white text-sm mb-2"
      onClick={() => getSingleEpisodeLink(id)}
    >
      {number} : {name}
    </a>
  );
}
