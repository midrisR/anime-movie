import { getHomeAnime } from "@/lib/api";
import Link from "next/link";
export default async function Page() {
  const { data } = await getHomeAnime();

  const url = (text) => {
    return text
      .toLowerCase() // jadi huruf kecil semua
      .replace(/[^a-z0-9\s-]/g, "") // hapus semua karakter selain huruf, angka, spasi, dan "-"
      .trim() // hapus spasi di awal/akhir
      .replace(/\s+/g, "-"); // ganti spasi jadi "-"
  };
  return (
    <div className="mb-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 container mx-auto mt-8 ">
        {data.spotlightAnimes.map((anime) => (
          <Link href={`/${url(anime.id)}`} key={anime.id}>
            <div className="flex flex-col justify-center w-3xs mx-auto mb-6">
              <img
                src={anime.poster}
                alt={anime.name}
                width={200}
                className="h-80 object-cover rounded-2xl "
              />
              <p className="text-white font-light text-sm mt-1 mx-1">
                {anime.name}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
