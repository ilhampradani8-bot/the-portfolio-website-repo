/**
 * Cloudflare Pages Middleware
 * Routes:
 * - admin.ilhampradani.me & /admin -> /admin-portfolio.html
 * - tryout.ilhampradani.me & /tryout -> /tryout/index.html
 */

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const hostname = url.hostname.toLowerCase();

  // 1. If accessed via tryout subdomain (e.g. tryout.ilhampradani.me)
  if (hostname.startsWith("tryout.")) {
    if (url.pathname === "/" || url.pathname === "") {
      url.pathname = "/tryout/index.html";
      return context.env.ASSETS.fetch(url);
    }
    // If relative assets accessed from root on tryout subdomain
    if (!url.pathname.startsWith("/tryout/")) {
      url.pathname = "/tryout" + url.pathname;
      return context.env.ASSETS.fetch(url);
    }
  }

  // 2. Direct clean URL alias: /tryout or /tryout/
  if (url.pathname === "/tryout" || url.pathname === "/tryout/") {
    url.pathname = "/tryout/index.html";
    return context.env.ASSETS.fetch(url);
  }

  // 3. If accessed via admin subdomain (e.g. admin.ilhampradani.me)
  if (hostname.startsWith("admin.")) {
    // If root or /admin, rewrite directly to /admin-portfolio.html
    if (url.pathname === "/" || url.pathname === "" || url.pathname === "/admin" || url.pathname === "/admin/") {
      url.pathname = "/admin-portfolio.html";
      return context.env.ASSETS.fetch(url);
    }
  }

  // 4. Direct clean URL alias: /admin or /admin/
  if (url.pathname === "/admin" || url.pathname === "/admin/") {
    url.pathname = "/admin-portfolio.html";
    return context.env.ASSETS.fetch(url);
  }

  return context.next();
}

