import { recentEpisodes } from "@/lib/api";

export default async function Trending() {
  const { results } = await recentEpisodes();
  return (
    <div className="mb-12">
      <div className="w-full bg-rose-700 p-2 mb-4 text-white">
        Recently Updated
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 container mx-auto mt-8">
        {results.map((data) => (
          <div
            key={data.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:scale-105 transition-transform duration-300 relative"
          >
            <img
              src={data.image}
              alt={data.title}
              className="h-72 w-full object-cover"
            />
            <div className="p-3">
              <h2 className="text-xs font-semibold line-clamp-2 text-gray-700">
                {data.title || "No Title"}
              </h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
