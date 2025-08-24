// app/watch/page.jsx
import Player from "@/components/player";
import Link from "next/link";

export default async function Page() {
  const response = await fetch("http://localhost:4444/api/top-ten");
  const { results } = await response.json();
  const url = (text) => {
    return text
      .toLowerCase() // jadi huruf kecil semua
      .replace(/[^a-z0-9\s-]/g, "") // hapus semua karakter selain huruf, angka, spasi, dan "-"
      .trim() // hapus spasi di awal/akhir
      .replace(/\s+/g, "-"); // ganti spasi jadi "-"
  };
  return (
    <main className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {results.month.map((card) => (
          <Link href={`/example/${url(card.id)}`} key={card.id}>
            <div className="flex flex-col justify-center w-3xs mx-auto mb-6">
              <img
                src={card.poster}
                alt={card.title}
                width={200}
                className="h-80 object-cover rounded-2xl "
              />
              <p className="text-white font-light text-sm mt-1 mx-1">
                {card.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
