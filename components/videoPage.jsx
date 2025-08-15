"use client";
import { useState, useMemo } from "react";
import OptimizedHLSPlayer from "./HlsPlayer";

const VideoPlayerPage = () => {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customHeaders, setCustomHeaders] = useState("");

  // Helper function untuk membuat proxy URL
  const createProxyUrl = (url, headers = null) => {
    if (!url) return "";

    const encodedUrl = encodeURIComponent(url);
    let proxyUrl = `/api/hls-proxy?url=${encodedUrl}`;

    if (headers) {
      const encodedHeaders = encodeURIComponent(JSON.stringify(headers));
      proxyUrl += `&headers=${encodedHeaders}`;
    }

    return proxyUrl;
  };

  // Buat proxy URL berdasarkan input
  const proxyUrl = useMemo(() => {
    if (!originalUrl) return "";

    let headersObj = null;
    if (customHeaders.trim()) {
      try {
        headersObj = JSON.parse(customHeaders);
      } catch (e) {
        console.warn("Invalid headers JSON:", e.message);
      }
    }

    return createProxyUrl(originalUrl, headersObj);
  }, [originalUrl, customHeaders]);

  // Preset URLs untuk testing
  const presetUrls = [
    {
      name: "Test Stream 1",
      url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      headers: null,
    },
    {
      name: "Dr. Stone Example (dengan headers)",
      url: "https://cdn.dotstream.buzz/anime/807c4063f8fd3da43661d3087d697c7e/f70c7937d6b1709504e3bad828e2ac80/master.m3u8",
      headers: {
        Referer:
          "https://megaplay.buzz/stream/s-2/dr-stone-science-future-part-2-19784?ep=141745/sub",
      },
    },
    {
      name: "Demo Stream 2",
      url: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
      headers: null,
    },
  ];

  const loadPreset = (preset) => {
    setOriginalUrl(preset.url);
    setCustomHeaders(
      preset.headers ? JSON.stringify(preset.headers, null, 2) : ""
    );
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    // URL akan otomatis update melalui useMemo
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "1000px",
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ marginBottom: "30px", color: "#333" }}>
        🎬 HLS Video Player dengan Proxy
      </h1>

      {/* Preset URLs */}
      <div style={{ marginBottom: "30px" }}>
        <h3 style={{ marginBottom: "15px", color: "#555" }}>Quick Presets:</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {presetUrls.map((preset, index) => (
            <button
              key={index}
              onClick={() => loadPreset(preset)}
              style={{
                padding: "8px 16px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Manual URL Input */}
      <form onSubmit={handleUrlSubmit} style={{ marginBottom: "30px" }}>
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
              color: "#333",
            }}
          >
            🔗 Original HLS URL:
          </label>
          <input
            type="url"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            placeholder="https://example.com/playlist.m3u8"
            style={{
              width: "100%",
              padding: "10px",
              border: "2px solid #ddd",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
              color: "#333",
            }}
          >
            📋 Custom Headers (JSON, optional):
          </label>
          <textarea
            value={customHeaders}
            onChange={(e) => setCustomHeaders(e.target.value)}
            placeholder='{"Referer": "https://example.com", "User-Agent": "Custom Agent"}'
            rows="4"
            style={{
              width: "100%",
              padding: "10px",
              border: "2px solid #ddd",
              borderRadius: "6px",
              fontSize: "12px",
              fontFamily: "monospace",
              resize: "vertical",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={!originalUrl.trim()}
          style={{
            padding: "12px 24px",
            backgroundColor: originalUrl.trim() ? "#28a745" : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: originalUrl.trim() ? "pointer" : "not-allowed",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          🚀 Load Video
        </button>
      </form>

      {/* Generated Proxy URL Display */}
      {proxyUrl && (
        <div
          style={{
            marginBottom: "20px",
            padding: "15px",
            backgroundColor: "#f8f9fa",
            border: "1px solid #dee2e6",
            borderRadius: "6px",
          }}
        >
          <h4
            style={{
              marginTop: "0",
              marginBottom: "10px",
              color: "#495057",
            }}
          >
            🔧 Generated Proxy URL:
          </h4>
          <code
            style={{
              display: "block",
              padding: "10px",
              backgroundColor: "#e9ecef",
              borderRadius: "4px",
              fontSize: "12px",
              wordBreak: "break-all",
              color: "#495057",
            }}
          >
            {proxyUrl}
          </code>
        </div>
      )}

      {/* Video Player */}
      {proxyUrl && (
        <div style={{ marginBottom: "20px" }}>
          <h3
            style={{
              marginBottom: "15px",
              color: "#333",
            }}
          >
            🎥 Video Player:
          </h3>
          <OptimizedHLSPlayer
            src={proxyUrl}
            controls={true}
            autoplay={false}
            width="100%"
            height="auto"
          />
        </div>
      )}

      {/* Instructions */}
      <div
        style={{
          marginTop: "40px",
          padding: "20px",
          backgroundColor: "#e7f3ff",
          border: "1px solid #b8daff",
          borderRadius: "8px",
        }}
      >
        <h3
          style={{
            marginTop: "0",
            color: "#0056b3",
          }}
        >
          📝 Instructions:
        </h3>
        <ol
          style={{
            color: "#495057",
            lineHeight: "1.6",
          }}
        >
          <li>
            <strong>Original URL:</strong> Masukkan URL HLS (.m3u8) yang asli
          </li>
          <li>
            <strong>Custom Headers:</strong> Tambahkan headers dalam format JSON
            jika diperlukan (contoh: Referer, User-Agent)
          </li>
          <li>
            <strong>Proxy URL:</strong> Sistem akan otomatis membuat URL proxy
            yang dapat digunakan
          </li>
          <li>
            <strong>CORS:</strong> Proxy akan menangani masalah CORS secara
            otomatis
          </li>
        </ol>

        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeaa7",
            borderRadius: "4px",
          }}
        >
          <strong>⚠️ Important:</strong> Pastikan file{" "}
          <code>pages/api/hls-proxy.js</code>
          sudah dibuat dengan kode yang benar untuk proxy berfungsi.
        </div>
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === "development" && proxyUrl && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#f8f9fa",
            border: "1px solid #dee2e6",
            borderRadius: "6px",
          }}
        >
          <h4>🐛 Debug Info:</h4>
          <pre
            style={{
              fontSize: "11px",
              color: "#6c757d",
              margin: "0",
            }}
          >
            {JSON.stringify(
              {
                originalUrl,
                customHeaders: customHeaders || null,
                proxyUrl,
              },
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
};

export default VideoPlayerPage;
