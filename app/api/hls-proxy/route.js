import { NextResponse } from "next/server";

// Wajib: runtime Node dan non-statis biar streaming lancar
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Paksa header Referer sesuai kebutuhan sumber
const FORCED_HEADERS = {
  Referer: "https://kwik.cx/",
  // (Opsional tapi sering membantu)
  // Origin: 'https://kwik.cx',
  // 'User-Agent': 'Mozilla/5.0',
};

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  // Teruskan header penting (termasuk Range) + override Referer
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
  for (const h of passThrough) {
    const v = req.headers.get(h);
    if (v) forwardHeaders.set(h, v);
  }
  for (const [k, v] of Object.entries(FORCED_HEADERS)) {
    forwardHeaders.set(k, v);
  }

  const upstream = await fetch(url, {
    method: "GET",
    headers: forwardHeaders,
    cache: "no-store",
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
  resHeaders.set("cross-origin-resource-policy", "cross-origin");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: resHeaders,
  });
}
