/**
 * Cloudflare Pages Function: /api/zenodo
 * Proxy & Auto-Indexer Real-Time untuk Publikasi Ilmiah Zenodo (CERN / OpenAIRE)
 * Token disimpan secara aman di Cloudflare Pages Secrets (env.ZENODO_API_TOKEN)
 * Tidak mengekspos credential ke public repository
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);

  // 1. Edge Cache match
  const cacheKey = new Request(url.toString(), request);
  const cache = caches.default;
  try {
    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }
  } catch (_) {}

  const zenodoToken = env.ZENODO_API_TOKEN || "";
  let publications = [];
  let source = "zenodo";

  // 2. Coba ambil dari Zenodo API (Deposit / Records)
  if (zenodoToken) {
    try {
      const zenodoRes = await fetch("https://zenodo.org/api/deposit/depositions?size=50", {
        headers: {
          "Authorization": `Bearer ${zenodoToken}`,
          "Accept": "application/json",
          "User-Agent": "IlhamPradani-EdgeBot/1.0 (+https://ilhampradani.chainasiaconnect.co.id)",
        },
        cf: { cacheTtl: 600, cacheEverything: true },
      });

      if (zenodoRes.ok) {
        const rawItems = await zenodoRes.json();
        if (Array.isArray(rawItems) && rawItems.length > 0) {
          publications = rawItems
            .filter((d) => d.state === "done" || d.submitted === true || d.doi)
            .map((item) => {
              const meta = item.metadata || {};
              const doi = item.doi || (item.doi_url ? item.doi_url.replace("https://doi.org/", "") : "");
              const authors = (meta.creators || []).map((c) => c.name || "Dr. Ilham Pradani C.L.");

              return {
                id: String(item.id || item.record_id || ""),
                title: meta.title || "Karya Ilmiah",
                doi: doi,
                doi_url: item.doi_url || (doi ? `https://doi.org/${doi}` : `https://zenodo.org/record/${item.id}`),
                url: item.links?.record_html || item.doi_url || `https://zenodo.org/record/${item.id}`,
                publication_date: meta.publication_date || item.created?.split("T")[0] || "2026",
                year: meta.publication_date ? meta.publication_date.split("-")[0] : "2026",
                journal_title: meta.journal_title || meta.publication_type || "Zenodo Open Access",
                authors: authors.length > 0 ? authors : ["Dr. Ilham Pradani C.L."],
                abstract: meta.description ? meta.description.replace(/<[^>]+>/g, "").trim() : "",
                keywords: meta.keywords || [],
                source: "zenodo",
              };
            });
        }
      }
    } catch (e) {
      console.warn("Zenodo direct fetch fallback:", e);
    }
  }

  // 3. Fallback Cerdas: Jika Zenodo API membatasi IP cloud, ambil mirror ORCID resmi
  if (publications.length === 0) {
    try {
      const orcidRes = await fetch("https://pub.orcid.org/v3.0/0009-0008-1310-6169/works", {
        headers: {
          "Accept": "application/json",
          "User-Agent": "IlhamPradani-EdgeBot/1.0",
        },
        cf: { cacheTtl: 1800, cacheEverything: true },
      });

      if (orcidRes.ok) {
        const orcidData = await orcidRes.json();
        const groups = orcidData.group || [];
        publications = groups.map((g) => {
          const summary = (g["work-summary"] && g["work-summary"][0]) || {};
          const title = summary.title?.title?.value || "Publikasi Penelitian";
          const extIds = summary["external-ids"]?.["external-id"] || [];
          const doiObj = extIds.find((e) => e["external-id-type"]?.toLowerCase() === "doi");
          const doi = doiObj ? doiObj["external-id-value"] : "";
          const doiUrl = doiObj?.["external-id-url"]?.value || (doi ? `https://doi.org/${doi}` : "");
          const pubDate = summary["publication-date"] || {};
          const year = pubDate.year?.value || "2026";
          const month = pubDate.month?.value || "01";
          const day = pubDate.day?.value || "01";

          return {
            id: String(summary["put-code"] || ""),
            title: title,
            doi: doi,
            doi_url: doiUrl,
            url: summary.url?.value || doiUrl,
            publication_date: `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`,
            year: year,
            journal_title: summary["journal-title"]?.value || "Zenodo / Scientific Repository",
            authors: ["Dr. Ilham Pradani C.L."],
            abstract: "Kajian akademik dan riset ilmiah terverifikasi oleh Dr. Ilham Pradani C.L. Tersedia akses terbuka (Open Access) dengan nomor DOI resmi terdaftar di Zenodo & CrossRef/DataCite.",
            keywords: ["Cyber Law", "AI Regulation", "Edge-IoT", "Smart Contract", "Krui 3T"],
            source: "orcid_zenodo_mirror",
          };
        });
        source = "orcid_zenodo_mirror";
      }
    } catch (e) {
      console.error("ORCID fallback error:", e);
    }
  }

  // 4. Return formatted JSON
  const finalResponse = new Response(
    JSON.stringify({
      success: true,
      total: publications.length,
      source: source,
      author: "Dr. Ilham Pradani C.L.",
      orcid: "0009-0008-1310-6169",
      updated_at: new Date().toISOString(),
      data: publications,
    }),
    {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json; charset=utf-8",
      },
    }
  );

  // Simpan ke Edge Cache jika berhasil
  try {
    await cache.put(cacheKey, finalResponse.clone());
  } catch (_) {}

  return finalResponse;
}

