"use client";

import { useMemo, useState } from "react";
import HlsPlayer from "./HlsPlayer";

export default function HlsQualityPlayer({ sources = [], poster }) {
  // Bersihkan & urutkan (opsional): tampilkan label kualitas yang enak dibaca

  const options = useMemo(() => {
    // contoh: ambil "360p", "720p", "1080p" dari field quality
    return (
      sources
        .filter((s) => s?.isM3U8 && s?.url)
        .map((s) => {
          const match = s.quality?.match(/(\d{3,4}p)/i);
          const label = match ? match[1] : s.quality || "Auto";
          return { url: s.url, label };
        })
        // urutkan naik berdasarkan angka p
        .sort((a, b) => {
          const na = parseInt(a.label);
          const nb = parseInt(b.label);
          if (isNaN(na) || isNaN(nb)) return 0;
          return na - nb;
        })
    );
  }, [sources]);

  const [current, setCurrent] = useState(options?.[0]?.url || "");

  if (!options.length)
    return <div className="text-sm text-red-600">No HLS sources.</div>;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.url}
            onClick={() => setCurrent(opt.url)}
            className={`px-3 py-1 rounded border text-sm ${
              current === opt.url ? "bg-black text-white" : "bg-white"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <HlsPlayer src={current} poster={poster} useProxy />
    </div>
  );
}
