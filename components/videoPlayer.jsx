"use client";

import React from "react";
import Hls, { Events, ErrorTypes } from "hls.js";

export default function VideoPlayer({
  src,
  poster,
  autoPlay = false,
  muted = false,
  controls = true,
  className,
  startLevel = -1, // -1 = Auto
  lowLatency = false,
  subtitles = [],
  onError,
  onReady,
}) {
  const videoRef = React.useRef(null);
  const hlsRef = React.useRef(null);
  const [levels, setLevels] = React.useState([]);
  const [currentLevel, setCurrentLevel] = React.useState(-1);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Native HLS (Safari/iOS)
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.load();
      if (autoPlay) {
        const p = video.play();
        p?.catch(() => {});
      }
      setLevels([]); // no programmatic level control in native
      setCurrentLevel(-1);
      onReady?.();
      return;
    }

    // hls.js path
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: lowLatency,
        startLevel,
      });
      hlsRef.current = hls;

      hls.attachMedia(video);
      hls.on(Events.MEDIA_ATTACHED, () => {
        hls.loadSource(src);
      });

      hls.on(Events.MANIFEST_PARSED, (_, data) => {
        const qs = data.levels.map((lvl, idx) => {
          const h = lvl.height;
          const br = Math.round((lvl.bitrate || 0) / 1000);
          const label = h ? `${h}p` : `${br} kbps`;
          return { index: idx, label };
        });

        setLevels([{ index: -1, label: "Auto" }, ...qs]);
        setCurrentLevel(hls.currentLevel);
        onReady?.();

        if (autoPlay) {
          const p = video.play();
          p?.catch(() => {});
        }
      });

      hls.on(Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              hlsRef.current = null;
          }
        }
        onError?.(data);
      });

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    }

    onError?.(new Error("HLS tidak didukung di browser ini"));
  }, [src, autoPlay, lowLatency, startLevel, onError, onReady]);

  const handleLevelChange = (e) => {
    const lvl = Number(e.target.value);
    setCurrentLevel(lvl);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = lvl; // -1 => Auto
    }
  };

  return (
    <div className={className}>
      <video
        ref={videoRef}
        poster={poster}
        controls={controls}
        muted={muted}
        playsInline
        className="w-full h-auto"
      >
        {subtitles.map((t, i) => (
          <track
            key={i}
            kind="subtitles"
            srcLang={t.lang || "en"}
            label={t.label}
            src={t.src}
            default={t.default}
          />
        ))}
      </video>

      {levels.length > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <label className="text-sm">Quality:</label>
          <select
            value={currentLevel}
            onChange={handleLevelChange}
            className="border rounded px-2 py-1 text-sm"
          >
            {levels.map((l) => (
              <option key={l.index} value={l.index}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
