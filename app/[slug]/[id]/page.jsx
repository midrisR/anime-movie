import { getDetailAnime } from "@/lib/api";
import HlsQualityPlayer from "@/components/HlsQualityPlayer";
import Button from "@/components/home/button";
export default async function Page({ params }) {
  const { id } = await params;
  const data = await getDetailAnime({ id, provider: "animepahe" });

  return (
    <div>
      <div className="flex flex-col items-center rounded-lg shadow-sm md:flex-row md:max-w-xl lg:max-w-full xl:max-w-full">
        <img
          className="object-cover w-full rounded-t-lg h-96 md:h-auto md:w-48 md:rounded-none md:rounded-s-lg"
          src={data.image}
          alt={data.title.english}
        />
        <div className="flex flex-col justify-between p-4 leading-normal font-light text-white w-max-3xl">
          <h5 className="mb-2 text-2xl font-bold tracking-tight">
            {data.title.english}
          </h5>
          <p className="mb-3 text-sm">{data.description}</p>
        </div>
      </div>
      <div className="mt-4 text-white text-sm">
        <p>Episode</p>
        {data.episodes.map((eps) => (
          <div className="" key={eps.number}>
            <span>{eps.number}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col w-full"></div>
      <div className="max-w-3xl mx-auto p-4">
        <Button episodes={data.episodes} />
      </div>
    </div>
  );
}
