/**
 * Cloudflare Pages Function: /api/portfolio
 * High-performance Cloudflare D1 SQL Backend with REST API fallback
 * Supports Public Read (with Edge Caching) and Protected Admin CRUD
 */

const CF_ACCOUNT_ID = "cd95efc74562ac2f0c0d9759d06d7d89";
const D1_DATABASE_ID = "4287e278-9c81-4854-8c34-0227cd404964";
const DEFAULT_ADMIN_PIN = "ilham2026";

function getApiToken(env) {
  if (env && (env.CLOUDFLARE_API_TOKEN || env.CF_API_TOKEN)) {
    return env.CLOUDFLARE_API_TOKEN || env.CF_API_TOKEN;
  }
  return atob("Y2ZhdF9qUFVkaEZmc2NCYzJTUjViZWdJU1pPQ2FEazM0b3ZxaHhEMDBEWFAzNWYyMGU2ZmM=");
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-PIN, Authorization",
};

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
}

function verifyAdmin(request, body = null, env = {}) {
  const adminPin = env.ADMIN_PIN || DEFAULT_ADMIN_PIN;
  const headerPin = request.headers.get("X-Admin-PIN");
  const url = new URL(request.url);
  const queryPin = url.searchParams.get("pin");
  const bodyPin = body && body.pin ? body.pin : null;

  const providedPin = (headerPin || queryPin || bodyPin || "").trim();
  return providedPin === adminPin;
}

/**
 * Execute SQL against Cloudflare D1.
 * Prefers native D1 binding (env.DB) if present, falls back to Cloudflare D1 REST API.
 */
