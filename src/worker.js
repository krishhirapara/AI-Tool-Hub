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

async function reviews(request, env) {
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
    await env.DB.prepare("INSERT INTO reviews (tool_slug, display_name, rating, body) VALUES (?, ?, ?, ?)").bind(slug, name, data.rating, body).run();
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
    if (pathname === "/api/reviews") return reviews(request, env);
    if (pathname === "/api/subscribe") return subscribe(request, env);
    if (pathname.startsWith("/api/")) return error(404, "not_found");
    return env.ASSETS.fetch(request);
  }
};
