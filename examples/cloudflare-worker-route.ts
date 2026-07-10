/**
 * Example Cloudflare Worker route that calls the Bila UiTM Cuti API
 * and caches results at the edge using the Cache API + KV.
 *
 * Pattern: GET /today-status?group=A&date=2026-03-09
 *   -> proxies https://api.bilauitmcuti.com/api/v1/today
 *
 * Fits a Next.js-on-Cloudflare-Pages + Workers + D1/KV stack.
 * See ../skills/bilauitmcuti-api/references/api-reference.md for full field docs.
 */

export interface Env {
  BILA_CACHE: KVNamespace; // bind a KV namespace named BILA_CACHE in wrangler.toml
}

const BASE_URL = "https://api.bilauitmcuti.com";
const CACHE_TTL_SECONDS = 60 * 60; // 1 hour — calendar/holiday data changes rarely

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/today-status") {
      return handleTodayStatus(url, env);
    }

    return new Response("Not found", { status: 404 });
  },
};

async function handleTodayStatus(url: URL, env: Env): Promise<Response> {
  const group = url.searchParams.get("group");
  const date = url.searchParams.get("date") ?? undefined;
  const session = url.searchParams.get("session") ?? undefined;

  if (group !== "A" && group !== "B") {
    return Response.json({ error: "Query param 'group' must be 'A' or 'B'" }, { status: 400 });
  }

  const cacheKey = `today:${group}:${date ?? "today"}:${session ?? "default"}`;

  // 1. Check KV cache first — avoid hitting the upstream API on every request.
  const cached = await env.BILA_CACHE.get(cacheKey, "json");
  if (cached) {
    return Response.json(cached, { headers: { "X-Cache": "HIT" } });
  }

  // 2. Call the upstream API.
  const upstreamUrl = new URL(`${BASE_URL}/api/v1/today`);
  upstreamUrl.searchParams.set("group", group);
  if (date) upstreamUrl.searchParams.set("date", date);
  if (session) upstreamUrl.searchParams.set("session", session);

  const upstreamRes = await fetch(upstreamUrl.toString());

  if (upstreamRes.status === 429) {
    const retryAfter = upstreamRes.headers.get("Retry-After") ?? "60";
    return Response.json(
      { error: "Upstream rate limited, try again later" },
      { status: 429, headers: { "Retry-After": retryAfter } },
    );
  }

  if (!upstreamRes.ok) {
    const body = await upstreamRes.json().catch(() => null);
    return Response.json(
      { error: "Upstream error", upstreamStatus: upstreamRes.status, upstreamBody: body },
      { status: 502 },
    );
  }

  const data = await upstreamRes.json();

  // 3. Populate cache for next time.
  await env.BILA_CACHE.put(cacheKey, JSON.stringify(data), { expirationTtl: CACHE_TTL_SECONDS });

  return Response.json(data, { headers: { "X-Cache": "MISS" } });
}
