"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

export default function HlsPlayer({
  src,
  poster,
  autoPlay = false,
  controls = true,
  muted = false,
  playsInline = true,
  useProxy = true, // default: true karena perlu Referer
}) {
  const videoRef = useRef(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    setErr("");
    const video = videoRef.current;
    if (!video || !src) return;

    const finalSrc = useProxy
      ? `http://localhost:8080/?url=${encodeURIComponent(src)}`
      : src;

    // Cek dukungan codec tapi tetap lanjutkan
    const audioCodecSupported = MediaSource.isTypeSupported(
      'audio/mp4;codecs="mp4a.40.1"'
    );
    const videoCodecSupported = MediaSource.isTypeSupported(
      'video/mp4;codecs="avc1.42E01E"'
    );

    console.log("Audio codec (mp4a.40.1) supported:", audioCodecSupported);
    console.log("Video codec (avc1.42E01E) supported:", videoCodecSupported);

    if (!audioCodecSupported) {
      console.warn(
        "Browser mungkin tidak mendukung codec audio, tapi tetap mencoba..."
      );
    }

    // Coba native player dulu (lebih stabil untuk codec yang tidak didukung)
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      console.log("Menggunakan native HLS player");
      video.src = finalSrc;
      video.addEventListener(
        "error",
        (e) => {
          console.error("Native player error:", e);
          setErr(
            "Video error (native). Cek CORS/Referer/token atau codec tidak didukung."
          );
        },
        { once: true }
      );
      return;
    }

    // Gunakan HLS.js dengan konfigurasi khusus untuk codec issues
    if (Hls.isSupported()) {
      const hls = new Hls({
        debug: true,
        enableWorker: false, // Disable worker untuk debugging
        ...(useProxy && {
          fetchSetup: (ctx, init) => {
            const proxied = ` http://localhost:8080/?url=${encodeURIComponent(
              ctx.url
            )}`;
            return new Request(proxied, init);
          },
        }),
        autoStartLoad: true,
        manifestLoadingTimeOut: 10000,
        manifestLoadingMaxRetry: 4,
        levelLoadingTimeOut: 10000,
        fragLoadingTimeOut: 20000,
        forceKeyFrameOnDiscontinuity: true,
        abrEwmaDefaultEstimate: 500000,
      });

      hls.loadSource(finalSrc);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        console.log("Manifest berhasil di-parse:", data);
        if (data.levels && data.levels.length > 0) {
          console.log(
            "Available levels:",
            data.levels.map((l) => `${l.width}x${l.height} ${l.bitrate}bps`)
          );
        }
        if (data.audioTracks && data.audioTracks.length > 0) {
          console.log(
            "Audio tracks:",
            data.audioTracks.map((t) => `${t.name} (${t.lang})`)
          );
        }
      });

      hls.on(Hls.Events.LEVEL_LOADED, (event, data) => {
        console.log(
          "Level loaded:",
          data.level,
          "Duration:",
          data.details.totalduration
        );
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS Error:", data);

        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("Fatal media error, mencoba recovery...");
              if (data.details === "bufferAddCodecError") {
                setErr(
                  `Codec tidak didukung: ${
                    data.mimeType || "unknown"
                  }. Coba browser lain.`
                );
              } else {
                hls.recoverMediaError();
              }
              break;

            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log("Network error, reload source...");
              setErr("Network error. Memeriksa koneksi...");
              setTimeout(() => {
                if (hls) {
                  hls.startLoad();
                  setErr(""); // Clear error setelah retry
                }
              }, 1000);
              break;

            default:
              console.error("Error fatal yang tidak bisa di-recover:", data);
              setErr(`HLS fatal error: ${data.details || data.type}`);

              // Fallback ke native player sebagai opsi terakhir
              if (video.canPlayType("application/vnd.apple.mpegurl")) {
                console.log("Fallback ke native player...");
                setTimeout(() => {
                  video.src = finalSrc;
                  setErr(""); // Clear error saat fallback
                }, 1000);
              }
              break;
          }
        } else {
          // Non-fatal errors
          console.warn("HLS non-fatal error:", data);
          if (data.details === "bufferAddCodecError") {
            setErr(
              "Warning: Codec mungkin tidak sepenuhnya didukung, tapi mencoba tetap memutar..."
            );
          }
        }
      });

      return () => {
        if (hls) {
          hls.destroy();
        }
      };
    }

    // Fallback terakhir - direct assignment
    console.log("Fallback ke direct video src assignment");
    video.src = finalSrc;
    video.addEventListener(
      "error",
      (e) => {
        console.error("Direct video error:", e);
        setErr("Browser tidak mendukung format video ini.");
      },
      { once: true }
    );
  }, [src, useProxy]);

  return (
    <div className="w-full">
      <video
        ref={videoRef}
        poster={poster}
        controls={controls}
        autoPlay={autoPlay}
        muted={muted}
        playsInline={playsInline}
        className="w-full h-auto rounded-lg bg-black"
        type="application/x-mpegurl"
      />
      {err ? (
        <div className="mt-2 p-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
          <strong>Error:</strong> {err}
        </div>
      ) : null}
    </div>
  );
}
