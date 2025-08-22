"use client";

import { useState, useEffect } from "react";
import { getAnimeEpisodeLinkStream } from "@/lib/api";
import {
  MediaPlayer,
  MediaProvider,
  Poster,
  Track,
  Captions,
} from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
import { isHLSProvider } from "@vidstack/react";

// Import Vidstack CSS
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

export default function VidstackHlsPlayer({ sources }) {
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [isLoadingPlayer, setIsLoadingPlayer] = useState(false);
  const [current, setCurrentSource] = useState("");
  const [error, setError] = useState(null);
  const proxyUrl = "https://m3u8proxy-delta.vercel.app/m3u8-proxy?url=";
  console.log(sources);

  const processEpisodeStreamData = (streamData, episodeInfo) => {
    const processedSources =
      streamData.sources?.map((source) => ({
        ...source,
        url: source.url,
      })) || [];
    const subtitles = streamData.tracks.map((item) => ({
      ...item,
      url: proxyUrl + encodeURIComponent(item.url),
    }));

    return {
      ...episodeInfo,
      streamSources: processedSources,
      headers: streamData.headers || null,
      download: streamData.download || [],
      hasValidSources: processedSources.length > 0,
      subtitles: subtitles,
    };
  };

  const fetchEpisodeStream = async (episode) => {
    try {
      setIsLoadingPlayer(true);
      setError(null);
      const { data } = await getAnimeEpisodeLinkStream(episode.episodeId);
      if (!data || !data.sources || data.sources.length === 0) {
        throw new Error("No video sources available for this episode");
      }

      const processedEpisode = processEpisodeStreamData(data, episode);
      setSelectedEpisode(processedEpisode);
    } catch (error) {
      console.error("Error fetching episode stream:", error);
      setError(`Failed to load Episode ${episode.number}: ${error.message}`);
    } finally {
      setIsLoadingPlayer(false);
    }
  };

  useEffect(() => {
    fetchEpisodeStream(sources[0]);
  }, []);

  function onProviderChange(provider) {
    if (isHLSProvider(provider)) {
      provider.library = () => import("hls.js");
    }
  }

  if (selectedEpisode === null) {
    return (
      <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-600">
          <p className="text-sm">No HLS sources available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <MediaPlayer
        className="w-full aspect-video bg-black rounded-lg overflow-hidden"
        title="Episode Player"
        viewType="video"
        streamType="on-demand"
        logLevel="warn"
        crossOrigin
        playsInline
        onProviderChange={onProviderChange}
        load="play"
        src={[
          {
            src: `https://m3u8proxy-delta.vercel.app/m3u8-proxy?url=${selectedEpisode.streamSources[0]?.url}`,
            type: "application/x-mpegurl",
          },
        ]}
        subtitles={selectedEpisode.subtitles}
      >
        <MediaProvider>
          <Poster
            className="absolute inset-0 block h-full w-full opacity-0 transition-opacity data-[visible]:opacity-100 object-cover"
            src={`https://m3u8proxy-delta.vercel.app/m3u8-proxy?url=${selectedEpisode?.image}`}
            alt="Video poster"
            subtitles={selectedEpisode.subtitles}
          />

          <Track
            src={selectedEpisode.subtitles[1].url}
            label={selectedEpisode.subtitles[1].lang}
            language="en-US"
            kind="captions"
            type="vtt"
          />
        </MediaProvider>

        <DefaultVideoLayout
          thumbnails={`https://m3u8proxy-delta.vercel.app/m3u8-proxy?url=https://cdn.dotstream.buzz/anime/807c4063f8fd3da43661d3087d697c7e/46174470ff44b136e1c23ebfc6163b0e/subtitles/ind-4.vtt`}
          icons={defaultLayoutIcons}
        />
      </MediaPlayer>
    </div>
  );
}
