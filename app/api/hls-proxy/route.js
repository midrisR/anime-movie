import { NextResponse } from "next/server";

const FORCED_HEADERS = {
  // 'Referer': 'https://contoh-sumber.com/',
  // 'User-Agent': 'Mozilla/5.0',
};

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  const incoming = req.headers;
  const forwardHeaders = new Headers();
  const passThrough = [
    "range",
    "accept",
    "accept-encoding",
    "accept-language",
    "user-agent",
    "origin",
    "referer",
    "cache-control",
  ];
  passThrough.forEach((h) => {
    const v = incoming.get(h);
    if (v) forwardHeaders.set(h, v);
  });

  for (const [k, v] of Object.entries(FORCED_HEADERS)) {
    forwardHeaders.set(k, v);
  }

  const upstream = await fetch(url, {
    method: "GET",
    headers: forwardHeaders,
  });

  const resHeaders = new Headers();
  const copy = [
    "content-type",
    "content-length",
    "accept-ranges",
    "content-range",
    "cache-control",
    "expires",
    "last-modified",
  ];
  copy.forEach((h) => {
    const v = upstream.headers.get(h);
    if (v) resHeaders.set(h, v);
  });

  resHeaders.set("access-control-allow-origin", "*");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: resHeaders,
  });
}
