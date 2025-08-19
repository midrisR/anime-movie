"use client";
import { useEffect, useRef, useState } from "react";

export default function HlsQualityPlayer({ sources, headers = null }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qualities, setQualities] = useState([]);
  const [currentQuality, setCurrentQuality] = useState(-1); // -1 untuk auto
  const [hlsSupported, setHlsSupported] = useState(false);
  console.log("sources", sources);

  useEffect(() => {
    // Cek dukungan HLS
    const video = videoRef.current;
    if (!video) return;

    // Import HLS.js secara dinamis
    import("hls.js").then((module) => {
      const Hls = module.default;

      if (Hls.isSupported()) {
        setHlsSupported(true);
        initializeHls(Hls);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari native HLS support
        setHlsSupported(true);
        loadVideoNatively();
      } else {
        setError("HLS tidak didukung di browser ini");
        setIsLoading(false);
      }
    });

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [sources]);

  const initializeHls = (Hls) => {
    const video = videoRef.current;
    if (!video || !sources || sources.length === 0) {
      setError("Tidak ada sumber video tersedia");
      setIsLoading(false);
      return;
    }

    // Ambil source pertama (bisa diperluas untuk multiple sources)
    const source = sources[0];
    if (!source.url) {
      setError("URL video tidak valid");
      setIsLoading(false);
      return;
    }

    const hls = new Hls({
      enableWorker: false,
      lowLatencyMode: true,
      backBufferLength: 90,
    });

    hlsRef.current = hls;

    // Event listeners
    hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      console.log("Video attached to HLS");
    });

    hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
      console.log("Manifest parsed, qualities available:", data.levels);

      // Set available qualities
      const availableQualities = data.levels.map((level, index) => ({
        index,
        height: level.height,
        width: level.width,
        bitrate: level.bitrate,
        label: `${level.height}p`,
      }));

      setQualities(availableQualities);
      setIsLoading(false);
    });

    hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
      console.log("Quality switched to:", data.level);
    });

    hls.on(Hls.Events.ERROR, (event, data) => {
      console.error("HLS Error:", data);

      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            setError("Error jaringan saat memuat video");
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            setError("Error media saat memutar video");
            hls.recoverMediaError();
            break;
          default:
            setError("Error fatal saat memutar video");
            hls.destroy();
            break;
        }
      }
    });

    // Load video
    try {
      hls.attachMedia(video);
      hls.loadSource(source.url);
    } catch (err) {
      console.error("Error loading video:", err);
      setError("Gagal memuat video");
      setIsLoading(false);
    }
  };

  const loadVideoNatively = () => {
    const video = videoRef.current;
    if (!video || !sources || sources.length === 0) {
      setError("Tidak ada sumber video tersedia");
      setIsLoading(false);
      return;
    }

    video.src = sources[0].url;
    setIsLoading(false);
  };

  const handleQualityChange = (qualityIndex) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = parseInt(qualityIndex);
      setCurrentQuality(parseInt(qualityIndex));
    }
  };

  const handleVideoLoad = () => {
    setIsLoading(false);
  };

  const handleVideoError = () => {
    setError("Error saat memuat video");
    setIsLoading(false);
  };

  if (!sources || sources.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-gray-100 rounded-lg p-8 text-center">
        <p className="text-gray-600">Tidak ada sumber video tersedia</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-black rounded-lg overflow-hidden shadow-lg">
      {/* Video Player */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="flex items-center space-x-2 text-white">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <span>Loading video...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-red-900 bg-opacity-75 flex items-center justify-center z-10">
            <div className="text-white text-center">
              <p className="text-lg font-medium">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          className="w-full h-auto"
          controls
          preload="metadata"
          onLoadStart={() => setIsLoading(true)}
          onCanPlay={handleVideoLoad}
          onError={handleVideoError}
          onLoadedData={() => setIsLoading(false)}
        >
          <p className="text-white p-4">
            Browser Anda tidak mendukung pemutar video HTML5.
          </p>
        </video>

        {/* Quality Selector */}
        {qualities.length > 0 && (
          <div className="absolute top-4 right-4 z-20">
            <select
              value={currentQuality}
              onChange={(e) => handleQualityChange(e.target.value)}
              className="bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              <option value="-1">Auto</option>
              {qualities.map((quality) => (
                <option key={quality.index} value={quality.index}>
                  {quality.label} ({Math.round(quality.bitrate / 1000)}kbps)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="p-4 bg-gray-900 text-white">
        <div className="flex justify-between items-center text-sm">
          <div>
            <span className="text-gray-400">Status: </span>
            <span
              className={
                isLoading
                  ? "text-yellow-400"
                  : error
                  ? "text-red-400"
                  : "text-green-400"
              }
            >
              {isLoading ? "Loading..." : error ? "Error" : "Ready"}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {sources[0].isDub && (
              <span className="bg-blue-600 px-2 py-1 rounded text-xs">DUB</span>
            )}

            <span className="text-gray-400">
              HLS: {hlsSupported ? "✓" : "✗"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
