"use client";

import { useMemo, useState, useEffect } from "react";
import { Stream } from "@/lib/api";
import { MediaPlayer, MediaProvider, Poster } from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
import { isHLSProvider } from "@vidstack/react";

// Import Vidstack CSS
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

export default function VidstackHlsPlayer({ sources = [], poster }) {
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [isLoadingPlayer, setIsLoadingPlayer] = useState(false);
  const [current, setCurrentSource] = useState("");
  const [error, setError] = useState(null);
  const processEpisodeStreamData = (streamData, episodeInfo) => {
    const processedSources =
      streamData.sources?.map((source) => ({
        ...source,
        url: source.url,
      })) || [];

    return {
      ...episodeInfo,
      streamSources: processedSources,
      headers: streamData.headers || null,
      download: streamData.download || [],
      hasValidSources: processedSources.length > 0,
    };
  };

  const fetchEpisodeStream = async (episode) => {
    try {
      setIsLoadingPlayer(true);
      setError(null);
      const data = await Stream(episode.id);
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
    fetchEpisodeStream(sources[0]); // Pass the first episode, not the entire array
  }, []);
  console.log("selectedEpisode", selectedEpisode);

  // Handle provider configuration for HLS
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
      {/* Quality Selector */}
      {isLoadingPlayer ? (
        <p>Loading</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {selectedEpisode.streamSources?.map((opt) => (
              <button
                key={opt.url}
                onClick={() => setCurrentSource(opt)}
                className={`px-3 py-1 rounded border text-sm transition-colors ${
                  current?.url === opt.url
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {opt.quality}
              </button>
            ))}
          </div>

          <MediaPlayer
            className="w-full aspect-video bg-black rounded-lg overflow-hidden"
            title="Episode Player"
            src={{
              src: `https://proxy-puce-phi.vercel.app/m3u8-proxy?url=${selectedEpisode.streamSources[0]?.url}`,
              type: "application/x-mpegurl",
            }}
            crossOrigin
            playsInline
            preload="none"
            onProviderChange={onProviderChange}
            load="play"
          >
            <MediaProvider>
              <Poster
                className="absolute inset-0 block h-full w-full opacity-0 transition-opacity data-[visible]:opacity-100 object-cover"
                src={poster}
                alt="Video poster"
              />
            </MediaProvider>

            <DefaultVideoLayout
              thumbnails=""
              icons={defaultLayoutIcons}
              noScrubGesture
            />
          </MediaPlayer>
        </>
      )}
    </div>
  );
}
