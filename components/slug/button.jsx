"use client";
import { useEffect, useState } from "react";
import { Stream } from "@/lib/api";
import HlsQualityPlayer from "./HlsQualityPlayer";
import Image from "next/image";

export default function EpisodePlayer({ episodes }) {
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [isLoadingPlayer, setIsLoadingPlayer] = useState(false);
  const [error, setError] = useState(null);

  // console.log("Selected Episode:", selectedEpisode);

  // Function to add proxy URL prefix
  const addProxyUrl = (url) => {
    if (!url || url.startsWith("http:localhost:8080")) {
      return url;
    }
    return `http:localhost:8080/?url=m3u8-proxy?url=${encodeURIComponent(url)}`;
  };

  // Process API response data for video sources
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

  // Fetch episode stream data - Fixed to handle single episode
  const fetchEpisodeStream = async (episode) => {
    try {
      setIsLoadingPlayer(true);
      setError(null);

      // Use episode.id as the episodeId for the API call
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

  // Handle episode click - Fixed to pass single episode
  const handleEpisodeClick = (episode) => {
    // If same episode is clicked, don't refetch
    if (selectedEpisode?.id === episode.id) {
      return;
    }

    fetchEpisodeStream(episode);
  };

  // Auto-select first episode on component mount - Fixed to pass single episode
  useEffect(() => {
    if (episodes && episodes.length > 0 && !selectedEpisode) {
      fetchEpisodeStream(episodes[0]); // Pass the first episode, not the entire array
    }
  }, [episodes]);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!episodes || episodes.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-gray-600">No episodes available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Video Player Section */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {selectedEpisode ? (
          <div className="space-y-4">
            {/* Episode Info Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex items-center space-x-4">
                <div className="relative w-24 h-16 rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={selectedEpisode.image}
                    alt={`Episode ${selectedEpisode.number}`}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    Episode {selectedEpisode.number}
                  </h2>
                  {selectedEpisode.title && (
                    <p className="text-blue-100">{selectedEpisode.title}</p>
                  )}
                  <p className="text-blue-200 text-sm">
                    Released: {formatDate(selectedEpisode.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Video Player */}
            <div className="p-6">
              {isLoadingPlayer ? (
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span>Loading video...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <div className="text-red-600">
                    <h3 className="font-medium">Error Loading Episode</h3>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                </div>
              ) : selectedEpisode.hasValidSources ? (
                <HlsQualityPlayer
                  sources={selectedEpisode.streamSources}
                  headers={selectedEpisode.headers}
                  poster={selectedEpisode.image}
                />
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                  <p className="text-yellow-800">
                    No video sources available for this episode
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Loading episode...</span>
            </div>
          </div>
        )}
      </div>

      {/* Episode List */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            Episodes ({episodes.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
          {episodes.map((episode) => (
            <button
              key={episode.id}
              onClick={() => handleEpisodeClick(episode)}
              className={`
                group relative bg-gray-50 rounded-lg overflow-hidden transition-all duration-200
                hover:bg-gray-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500
                ${
                  selectedEpisode?.id === episode.id
                    ? "ring-2 ring-blue-500 bg-blue-50"
                    : ""
                }
              `}
            >
              {/* Episode Image */}
              <div className="relative aspect-video w-full">
                <Image
                  src={episode.image}
                  alt={`Episode ${episode.number}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />

                {/* Episode Number Badge */}
                <div className="absolute top-2 left-2">
                  <span className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm font-medium">
                    {episode.number}
                  </span>
                </div>

                {/* Playing Indicator */}
                {selectedEpisode?.id === episode.id && (
                  <div className="absolute inset-0 bg-blue-600 bg-opacity-20 flex items-center justify-center">
                    <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Now Playing
                    </div>
                  </div>
                )}

                {/* Hover Play Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-white rounded-full p-3">
                      <svg
                        className="w-6 h-6 text-gray-800"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.68L9.54 5.98C8.87 5.55 8 6.03 8 6.82z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Episode Info */}
              <div className="p-3 text-left">
                <h4 className="font-medium text-gray-900 line-clamp-2">
                  {episode.title || `Episode ${episode.number}`}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(episode.createdAt)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === "development" && selectedEpisode && (
        <details className="bg-gray-100 p-4 rounded-lg text-sm">
          <summary className="cursor-pointer font-medium">Debug Info</summary>
          <pre className="mt-2 overflow-x-auto text-xs">
            {JSON.stringify(selectedEpisode, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
