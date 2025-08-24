import { getInfoAnime, getAnimeEpisode } from "@/lib/api";
// import Player from "@/components/player";
import VidstackPlayerWithLogVtt from "@/components/videos";
export default async function page({ params }) {
  const { slug } = await params;

  const [{ data }, { episodes }] = await Promise.all([
    getInfoAnime(slug),
    getAnimeEpisode(slug),
  ]);

  return (
    <div className="text-white">
      <h1 className="text-2xl font-bold text-center">Anime Info : {slug}</h1>
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
        {/* <Player episodes={episodes} /> */}
        <VidstackPlayerWithLogVtt sources={episodes} />
      </div>
    </div>
  );
}
