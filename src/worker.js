const SLUG_PATTERN = /^[a-z0-9-]{2,50}$/;
const LINK_PATTERN = /http:\/\/|https:\/\/|www\./i;

function json(data, status, extraHeaders) {
  const headers = new Headers({
    "Content-Type": "application/json",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store"
  });
  if (extraHeaders) new Headers(extraHeaders).forEach((value, key) => headers.set(key, value));
  return new Response(JSON.stringify(data), { status, headers });
}

function error(status, name, headers) {
  return json({ error: name }, status, headers);
}

function validOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  try { return new URL(origin).host === new URL(request.url).host; }
  catch { return false; }
}

async function readPayload(request) {
  if ((request.headers.get("Content-Type") || "").toLowerCase().split(";")[0].trim() !== "application/json") return null;
  try {
    const reader = request.body && request.body.getReader();
    if (!reader) return null;
    const chunks = [];
    let byteLength = 0;
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      byteLength += part.value.byteLength;
      if (byteLength > 16384) {
        await reader.cancel();
        return null;
      }
      chunks.push(part.value);
    }
    const bytes = new Uint8Array(byteLength);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    const text = new TextDecoder().decode(bytes);
    if (text.length > 4096) return null;
    return JSON.parse(text);
  } catch { return null; }
}

function cleanText(value) {
  return value.replace(/[\u0000-\u001f\u007f-\u009f]/g, "").trim();
}

// ---- Owner notification and one-click moderation (signed links) ----
const encoder = new TextEncoder();

async function hmacKey(secret) {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

async function signLink(secret, id, action) {
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(secret), encoder.encode(id + ":" + action));
  return Array.from(new Uint8Array(sig)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
}

async function validSignature(secret, id, action, sig) {
  if (!/^[0-9a-f]{64}$/.test(sig || "")) return false;
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i += 1) bytes[i] = parseInt(sig.substr(i * 2, 2), 16);
  return crypto.subtle.verify("HMAC", await hmacKey(secret), bytes, encoder.encode(id + ":" + action));
}

