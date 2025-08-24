// Helper component untuk memuat VTT dari log file
import VidstackHlsPlayer from "./VidstackHlsPlayer";
export default function VidstackPlayerWithLogVtt({ sources }) {
  const cleanVttUrl =
    "https://m3u8proxy-delta.vercel.app/m3u8-proxy?url=https://1oe.lostproject.club/anime/807c4063f8fd3da43661d3087d697c7e/46174470ff44b136e1c23ebfc6163b0e/subtitles/eng-2.vtt";
  return (
    <VidstackHlsPlayer sources={sources} additionalVttUrls={[cleanVttUrl]} />
  );
}
