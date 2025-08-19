"use client";

import { useRef } from "react";
import {
  MediaPlayer,
  MediaProvider,
  Poster,
  isHLSProvider,
} from "@vidstack/react";

// Jika kamu PUNYA komponen sendiri, pakai yang lama.
// Kalau BELUM, pakai default layout Vidstack:
import {
  DefaultVideoLayout,
  defaultLayoutIcons,
} from "@vidstack/react/player/layouts/default";

export default function Player() {
  const playerRef = useRef(null);

  function onProviderChange(provider) {
    // Paksa gunakan HLS.js untuk HLS (.m3u8) — menghindari error codec/mp4a.
    if (isHLSProvider(provider)) {
      provider.library = () => import("hls.js"); // lazy-loaded di browser
    }
  }

  return (
    <MediaPlayer
      ref={playerRef}
      load="play"
      title="Sprite Fight"
      type="application/x-mpegurl"
      src="http://localhost:8080/?url=https://cdn.dotstream.buzz/anime/eccbc87e4b5ce2fe28308fd9f2a7baf3/bec16b94c40f9ae5fecb59a446769a44/master.m3u8&headers={Referer:https://cdn.dotstream.buzz}"
    >
      <MediaProvider />
      <DefaultVideoLayout
        thumbnails="http://localhost:8080/?url=https://cdn.dotstream.buzz/anime/eccbc87e4b5ce2fe28308fd9f2a7baf3/bec16b94c40f9ae5fecb59a446769a44/subtitles/eng-0.vtt"
        icons={defaultLayoutIcons}
        nProviderChange={onProviderChange}
        type="application/x-mpegurl"
      />
    </MediaPlayer>
  );
}
