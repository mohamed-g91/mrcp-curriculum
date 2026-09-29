// The presenter's decks (/present/...) sit behind a password on the live site.
// Cloudflare Pages runs this before serving any file under /present. The password is the
// PRESENTER_PASSWORD variable (Settings → Variables and Secrets, as a secret); any user name works.
// With no password set the decks stay shut, so a missing setting never opens them.
const enc = new TextEncoder();

// compare two strings without leaking how much of them matched
async function same(a, b) {
  const [x, y] = await Promise.all([a, b].map(s => crypto.subtle.digest("SHA-256", enc.encode(s))));
  return crypto.subtle.timingSafeEqual(x, y);
}

function ask() {
  return new Response("Presenter only.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="mrcp_Gafar presenter", charset="UTF-8"', "Cache-Control": "no-store" },
  });
}

export async function onRequest({ request, env, next }) {
  const secret = env.PRESENTER_PASSWORD;
  if (!secret) return new Response("The presenter's decks are shut: PRESENTER_PASSWORD is not set.", { status: 503 });
  const auth = request.headers.get("Authorization") || "";
  if (!auth.startsWith("Basic ")) return ask();
  let pass = "";
  try { pass = atob(auth.slice(6)).split(":").slice(1).join(":"); } catch (e) { return ask(); }
  if (!(await same(pass, secret))) return ask();
  const res = await next();
  const out = new Response(res.body, res);
  out.headers.set("Cache-Control", "private, no-store");
  out.headers.set("X-Robots-Tag", "noindex, nofollow");
  return out;
}