function esc(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function page(title, inner, status) {
  const html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>' + esc(title) + '</title><style>body{font-family:system-ui,sans-serif;max-width:34rem;margin:2rem auto;padding:0 1rem;line-height:1.5;color:#111}blockquote{margin:1rem 0;padding:.75rem 1rem;background:#f3f3f7;border-radius:8px;white-space:pre-wrap;overflow-wrap:anywhere}button{font:inherit;padding:.7rem 1.4rem;border:0;border-radius:8px;background:#6d28d9;color:#fff;cursor:pointer}button.reject{background:#b91c1c}</style></head><body>' + inner + '</body></html>';
  return new Response(html, { status: status || 200, headers: {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'"
  } });
}

async function moderate(request, env) {
  if (!env.MODERATE_SECRET) return error(404, "not_found");
  if (request.method !== "GET" && request.method !== "POST") return error(405, "method_not_allowed", { Allow: "GET, POST" });
  const url = new URL(request.url);
  const id = url.searchParams.get("id") || "";
  const action = url.searchParams.get("action") || "";
  const sig = url.searchParams.get("sig") || "";
  if (!/^\d{1,9}$/.test(id) || (action !== "approve" && action !== "reject") || !(await validSignature(env.MODERATE_SECRET, id, action, sig))) {
    return page("Link not valid", "<h1>This link is not valid</h1><p>Use the buttons in the newest email, or use the D1 console.</p>", 403);
  }
  try {
    if (request.method === "POST") {
      if (!validOrigin(request)) return error(403, "forbidden");
      const status = action === "approve" ? "approved" : "rejected";
      const result = await env.DB.prepare("UPDATE reviews SET status = ? WHERE id = ?").bind(status, Number(id)).run();
      if (!(result && result.meta && result.meta.changes > 0)) return page("Not found", "<h1>Review not found</h1>", 404);
      return page("Done", "<h1>Done</h1><p>Review " + esc(id) + " is now <strong>" + status + "</strong>.</p>");
    }
    const row = await env.DB.prepare("SELECT tool_slug, display_name, rating, body, status FROM reviews WHERE id = ?").bind(Number(id)).first();
    if (!row) return page("Not found", "<h1>Review not found</h1>", 404);
    const label = action === "approve" ? "Approve" : "Reject";
    return page(label + " review?", "<h1>" + label + " this review?</h1><p>Tool: <strong>" + esc(row.tool_slug) + "</strong><br>Name: " + esc(row.display_name) + "<br>Rating: " + esc(row.rating) + "/5<br>Current status: " + esc(row.status) + "</p><blockquote>" + esc(row.body) + '</blockquote><form method="POST" action="' + esc(url.pathname + url.search) + '"><button type="submit" class="' + action + '">' + label + " review</button></form><p>Nothing changes until you press the button.</p>");
  } catch { return error(500, "server"); }
}

// Emails the site owner about a new pending review. Never blocks or breaks saving the review.
function notifyNewReview(env, ctx, origin, review) {
  try {
    if (!env.EMAIL || !env.NOTIFY_TO || !env.NOTIFY_FROM) return;
    const task = (async function () {
      let actions = "To approve, run this in the D1 console (aitoolhub-db):\nUPDATE reviews SET status='approved' WHERE id=" + review.id + ";";
      if (env.MODERATE_SECRET && review.id) {
        const id = String(review.id);
        actions = "APPROVE (show it on the website):\n" + origin + "/api/moderate?id=" + id + "&action=approve&sig=" + await signLink(env.MODERATE_SECRET, id, "approve") +
          "\n\nREJECT (never show it):\n" + origin + "/api/moderate?id=" + id + "&action=reject&sig=" + await signLink(env.MODERATE_SECRET, id, "reject") +
          "\n\nEach link opens a page where you press a button to confirm. Nothing changes until you press it.";
      }
      await env.EMAIL.send({
        to: env.NOTIFY_TO,
        from: env.NOTIFY_FROM,
        subject: "New review to approve: " + review.slug + " (" + review.rating + "/5)",
        text: "A reader sent a new review. It is NOT shown on the website until you approve it.\n\n" +
          "Tool: " + review.slug + "\nName: " + review.name + "\nRating: " + review.rating + "/5\n\n" + review.body + "\n\n" + actions
      });
    })().catch(function () {});
    if (ctx && typeof ctx.waitUntil === "function") ctx.waitUntil(task);
  } catch (e) {}
}

async function reviews(request, env, ctx) {
  const url = new URL(request.url);
  if (request.method === "GET") {
    if (url.searchParams.get("latest") === "1") {
      try {
        const latest = await env.DB.prepare("SELECT tool_slug, display_name, rating, body, created_at FROM reviews WHERE status = 'approved' ORDER BY created_at DESC LIMIT 6").all();
        return json(latest.results || [], 200, { "Cache-Control": "public, max-age=60" });
      } catch { return error(500, "server"); }
    }
    const slug = url.searchParams.get("tool") || "";
    if (!SLUG_PATTERN.test(slug)) return json([], 400);
    try {
      const result = await env.DB.prepare("SELECT display_name, rating, body, created_at FROM reviews WHERE tool_slug = ? AND status = 'approved' ORDER BY created_at DESC LIMIT 100").bind(slug).all();
      return json(result.results || [], 200, { "Cache-Control": "public, max-age=60" });
    } catch { return error(500, "server"); }
  }
  if (request.method !== "POST") return error(405, "method_not_allowed", { Allow: "GET, POST" });
  if (!validOrigin(request)) return error(403, "forbidden");
  const data = await readPayload(request);
  if (!data || typeof data !== "object" || Array.isArray(data)) return error(400, "invalid");
  if (typeof data.website === "string" && data.website.length > 0) return json({ ok: true }, 201);
  const slug = data.tool_slug;
  const name = typeof data.display_name === "string" ? cleanText(data.display_name) : "";
  const body = typeof data.body === "string" ? cleanText(data.body) : "";
  if (typeof slug !== "string" || !SLUG_PATTERN.test(slug) || name.length < 2 || name.length > 40 || !Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5 || body.length < 20 || body.length > 1000 || LINK_PATTERN.test(name) || LINK_PATTERN.test(body)) return error(400, "invalid");
  try {
    const pending = await env.DB.prepare("SELECT COUNT(*) AS count FROM reviews WHERE status = 'pending'").first();
    if (Number(pending && pending.count) >= 200) return error(429, "busy");
    const saved = await env.DB.prepare("INSERT INTO reviews (tool_slug, display_name, rating, body) VALUES (?, ?, ?, ?)").bind(slug, name, data.rating, body).run();
    notifyNewReview(env, ctx, new URL(request.url).origin, { id: saved && saved.meta && saved.meta.last_row_id, slug, name, rating: data.rating, body });
    return json({ ok: true }, 201);
  } catch { return error(500, "server"); }
}

async function subscribe(request, env) {
  if (request.method !== "POST") return error(405, "method_not_allowed", { Allow: "POST" });
  if (!validOrigin(request)) return error(403, "forbidden");
  const data = await readPayload(request);
  if (!data || typeof data !== "object" || Array.isArray(data)) return error(400, "invalid");
  if (typeof data.website === "string" && data.website.length > 0) return json({ ok: true }, 201);
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  if (email.length > 254 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return error(400, "invalid");
  try {
    await env.DB.prepare("INSERT OR IGNORE INTO subscribers (email) VALUES (?)").bind(email).run();
    return json({ ok: true }, 201);
  } catch { return error(500, "server"); }
}

export default {
  async fetch(request, env, ctx) {
    const pathname = new URL(request.url).pathname;
    if (pathname === "/api/reviews") return reviews(request, env, ctx);
    if (pathname === "/api/moderate") return moderate(request, env);
    if (pathname === "/api/subscribe") return subscribe(request, env);
    if (pathname.startsWith("/api/")) return error(404, "not_found");
    return env.ASSETS.fetch(request);
  }
};
