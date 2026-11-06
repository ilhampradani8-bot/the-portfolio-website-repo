/**
 * Cloudflare Pages Function: /api/indexnow
 * Submit URL ke Microsoft Bing & IndexNow Engine secara instan
 */

const INDEXNOW_KEY = "01ddc6596727dd70beaa6321a64fa7d2";
const HOST = "ilhampradani.me";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestGet() {
  return new Response(
    JSON.stringify({
      status: "online",
      service: "Bing & IndexNow Auto-Submitter",
      host: HOST,
      key_location: `https://${HOST}/${INDEXNOW_KEY}.txt`,
      documentation: "https://www.indexnow.org/documentation",
    }),
    { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
  );
}

export async function onRequestPost({ request }) {
  try {
    let body = {};
    try {
      body = await request.json();
    } catch (_) {}

    const defaultUrls = [
      `https://${HOST}/`,
      `https://${HOST}/about.html`,
      `https://${HOST}/penelitian.html`,
      `https://${HOST}/cv.html`,
      `https://${HOST}/portofolio.html`,
      `https://${HOST}/tradingsafe.html`,
      `https://${HOST}/ojekasia.html`,
      `https://${HOST}/easymarket.html`,
      `https://${HOST}/baca.html`,
      `https://${HOST}/certified.html`,
      `https://${HOST}/career.html`,
      `https://${HOST}/izin-usaha.html`,
    ];

    const urlList = Array.isArray(body.urls) && body.urls.length > 0 ? body.urls : defaultUrls;

    const payload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
      urlList: urlList,
    };

    // Submit ke endpoint resmi Microsoft Bing & IndexNow
    const [bingRes, indexNowRes] = await Promise.all([
      fetch("https://www.bing.com/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload),
      }),
      fetch("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload),
      }),
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        message: "URL berhasil disubmit ke Microsoft Bing & IndexNow!",
        bing_status: bingRes.status,
        indexnow_status: indexNowRes.status,
        submitted_urls: urlList.length,
      }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Gagal submit ke IndexNow" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
}

