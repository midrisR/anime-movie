"use client";
import { getAnimeEpisodeLink } from "@/lib/api";

export default function Button({ number, episodeId }) {
  async function getSingleEpisodeLink() {
    try {
      const data = await getAnimeEpisodeLink(episodeId);
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <a
      href="#"
      className="block opacity-40 px-2 rounded-xl text-white text-sm mb-2"
      onClick={getSingleEpisodeLink}
    >
      Episode {number}
    </a>
  );
}
