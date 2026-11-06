/**
 * Cloudflare Pages Function: /api/sheets
 * Proxy & Cache untuk data Google Sheets (Articles & Portfolio)
 * Menyediakan edge caching 1 jam (stale-while-revalidate 24 jam) agar website super cepat
 */

const SHEET_ID = "1eD1ElFcjBpVrS8DGShVlPrmuLI1bZIo4QEcxG1kBCAc";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const tab = url.searchParams.get("tab") || "Sheet1";

  // Cek cache internal Cloudflare Edge
  const cacheKey = new Request(url.toString(), request);
  const cache = caches.default;
  let response = await cache.match(cacheKey);

  if (response) {
    return response;
  }

  try {
    const upstreamUrl = `https://opensheet.elk.sh/${SHEET_ID}/${encodeURIComponent(tab)}`;
    const upstreamResp = await fetch(upstreamUrl, {
      headers: { "Accept": "application/json" },
      cf: { cacheTtl: 3600, cacheEverything: true }
    });

    if (!upstreamResp.ok) {
      throw new Error(`Upstream returned ${upstreamResp.status}`);
    }

    const data = await upstreamResp.json();
    response = new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json; charset=utf-8",
      },
    });

    // Simpan ke Edge Cache
    try {
      await cache.put(cacheKey, response.clone());
    } catch (_) {}

    return response;
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch sheet data", message: err.message }),
      { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
}

