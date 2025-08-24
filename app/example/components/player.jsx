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

export default function Player({ sources }) {
  const BASE = process.env.API_URL;

  async function getAnimeEpisodeLinkStream(id) {
    const res = await fetch(`${BASE}/api/stream?id=${id}&server=hd-1&type=sub`);
    const { results } = await res.json();

    return results;
  }

  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [isLoadingPlayer, setIsLoadingPlayer] = useState(false);

  // Function to convert language names to ISO codes
  const processEpisodeStreamData = (streamData, episodeInfo) => {
    return {
      streamSources: streamData.streamingLink.link.file,
      headers: streamData.headers,
      download: streamData.download,
      subtitles: streamData.streamingLink.tracks,
    };
  };

  const fetchEpisodeStream = async (episode) => {
    try {
      setIsLoadingPlayer(true);
      const data = await getAnimeEpisodeLinkStream(episode);
      const processedEpisode = processEpisodeStreamData(data, episode);
      setSelectedEpisode(processedEpisode);
    } catch (error) {
      console.error("Error fetching episode stream:", error);
    } finally {
      setIsLoadingPlayer(false);
    }
  };
  console.log("selectedEpisode", selectedEpisode);

  useEffect(() => {
    if (sources && sources.episodes.length > 0) {
      fetchEpisodeStream(sources.episodes[0].id);
    }
  }, [sources]);

  function onProviderChange(provider) {
    if (isHLSProvider(provider)) {
      provider.library = () => import("hls.js");
    }
  }

  // Debug function to check subtitle loading
  const handleSubtitleLoad = (subtitle) => {
    console.log("Subtitle loaded:", subtitle);
  };

  const handleSubtitleError = (error, subtitle) => {
    console.error("Subtitle error:", error, subtitle);
  };

  if (selectedEpisode === null) {
    return (
      <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-600">
          <p className="text-sm">
            {isLoadingPlayer ? "Loading player..." : "No HLS sources available"}
          </p>
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
            src: `${proxyUrl}${encodeURIComponent(
              selectedEpisode.streamSources
            )}`,
            type: "application/x-mpegurl",
          },
        ]}
      >
        <MediaProvider>
          <Poster
            className="absolute inset-0 block h-full w-full opacity-0 transition-opacity data-[visible]:opacity-100 object-cover"
            src={
              selectedEpisode?.image
                ? `${proxyUrl}${encodeURIComponent(selectedEpisode.image)}`
                : undefined
            }
            alt="Video poster"
          />

          {/* Subtitle tracks */}
          {selectedEpisode.subtitles?.map((subtitle, index) => (
            <Track
              key={index}
              src={`https://m3u8proxy-delta.vercel.app/m3u8-proxy?url=${subtitle.file}`}
              label={subtitle.label} // Human readable name for UI
              kind={subtitle.kind}
              type="vtt"
              default={subtitle.default}
            />
          ))}
        </MediaProvider>

        <DefaultVideoLayout
          icons={defaultLayoutIcons}
          thumbnails={selectedEpisode.subtitles[0].url}
        />

        {/* Enable captions component */}
        <Captions className="absolute inset-0 bottom-2 z-10 select-none break-words opacity-100 transition-opacity duration-300" />
      </MediaPlayer>

      {/* Debug info */}
      {process.env.NODE_ENV === "development" && (
        <div className="text-xs text-gray-500 mt-2">
          <p>Subtitles loaded: {selectedEpisode.subtitles?.length || 0}</p>
          <details>
            <summary>Subtitle URLs</summary>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(
                selectedEpisode.subtitles?.map((s) => ({
                  lang: s.lang,
                  langCode: s.langCode,
                  url: s.url,
                  default: s.isDefault,
                })),
                null,
                2
              )}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
