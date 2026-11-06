/**
 * Cloudflare Pages Function: /api/telegram
 * Endpoint fleksibel untuk kirim pesan/log kustom ke Telegram
 */

import { onRequestPost as contactPost, onRequestOptions as contactOptions, onRequestGet as contactGet } from "./contact.js";

export const onRequestPost = contactPost;
export const onRequestOptions = contactOptions;
export const onRequestGet = contactGet;