async function executeD1(env, sql, params = []) {
  if (env && env.DB && typeof env.DB.prepare === "function") {
    try {
      const stmt = env.DB.prepare(sql).bind(...params);
      if (sql.trim().toUpperCase().startsWith("SELECT")) {
        const result = await stmt.all();
        return { success: true, results: result.results || [] };
      } else {
        const result = await stmt.run();
        return {
          success: true,
          meta: result.meta || {},
          lastRowId: result.meta?.last_row_id,
          changes: result.meta?.changes,
        };
      }
    } catch (err) {
      console.warn("Native env.DB query failed, trying REST fallback:", err);
    }
  }

  // REST API Fallback
  const accountId = env?.CLOUDFLARE_ACCOUNT_ID || CF_ACCOUNT_ID;
  const token = getApiToken(env);
  const dbId = env?.D1_DATABASE_ID || D1_DATABASE_ID;

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`;
  const resp = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sql, params }),
  });

  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(`D1 REST API error: ${resp.status} ${errorText}`);
  }

  const json = await resp.json();
  if (!json.success || !json.result || !json.result[0]) {
    throw new Error(json.errors?.[0]?.message || "D1 query execution failed");
  }

  const firstResult = json.result[0];
  return {
    success: true,
    results: firstResult.results || [],
    meta: firstResult.meta || {},
    lastRowId: firstResult.meta?.last_row_id,
    changes: firstResult.meta?.changes,
  };
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const isAdminRequest = url.searchParams.get("admin") === "1" || url.searchParams.get("all") === "1";

  if (isAdminRequest) {
    if (!verifyAdmin(request, null, env)) {
      return jsonResponse({ success: false, error: "Unauthorized: PIN Admin tidak valid" }, 401);
    }
    try {
      const { results } = await executeD1(
        env,
        "SELECT id, judul, kategori, deskripsi, gambar, link, tech, order_index, is_active, created_at, updated_at FROM portfolio ORDER BY order_index ASC, id DESC;"
      );
      return jsonResponse({ success: true, data: results }, 200, {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      });
    } catch (err) {
      return jsonResponse({ success: false, error: err.message }, 500);
    }
  }

  // Public Portfolio List (Edge Cached)
  try {
    const { results } = await executeD1(
      env,
      "SELECT id, judul, kategori, deskripsi, gambar, link, tech, order_index FROM portfolio WHERE is_active = 1 ORDER BY order_index ASC, id ASC;"
    );

    return jsonResponse(results, 200, {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    });
  } catch (err) {
    return jsonResponse({ error: "Failed to fetch portfolio data from D1", message: err.message }, 502);
  }
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch (_) {
    return jsonResponse({ success: false, error: "Invalid JSON body" }, 400);
  }

  // Handle Login Check
  if (body.action === "login") {
    if (verifyAdmin(request, body, env)) {
      return jsonResponse({ success: true, message: "Autentikasi PIN Berhasil" });
    } else {
      return jsonResponse({ success: false, error: "PIN Admin salah" }, 401);
    }
  }

  // Protected: Create New Portfolio Item
  if (!verifyAdmin(request, body, env)) {
    return jsonResponse({ success: false, error: "Unauthorized: PIN Admin tidak valid" }, 401);
  }

  const {
    judul,
    kategori,
    deskripsi = "",
    gambar = "",
    link = "",
    tech = "",
    order_index = 0,
    is_active = 1,
  } = body;

  if (!judul || !kategori) {
    return jsonResponse({ success: false, error: "Field 'judul' dan 'kategori' wajib diisi" }, 400);
  }

  try {
    const sql = `
      INSERT INTO portfolio (judul, kategori, deskripsi, gambar, link, tech, order_index, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `;
    const res = await executeD1(env, sql, [
      judul.trim(),
      kategori.trim(),
      deskripsi.trim(),
      gambar.trim(),
      link.trim(),
      tech.trim(),
      parseInt(order_index, 10) || 0,
      parseInt(is_active, 10) === 0 ? 0 : 1,
    ]);

    return jsonResponse({
      success: true,
      message: "Karya baru berhasil disimpan ke Cloudflare D1",
      id: res.lastRowId,
    }, 201);
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}

export async function onRequestPut({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch (_) {
    return jsonResponse({ success: false, error: "Invalid JSON body" }, 400);
  }

  if (!verifyAdmin(request, body, env)) {
    return jsonResponse({ success: false, error: "Unauthorized: PIN Admin tidak valid" }, 401);
  }

  const {
    id,
    judul,
    kategori,
    deskripsi = "",
    gambar = "",
    link = "",
    tech = "",
    order_index = 0,
    is_active = 1,
  } = body;

  if (!id) {
    return jsonResponse({ success: false, error: "ID karya wajib disertakan" }, 400);
  }

  try {
    const sql = `
      UPDATE portfolio
      SET judul = ?, kategori = ?, deskripsi = ?, gambar = ?, link = ?, tech = ?, order_index = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?;
    `;
    await executeD1(env, sql, [
      judul.trim(),
      kategori.trim(),
      deskripsi.trim(),
      gambar.trim(),
      link.trim(),
      tech.trim(),
      parseInt(order_index, 10) || 0,
      parseInt(is_active, 10) === 0 ? 0 : 1,
      id,
    ]);

    return jsonResponse({
      success: true,
      message: "Data karya berhasil diperbarui di Cloudflare D1",
    });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}

export async function onRequestDelete({ request, env }) {
  const url = new URL(request.url);
  let id = url.searchParams.get("id");

  let body = null;
  if (!id) {
    try {
      body = await request.json();
      id = body?.id;
    } catch (_) {}
  }

  if (!verifyAdmin(request, body, env)) {
    return jsonResponse({ success: false, error: "Unauthorized: PIN Admin tidak valid" }, 401);
  }

  if (!id) {
    return jsonResponse({ success: false, error: "ID karya yang ingin dihapus wajib disertakan" }, 400);
  }

  try {
    const sql = "DELETE FROM portfolio WHERE id = ?;";
    await executeD1(env, sql, [id]);

    return jsonResponse({
      success: true,
      message: `Karya ID #${id} berhasil dihapus dari Cloudflare D1`,
    });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}
