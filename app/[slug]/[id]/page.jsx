import { getDetailAnime } from "@/lib/api";
import HlsQualityPlayer from "@/components/HlsQualityPlayer";
import Button from "@/components/button";
export default async function Page({ params }) {
  const { id } = await params;
  const data = await getDetailAnime({ id, provider: "animepahe" });
  const apiData = {
    headers: { Referer: "https://kwik.cx/" },
    sources: [
      {
        url: "https://vault-14.kwikie.ru/stream/14/11/097c68ce3a761108d42d377c827d54563028d3d6e1f17371598f311233796292/uwu.m3u8",
        isM3U8: true,
        quality: "SubsPlease · 360p",
        isDub: false,
      },
      {
        url: "https://vault-14.kwikie.ru/stream/14/11/106ee11fb2c1ebf14b58951c97c24562547e678bcc8734febc3216c0e7905b85/uwu.m3u8",
        isM3U8: true,
        quality: "SubsPlease · 720p",
        isDub: false,
      },
      {
        url: "https://vault-14.kwikie.ru/stream/14/11/ac148f425b7a88ce74d2df46d53825b8ed4cb0e02430bda3fa8827a718df3658/uwu.m3u8",
        isM3U8: true,
        quality: "SubsPlease · 1080p",
        isDub: false,
      },
      {
        url: "https://vault-14.kwikie.ru/stream/14/11/07e509f5cd5a351e5ffc1847480cc34d93b4ac71d667a3ff09dbe3d826088a95/uwu.m3u8",
        isM3U8: true,
        quality: "Yameii · 360p eng",
        isDub: true,
      },
      {
        url: "https://vault-14.kwikie.ru/stream/14/11/91e90df8f05c6d7cb8098ee6df58ffa212ae911df5c382a5b4487d772cc7059e/uwu.m3u8",
        isM3U8: true,
        quality: "Yameii · 720p eng",
        isDub: true,
      },
      {
        url: "https://vault-14.kwikie.ru/stream/14/11/31904f829586aca45de7c6ab2f07627ffed920e32389c20d61a1e3433e993b3f/uwu.m3u8",
        isM3U8: true,
        quality: "Yameii · 1080p eng",
        isDub: true,
      },
    ],
  };

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
          <Button
            key={eps.number}
            episode={data.episodes}
            className="bg-indigo-500 w-8 h-8 rounded-md"
            number={eps.number}
            episodeId={eps.id}
          >
            <span className="text-white">{eps.number}</span>
          </Button>
        ))}
      </div>
      <div className="flex flex-col w-full"></div>
      <div className="max-w-3xl mx-auto p-4">
        <HlsQualityPlayer sources={apiData.sources} />
      </div>
    </div>
  );
}
