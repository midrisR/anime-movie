import { getInfoAnime, getAnimeEpisode } from "@/lib/api";
import Player from "@/components/player";
export default async function page({ params }) {
  const { id } = await params;
  const { data } = await getInfoAnime(id);
  const { episodes } = await getAnimeEpisode(id);

  return (
    <div className="text-white">
      <h1 className="text-2xl font-bold text-center">Anime Info : {id}</h1>

      <div className="flex flex-wrap mt-8">
        <div className="w-1/4">
          <img src={data.anime.info.poster} alt="" />
        </div>
        <div className="w-2/3">
          <p className="text-xs">{data.anime.info.description}</p>
          <div className="flex items-center mt-4">
            <p className="text-sm mr-3">Ganres :</p>
            {data.anime.moreInfo.genres.map((gen) => (
              <span key={gen} className="mr-2 text-sm">
                {gen},
              </span>
            ))}
          </div>
        </div>
      </div>
      {/* episode */}
      <div className="">
        <Player sources={episodes} episodes={episodes} />
      </div>
    </div>
  );
}
