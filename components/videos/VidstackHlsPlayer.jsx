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

export default function VidstackHlsPlayer({ sources, additionalVttUrls }) {
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [isLoadingPlayer, setIsLoadingPlayer] = useState(false);
  const [additionalSubtitles, setAdditionalSubtitles] = useState([]);
  const [error, setError] = useState(null);
  const proxyUrl = "https://m3u8proxy-delta.vercel.app/m3u8-proxy?url=";
  console.log(additionalVttUrls);

  // Function to convert language names to ISO codes
  const getLanguageCode = (langName) => {
    const langMap = {
      English: "en",
      Indonesian: "id",
      "Chinese - Traditional": "zh-TW",
      Korean: "ko",
      Malay: "ms",
      Thai: "th",
      Vietnamese: "vi",
    };
    return langMap[langName] || langName.toLowerCase().substring(0, 2);
  };

  // Enhanced function to extract proper VTT URLs
  const extractVttUrlsFromLog = (logData) => {
    if (typeof logData === "string") {
      const lines = logData.split("\n");

      // Filter untuk URL VTT yang valid
      const vttUrls = lines.filter((line) => {
        const trimmedLine = line.trim();

        // Skip empty lines
        if (!trimmedLine) return false;

        // Check if it contains .vtt and is a proper VTT file
        if (trimmedLine.includes(".vtt")) {
          // Skip fragmented subtitle entries (time codes, individual text)
          if (
            trimmedLine.includes("--") ||
            trimmedLine.includes("%2520--%253E") ||
            trimmedLine.match(/^\d{2}:\d{2}\.\d{3}/) ||
            !trimmedLine.startsWith("http")
          ) {
            return false;
          }
          return true;
        }

        return false;
      });

      // Remove duplicates
      const uniqueUrls = [...new Set(vttUrls)];

      console.log("Extracted VTT URLs:", uniqueUrls);
      return uniqueUrls;
    }

    return Array.isArray(logData) ? logData : [];
  };

  // Enhanced function to fetch and process VTT files
  const fetchVttFile = async (vttUrl, label = "External", langCode = "en") => {
    try {
      console.log(`Attempting to fetch VTT from: ${vttUrl}`);

      // Convert ts-proxy to m3u8-proxy if needed
      let processedUrl = vttUrl;
      if (vttUrl.includes("ts-proxy")) {
        processedUrl = vttUrl.replace("ts-proxy", "m3u8-proxy");
        console.log(`Converted URL to: ${processedUrl}`);
      }

      const response = await fetch(processedUrl, {
        method: "GET",
        headers: {
          Accept: "text/vtt, text/plain, */*",
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status} - ${response.statusText}`
        );
      }

      const vttContent = await response.text();
      console.log(`VTT Content preview: ${vttContent.substring(0, 200)}...`);

      // Validate if it's proper VTT content
      if (!vttContent.includes("WEBVTT") && !vttContent.includes("-->")) {
        console.warn(`Invalid VTT content from ${vttUrl}`);
        return null;
      }

      // Create blob URL for the VTT content
      const blob = new Blob([vttContent], { type: "text/vtt" });
      const blobUrl = URL.createObjectURL(blob);

      return {
        url: blobUrl,
        lang: label,
        langCode: langCode,
        isDefault: false,
        isExternal: true,
        originalUrl: vttUrl,
      };
    } catch (error) {
      console.error(`Error fetching VTT from ${vttUrl}:`, error);
      return null;
    }
  };

  // Process episode stream data with additional VTT support
  const processEpisodeStreamData = (streamData, episodeInfo) => {
    const processedSources =
      streamData.sources?.map((source) => ({
        ...source,
        url: source.url,
      })) || [];

    const subtitles =
      streamData.tracks?.map((item, index) => ({
        ...item,
        url: proxyUrl + encodeURIComponent(item.url),
        langCode: getLanguageCode(item.lang),
        isDefault:
          item.lang === "English" ||
          (index === 0 && !streamData.tracks.some((t) => t.lang === "English")),
        isExternal: false,
      })) || [];

    return {
      ...episodeInfo,
      streamSources: processedSources,
      headers: streamData.headers || null,
      download: streamData.download || [],
      hasValidSources: processedSources.length > 0,
      subtitles: subtitles,
    };
  };

  // Fetch additional VTT files
  useEffect(() => {
    console.log(additionalVttUrls.length);

    async function loadAdditionalVttFiles() {
      if (additionalVttUrls.length === 0) return;
      try {
        const vttUrls = extractVttUrlsFromLog(additionalVttUrls);

        if (vttUrls.length === 0) {
          console.warn("No valid VTT URLs found in the provided data");
          return;
        }

        const fetchPromises = vttUrls.map((url, index) =>
          fetchVttFile(url, `External EN ${index + 1}`, "en")
        );

        const results = await Promise.allSettled(fetchPromises);
        const validSubtitles = results
          .filter(
            (result) => result.status === "fulfilled" && result.value !== null
          )
          .map((result) => result.value);
        console.log(results);

        console.log("Successfully loaded external subtitles:", validSubtitles);
        setAdditionalSubtitles(validSubtitles);
      } catch (error) {
        console.error("Error loading additional VTT files:", error);
        setError("Failed to load external subtitles");
      }
    }
    loadAdditionalVttFiles();
    // Cleanup blob URLs on unmount
    return () => {
      additionalSubtitles.forEach((subtitle) => {
        if (subtitle.url && subtitle.url.startsWith("blob:")) {
          URL.revokeObjectURL(subtitle.url);
        }
      });
    };
  }, [additionalVttUrls]);

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
    if (sources && sources.length > 0) {
      fetchEpisodeStream(sources[0]);
    }
  }, [sources]);

  function onProviderChange(provider) {
    if (isHLSProvider(provider)) {
      provider.library = () => import("hls.js");
    }
  }

  // Debug function to check subtitle loading
  const handleSubtitleLoad = (subtitle) => {
    console.log("Subtitle loaded successfully:", subtitle);
  };

  const handleSubtitleError = (error, subtitle) => {
    console.error("Subtitle loading error:", error, subtitle);
  };

  // Combine original subtitles with additional VTT files
  const allSubtitles = [
    ...(selectedEpisode?.subtitles || []),
    ...additionalSubtitles,
  ];

  // Set default subtitle (prefer English)
  const subtitlesWithDefault = allSubtitles.map((subtitle, index) => ({
    ...subtitle,
    isDefault: subtitle.langCode === "en" && index === 0,
  }));

  if (error) {
    return (
      <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

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
              selectedEpisode.streamSources[0]?.url
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
          <Track
            src="https://m3u8proxy-delta.vercel.app/m3u8-proxy?url=https://1oe.lostproject.club/anime/807c4063f8fd3da43661d3087d697c7e/46174470ff44b136e1c23ebfc6163b0e/subtitles/eng-2.vtt"
            label="english"
            language="en-US"
            kind="subtitles"
            type="vtt"
            default={true}
          />
          {/* All subtitle tracks (original + additional VTT) */}
          {/* {subtitlesWithDefault.map((subtitle, index) => (
            <Track
              key={`${subtitle.langCode}-${index}-${
                subtitle.isExternal ? "ext" : "orig"
              }`}
              src={subtitle.url}
              label={subtitle.lang}
              language={subtitle.langCode}
              kind="subtitles"
              type="vtt"
              default={subtitle.isDefault && index === 0} // Only first English subtitle as default
              onLoad={() => handleSubtitleLoad(subtitle)}
              onError={(e) => handleSubtitleError(e, subtitle)}
            />
          ))} */}
        </MediaProvider>

        <DefaultVideoLayout
          icons={defaultLayoutIcons}
          thumbnails={selectedEpisode.subtitles?.[0]?.url}
        />

        {/* Enable captions component */}
        <Captions className="absolute inset-0 bottom-2 z-10 select-none break-words opacity-100 transition-opacity duration-300" />
      </MediaPlayer>

      {/* Enhanced Debug info */}
      {process.env.NODE_ENV === "development" && (
        <div className="text-xs text-gray-500 mt-2 space-y-2">
          <div className="flex justify-between">
            <span>
              Original subtitles: {selectedEpisode.subtitles?.length || 0}
            </span>
            <span>External subtitles: {additionalSubtitles.length}</span>
            <span>Total: {allSubtitles.length}</span>
          </div>

          {allSubtitles.length > 0 && (
            <details>
              <summary>Subtitle Details ({allSubtitles.length})</summary>
              <div className="mt-2 space-y-1">
                {allSubtitles.map((subtitle, index) => (
                  <div key={index} className="p-2 bg-gray-100 rounded">
                    <div>
                      <strong>Label:</strong> {subtitle.lang}
                    </div>
                    <div>
                      <strong>Language:</strong> {subtitle.langCode}
                    </div>
                    <div>
                      <strong>Default:</strong>{" "}
                      {subtitle.isDefault ? "Yes" : "No"}
                    </div>
                    <div>
                      <strong>External:</strong>{" "}
                      {subtitle.isExternal ? "Yes" : "No"}
                    </div>
                    <div>
                      <strong>URL:</strong>{" "}
                      {subtitle.isExternal
                        ? subtitle.originalUrl
                        : subtitle.url}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
