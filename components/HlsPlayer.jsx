"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

export default function HlsPlayer({
  src,
  poster,
  autoPlay = false,
  controls = true,
  muted = false,
  playsInline = true,
  useProxy = false,
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = useProxy
        ? `/api/hls-proxy?url=${encodeURIComponent(src)}`
        : src;
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        ...(useProxy && {
          fetchSetup: (ctx, init) => {
            const proxied = `/api/hls-proxy?url=${encodeURIComponent(ctx.url)}`;
            return new Request(proxied, init);
          },
        }),
        autoStartLoad: true,
      });

      const m3u8Url = useProxy
        ? `/api/hls-proxy?url=${encodeURIComponent(src)}`
        : src;

      hls.loadSource(m3u8Url);
      hls.attachMedia(video);

      hls.on(Hls.Events.ERROR, (_evt, data) => {
        console.warn("HLS error:", data);
      });

      return () => {
        hls.destroy();
      };
    } else {
      video.src = useProxy
        ? `/api/hls-proxy?url=${encodeURIComponent(src)}`
        : src;
    }
  }, [src, useProxy]);

  return (
    <video
      ref={videoRef}
      poster={poster}
      controls={controls}
      autoPlay={autoPlay}
      muted={muted}
      playsInline={playsInline}
      className="w-full h-auto rounded-lg"
      onError={(e) => console.log(e)}
    />
  );
}
