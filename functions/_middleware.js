/**
 * Cloudflare Pages Middleware
 * Routes admin.ilhampradani.me and /admin to /admin-portfolio
 */

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const hostname = url.hostname.toLowerCase();

  // 1. If accessed via admin subdomain (e.g. admin.ilhampradani.me)
  if (hostname.startsWith("admin.")) {
    // If root or /admin, rewrite directly to /admin-portfolio.html
    if (url.pathname === "/" || url.pathname === "" || url.pathname === "/admin" || url.pathname === "/admin/") {
      url.pathname = "/admin-portfolio.html";
      return context.env.ASSETS.fetch(url);
    }
  }

  // 2. Direct clean URL alias: /admin or /admin/
  if (url.pathname === "/admin" || url.pathname === "/admin/") {
    url.pathname = "/admin-portfolio.html";
    return context.env.ASSETS.fetch(url);
  }

  return context.next();
}
