import {
  getDetailAnime,
  getAnimeEpisode,
  getAnimeEpisodeServer,
} from "@/lib/api";
import HlsPlayer from "@/components/HlsPlayer";
import Button from "@/components/button";
export default async function Page({ params }) {
  const { id } = await params;
  const { data } = await getDetailAnime(id);
  const { episodes } = await getAnimeEpisode(id);
  const server = await getAnimeEpisodeServer(id);
  const m3u8 =
    "http://localhost:8080/?url=https://cdn.dotstream.buzz/anime/807c4063f8fd3da43661d3087d697c7e/0c4e9cc114aa5c70e6592679cf82887b/master.m3u8&headers={Referer: https://streameeeeee.site/}";

  return (
    <div>
      <div className="flex flex-col items-center rounded-lg shadow-sm md:flex-row md:max-w-xl lg:max-w-full xl:max-w-full">
        <img
          className="object-cover w-full rounded-t-lg h-96 md:h-auto md:w-48 md:rounded-none md:rounded-s-lg"
          src={data.anime.info.poster}
          alt={data.anime.info.name}
        />
        <div className="flex flex-col justify-between p-4 leading-normal font-light text-white w-1/2">
          <h5 className="mb-2 text-2xl font-bold tracking-tight">
            {data.anime.info.name}
          </h5>
          <p className="mb-3 text-sm">{data.anime.info.description}</p>
        </div>
      </div>
      <div className="flex flex-col w-full">
        {episodes.map((eps) => (
          <Button
            episode={episodes}
            name={eps.title}
            number={eps.number}
            id={eps.episodeId}
            key={eps.number}
          />
        ))}
      </div>
      <div className="max-w-3xl mx-auto p-4">
        <HlsPlayer src={m3u8} />
      </div>
    </div>
  );
}
