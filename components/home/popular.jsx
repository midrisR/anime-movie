import { getPopularAnime } from "@/lib/api";
import Link from "next/link";

export default async function Recent() {
  const { results } = await getPopularAnime();
  return (
    <div className="mb-12">
      <div className="w-full bg-rose-700 p-2 mb-4 text-white">
        Popular Anime
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 container mx-auto mt-8 ">
        {results.map((data) => (
          <Link href={`/${data.title}/${data.id}`} key={data.id}>
            <div className="flex flex-col justify-center w-3xs mx-auto mb-6">
              <img
                src={data.image}
                alt={data.title}
                width={200}
                className="h-80 object-cover rounded-2xl "
              />
              <p className="text-white font-light text-sm mt-1 mx-1">
                {data.title}
              </p>
              <p className="text-white font-light text-sm mt-1 mx-1">
                Episode {data.sub} / {data.dub}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
