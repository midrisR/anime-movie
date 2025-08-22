"use client";
import { useEffect, useState } from "react";
import { getAnimeEpisodeServer, getAnimeEpisodeLinkStream } from "@/lib/api";
import HlsQualityPlayer from "./HlsQualityPlayer";

export default function Button({ episodeId, episodes }) {
  const [episodeAnime, setEpisodeAnime] = useState([]);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Data contoh untuk testing - hapus ini saat API sudah siap
  const sampleApiData = {
    headers: {
      Referer:
        "https://megaplay.buzz/stream/s-2/dr-stone-science-future-part-2-19784?ep=141745/dub",
    },
    sources: [
      {
        url: "http://localhost:5000/m3u8-proxy?url=https://cdn.dotstream.buzz/anime/807c4063f8fd3da43â€¦7c7e/46174470ff44b136e1c23ebfc6163b0e/master.m3u8&header={Refere:https://megaplay.buzz/stream/s-2/dr-stone-science-future-part-2-19784?ep=141745/dub}",
        isM3U8: true,
        isDub: true,
      },
    ],
  };

  // Function to add proxy URL prefix
  const addProxyUrl = (sources) => {
    if (!sources || !Array.isArray(sources)) return [];

    return sources.map((source) => ({
      ...source,
      url: source.url.startsWith("http://localhost:5000/")
        ? source.url
        : `http://localhost:5000/m3u8-proxy?url=${encodeURIComponent(
            source.url
          )}`,
    }));
  };

  async function getSingleEpisodeLink(episodeId) {
    try {
      setIsLoading(true);
      const { data } = await getAnimeEpisodeServer(episodeId);

      // Add proxy URL to sources
      const proxiedSources = addProxyUrl(data.sources || sampleApiData.sources);

      // Set episode yang dipilih untuk dimainkan
      setSelectedEpisode({
        episodeId,
        sources: proxiedSources,
        headers: data.headers || sampleApiData.headers,
      });
    } catch (error) {
      console.error("Error fetching single episode:", error);
      // Fallback ke data contoh jika API error dengan proxy URL
      const proxiedSampleSources = addProxyUrl(sampleApiData.sources);
      setSelectedEpisode({
        episodeId,
        sources: proxiedSampleSources,
        headers: sampleApiData.headers,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function getAllEpisodeLinksSequential() {
    if (!episodes || episodes.length === 0) return;

    const results = [];
    setIsLoading(true);

    for (const episode of episodes) {
      try {
        const { data } = await getAnimeEpisodeLinkStream(episode.episodeId);

        // Add proxy URL to sources
        const proxiedSources = addProxyUrl(data.sources || []);

        results.push({
          ...episode,
          sources: proxiedSources,
          headers: data.headers || null,
          status: "success",
        });

        // Delay untuk mengurangi beban server
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error fetching episode ${episode.number}:`, error);
        results.push({
          ...episode,
          sources: [],
          headers: null,
          error: error.message,
          status: "error",
        });
      }
    }

    setEpisodeAnime(results);
    setIsLoading(false);

    // Auto-select episode pertama jika tidak ada yang dipilih
    if (results.length > 0 && !selectedEpisode) {
      const firstEpisode = results.find((ep) => ep.status === "success");
      if (firstEpisode) {
        const proxiedSources = addProxyUrl(firstEpisode.sources);
        setSelectedEpisode({
          episodeId: firstEpisode.episodeId,
          sources: proxiedSources,
          headers: firstEpisode.headers,
          title: firstEpisode.title,
          number: firstEpisode.number,
        });
      }
    }
  }

  const handleEpisodeClick = (episode) => {
    if (episode.status === "success" && episode.sources.length > 0) {
      // Ensure sources have proxy URL
      const proxiedSources = addProxyUrl(episode.sources);

      setSelectedEpisode({
        episodeId: episode.episodeId,
        sources: proxiedSources,
        headers: episode.headers,
        title: episode.title,
        number: episode.number,
      });
    } else {
      // Jika data episode tidak tersedia, coba fetch ulang
      getSingleEpisodeLink(episode.episodeId);
    }
  };

  useEffect(() => {
    if (episodes && episodes.length > 0) {
      getAllEpisodeLinksSequential();
    } else if (episodeId) {
      // Jika hanya single episode
      getSingleEpisodeLink(episodeId);
    }
  }, [episodes, episodeId]);

  return (
    <div className="space-y-6">
      {/* Video Player */}
      <div className="w-full">
        {selectedEpisode ? (
          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold">
                Now Playing: Episode {selectedEpisode.number}
              </h3>
              {selectedEpisode.title && (
                <p className="text-gray-600">{selectedEpisode.title}</p>
              )}
            </div>

            <HlsQualityPlayer
              sources={selectedEpisode.sources}
              headers={selectedEpisode.headers}
            />
          </div>
        ) : (
          <div className="bg-gray-100 p-8 rounded-lg text-center">
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span>Loading episodes...</span>
              </div>
            ) : (
              <p className="text-gray-600">
                Pilih episode untuk mulai menonton
              </p>
            )}
          </div>
        )}
      </div>

      {/* Episode List */}
      {episodeAnime.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h4 className="text-lg font-semibold text-gray-800">
              Episode List
            </h4>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {episodeAnime.map((episode) => (
              <button
                key={episode.episodeId || episode.number}
                type="button"
                onClick={() => handleEpisodeClick(episode)}
                disabled={episode.status === "error"}
                className={`
                  w-full text-left px-6 py-4 border-b border-gray-100 hover:bg-gray-50 
                  transition-colors duration-200 focus:outline-none focus:bg-blue-50
                  ${
                    selectedEpisode?.episodeId === episode.episodeId
                      ? "bg-blue-50 border-l-4 border-l-blue-500"
                      : ""
                  }
                  ${
                    episode.status === "error"
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="bg-gray-200 px-3 py-1 rounded-full text-sm font-medium">
                        {episode.number}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {episode.title || `Episode ${episode.number}`}
                        </p>
                        {episode.error && (
                          <p className="text-sm text-red-600 mt-1">
                            {episode.error}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {episode.status === "success" && (
                      <span className="text-green-600 text-sm">✓</span>
                    )}
                    {episode.status === "error" && (
                      <span className="text-red-600 text-sm">✗</span>
                    )}
                    {selectedEpisode?.episodeId === episode.episodeId && (
                      <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                        Playing
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Debug Info - hapus di production */}
      {process.env.NODE_ENV === "development" && selectedEpisode && (
        <details className="bg-gray-100 p-4 rounded-lg text-sm">
          <summary className="cursor-pointer font-medium">Debug Info</summary>
          <pre className="mt-2 overflow-x-auto">
            {JSON.stringify(selectedEpisode, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
