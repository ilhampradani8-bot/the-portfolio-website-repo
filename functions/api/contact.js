/**
 * Cloudflare Pages Function: /api/contact
 * Menerima formulir pesan dari web portofolio dan langsung meneruskannya ke Telegram Admin
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function onRequestGet({ env }) {
  return new Response(
    JSON.stringify({
      status: "online",
      service: "Ilham Pradani Portfolio Contact API",
      telegram_bot: "@log_system_server_bot",
      edge: "Cloudflare Workers Edge",
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json",
      },
    }
  );
}

export async function onRequestPost({ request, env }) {
  try {
    const botToken = env.TELEGRAM_BOT_TOKEN;
    const chatId = env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return new Response(
        JSON.stringify({ success: false, error: "Konfigurasi bot token belum diatur" }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    let body = {};
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await request.json();
    } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      for (const [key, value] of formData.entries()) {
        body[key] = value;
      }
    } else {
      body = await request.json().catch(() => ({}));
    }

    const name = (body.name || "Anonim").trim();
    const email = (body.email || "-").trim();
    const phone = (body.phone || body.whatsapp || "-").trim();
    const subject = (body.subject || "Pesan Baru dari Web Portofolio").trim();
    const message = (body.message || "").trim();

    if (!message) {
      return new Response(
        JSON.stringify({ success: false, error: "Pesan tidak boleh kosong" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Ekstrak info pengunjung dari Cloudflare headers
    const ip = request.headers.get("cf-connecting-ip") || "Unknown";
    const country = request.headers.get("cf-ipcountry") || "Unknown";
    const city = request.headers.get("cf-ipcity") || "";
    const locationStr = city ? `${city}, ${country}` : country;

    const now = new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      dateStyle: "full",
      timeStyle: "medium",
    });

    const telegramText = 
`📬 <b>[PORTOFOLIO WEB] Pesan Baru Diterima!</b>

👤 <b>Pengirim:</b> ${escapeHtml(name)}
📧 <b>Email:</b> ${escapeHtml(email)}
📱 <b>Kontak/WA:</b> ${escapeHtml(phone)}
📌 <b>Subjek:</b> ${escapeHtml(subject)}

💬 <b>Pesan:</b>
<i>${escapeHtml(message)}</i>

───────────────────
🌐 <b>IP:</b> <code>${ip}</code> (${locationStr})
🕒 <b>Waktu:</b> ${now} WIB
🚀 <b>Host:</b> ilhampradani.chainasiaconnect.co.id`;

    // Kirim pesan ke Telegram Bot
    const telegramResp = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: telegramText,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      }
    );

    const telegramData = await telegramResp.json();

    if (!telegramData.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Gagal meneruskan ke Telegram",
          details: telegramData.description,
        }),
        { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Pesan Anda berhasil dikirim langsung ke Telegram Dr. Ilham Pradani!",
      }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Internal Server Error" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
