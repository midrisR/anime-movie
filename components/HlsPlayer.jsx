"use client";

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
      ? `http://localhost:8080?url=${encodeURIComponent(src)}`
      : src;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = finalSrc;
      video.addEventListener(
        "error",
        () => setErr("Video error (native). Cek CORS/Referer/token."),
        { once: true }
      );
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        ...(useProxy && {
          fetchSetup: (ctx, init) => {
            const proxied = `http://localhost:8080?url=${encodeURIComponent(
              ctx.url
            )}`;
            return new Request(proxied, init);
          },
        }),
        autoStartLoad: true,
      });

      hls.loadSource(finalSrc);
      hls.attachMedia(video);

      hls.on(Hls.Events.ERROR, (_evt, data) => {
        console.warn("HLS error:", data);
        if (data?.fatal) setErr(`HLS fatal: ${data?.details || data?.type}`);
      });

      return () => hls.destroy();
    }

    video.src = finalSrc;
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
        preload="metadata"
        crossOrigin="anonymous"
        className="w-full h-auto rounded-lg bg-black"
      />
      {err ? <div className="mt-2 text-sm text-red-600">{err}</div> : null}
    </div>
  );
}
