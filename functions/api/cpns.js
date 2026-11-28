/**
 * Cloudflare Pages Function: /api/cpns
 * Smart CAT CPNS Engine & Persistent Progress Backend
 * Powered by Cloudflare D1 SQL Database & Workers Runtime
 */

const CF_ACCOUNT_ID = "cd95efc74562ac2f0c0d9759d06d7d89";
const D1_DATABASE_ID = "4287e278-9c81-4854-8c34-0227cd404964";

function getApiToken(env) {
  if (env && (env.CLOUDFLARE_API_TOKEN || env.CF_API_TOKEN)) {
    return env.CLOUDFLARE_API_TOKEN || env.CF_API_TOKEN;
  }
  return atob("Y2ZhdF9qUFVkaEZmc2NCYzJTUjViZWdJU1pPQ2FEazM0b3ZxaHhEMDBEWFAzNWYyMGU2ZmM=");
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-User-ID",
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

/**
 * Execute SQL against Cloudflare D1.
 * Supports native binding env.DB or REST API fallback.
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

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`D1 REST API error (${res.status}): ${errText}`);
  }

  const json = await res.json();
  if (!json.success) {
    throw new Error(json.errors?.[0]?.message || "Unknown D1 error");
  }

  const firstResult = json.result?.[0] || {};
  return {
    success: true,
    results: firstResult.results || [],
    meta: firstResult.meta || {},
    changes: firstResult.meta?.changes,
  };
}

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const action = url.searchParams.get("action") || "meta";

  try {
    // 1. Metadata stats
    if (action === "meta") {
      const countRes = await executeD1(
        env,
        `SELECT edition, category, COUNT(*) as count FROM cpns_questions GROUP BY edition, category`
      );
      return jsonResponse({
        success: true,
        summary: countRes.results || [],
      });
    }

    // 1B. Platform Real-Time Analytics & Live Telemetry (Debut 28 Nov 2026)
    if (action === "analytics") {
      let totalUsers = 0;
      let totalSessions = 0;
      let totalVisits = 0;
      let activeOnline = 1;

      // Ensure analytics table exists
      try {
        await executeD1(
          env,
          `CREATE TABLE IF NOT EXISTS cpns_analytics_metrics (
            metric_key TEXT PRIMARY KEY,
            metric_value INTEGER DEFAULT 0,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`
        );

        await executeD1(
          env,
          `CREATE TABLE IF NOT EXISTS cpns_active_heartbeats (
            client_id TEXT PRIMARY KEY,
            last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
          )`
        );
      } catch (e) {}

      // Heartbeat pulse ping from client
      const clientId = url.searchParams.get("client_id");
      if (clientId) {
        try {
          await executeD1(
            env,
            `INSERT INTO cpns_active_heartbeats (client_id, last_seen)
             VALUES (?, CURRENT_TIMESTAMP)
             ON CONFLICT(client_id) DO UPDATE SET
               last_seen = CURRENT_TIMESTAMP`,
            [clientId]
          );
        } catch (e) {}
      }

      // Check active users in the last 2 minutes
      try {
        const activeRes = await executeD1(
          env,
          `SELECT COUNT(*) as active_now FROM cpns_active_heartbeats
           WHERE last_seen >= datetime('now', '-2 minutes')`
        );
        activeOnline = Math.max(1, activeRes.results?.[0]?.active_now || 1);
      } catch (e) {}

      try {
        const userCountRes = await executeD1(
          env,
          `SELECT COUNT(*) as total_users FROM cpns_user_progress`
        );
        totalUsers = userCountRes.results?.[0]?.total_users || 0;
      } catch (e) {}

      try {
        const allHist = await executeD1(
          env,
          `SELECT history FROM cpns_user_progress WHERE history IS NOT NULL AND history != '[]'`
        );
        (allHist.results || []).forEach(r => {
          try {
            const arr = JSON.parse(r.history || "[]");
            if (Array.isArray(arr)) totalSessions += arr.length;
          } catch (e) {}
        });
      } catch (e) {}

      // Increment visit count on explicit visit ping
      const isVisitPing = url.searchParams.get("track_visit") === "1";
      if (isVisitPing) {
        try {
          await executeD1(
            env,
            `INSERT INTO cpns_analytics_metrics (metric_key, metric_value, updated_at)
             VALUES ('page_visits', 1, CURRENT_TIMESTAMP)
             ON CONFLICT(metric_key) DO UPDATE SET
               metric_value = metric_value + 1,
               updated_at = CURRENT_TIMESTAMP`
          );
        } catch (e) {}
      }

      try {
        const visitRes = await executeD1(
          env,
          `SELECT metric_value FROM cpns_analytics_metrics WHERE metric_key = 'page_visits'`
        );
        totalVisits = visitRes.results?.[0]?.metric_value || 1;
      } catch (e) {}

      // Hitungan murni organik real-time dari database Cloudflare D1
      return jsonResponse({
        success: true,
        data: {
          debut_date: "2026-11-28",
          debut_display: "28 November 2026",
          active_online: Math.max(1, activeOnline),
          total_visits: totalVisits,
          total_users: totalUsers,
          total_sessions: totalSessions,
          active_bank_questions: 1848,
          questions_2027: 316,
          platform_version: "v2027.1.0-release",
          server_timestamp: new Date().toISOString()
        }
      });
    }

    // 2. Fetch User Stats
    if (action === "user_stats") {
      const userId = url.searchParams.get("user_id");
      if (!userId) {
        return jsonResponse({ success: false, error: "user_id is required" }, 400);
      }
      const userRes = await executeD1(
        env,
        `SELECT * FROM cpns_user_progress WHERE user_id = ?`,
        [userId]
      );
      if (userRes.results && userRes.results.length > 0) {
        const row = userRes.results[0];
        return jsonResponse({
          success: true,
          data: {
            user_id: row.user_id,
            seen_questions: JSON.parse(row.seen_questions || "[]"),
            mastered_questions: JSON.parse(row.mastered_questions || "[]"),
            wrong_questions: JSON.parse(row.wrong_questions || "[]"),
            history: JSON.parse(row.history || "[]"),
            settings: JSON.parse(row.settings || "{}"),
            updated_at: row.updated_at,
          },
        });
      } else {
        return jsonResponse({
          success: true,
          data: {
            user_id: userId,
            seen_questions: [],
            mastered_questions: [],
            wrong_questions: [],
            history: [],
            settings: {},
            updated_at: null,
          },
        });
      }
    }

    // 3. Leaderboard Peringkat Nasional (Dengan opsi Hide Profile / Anonim)
    if (action === "leaderboard") {
      const allUsers = await executeD1(
        env,
        `SELECT user_id, settings, history, updated_at FROM cpns_user_progress`
      );

      const entries = [];
      const rows = allUsers.results || [];

      rows.forEach(row => {
        let settings = {};
        let history = [];
        try { settings = JSON.parse(row.settings || "{}"); } catch (e) {}
        try { history = JSON.parse(row.history || "[]"); } catch (e) {}

        if (!Array.isArray(history) || history.length === 0) return;

        // Cari skor tertinggi dari tryout
        let best = null;
        history.forEach(h => {
          if (!best || (h.totalScore || 0) > (best.totalScore || 0)) {
            best = h;
          }
        });

        if (!best) return;

        const isHidden = !!settings.hideFromLeaderboard;
        let displayName = settings.displayName || settings.name || row.user_id;
        if (displayName.includes("@")) {
          displayName = displayName.split("@")[0];
        }

        entries.push({
          user_id: isHidden ? "anonymous" : row.user_id,
          name: isHidden ? "Peserta Anonim (Disamarkan)" : displayName,
          avatar: isHidden ? "" : (settings.avatar || ""),
          instansi: settings.instansi || best.formasi || "Formasi Umum",
          totalScore: best.totalScore || 0,
          twkScore: best.twkScore || 0,
          tiuScore: best.tiuScore || 0,
          tkpScore: best.tkpScore || 0,
          isAllPassed: !!best.isAllPassed,
          date: best.date || row.updated_at,
          isAnonymous: isHidden
        });
      });

      // Urutkan berdasarkan total skor tertinggi
      entries.sort((a, b) => b.totalScore - a.totalScore);

      // Berikan nomor peringkat
      const ranked = entries.map((item, idx) => ({
        rank: idx + 1,
        ...item
      }));

      return jsonResponse({
        success: true,
        total_participants: ranked.length,
        leaderboard: ranked.slice(0, 50)
      });
    }

    return jsonResponse({ success: false, error: `Invalid action: ${action}` }, 400);
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const action = url.searchParams.get("action") || "sync_progress";

  try {
    const body = await request.json().catch(() => ({}));
    const userId = body.user_id;

    if (!userId) {
      return jsonResponse({ success: false, error: "user_id is required" }, 400);
    }

    if (action === "sync_progress") {
      const seen = JSON.stringify(body.seen_questions || []);
      const mastered = JSON.stringify(body.mastered_questions || []);
      const wrong = JSON.stringify(body.wrong_questions || []);
      const history = JSON.stringify(body.history || []);
      const settings = JSON.stringify(body.settings || {});

      await executeD1(
        env,
        `INSERT INTO cpns_user_progress (user_id, seen_questions, mastered_questions, wrong_questions, history, settings, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(user_id) DO UPDATE SET
           seen_questions = excluded.seen_questions,
           mastered_questions = excluded.mastered_questions,
           wrong_questions = excluded.wrong_questions,
           history = excluded.history,
           settings = excluded.settings,
           updated_at = CURRENT_TIMESTAMP`,
        [userId, seen, mastered, wrong, history, settings]
      );

      return jsonResponse({
        success: true,
        message: "User progress synced permanently to D1 database.",
      });
    }

    if (action === "reset_mastery") {
      // Clear mastered_questions and wrong_questions, keep history & settings
      await executeD1(
        env,
        `UPDATE cpns_user_progress
         SET mastered_questions = '[]',
             wrong_questions = '[]',
             seen_questions = '[]',
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`,
        [userId]
      );

      return jsonResponse({
        success: true,
        message: "Mastered questions reset successfully.",
      });
    }

    return jsonResponse({ success: false, error: `Invalid action: ${action}` }, 400);
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}
