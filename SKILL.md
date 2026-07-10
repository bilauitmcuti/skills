---
name: bilauitmcuti-api
description: Use this skill whenever an agent needs to call, integrate, debug, or write code against the Bila UiTM Cuti API (api.bilauitmcuti.com) — UiTM academic calendar data (sessions, calendar activities, today's status, lecture weeks 1-14) and Malaysia public holiday data. Trigger this any time the user mentions "Bila UiTM Cuti", "bilauitmcuti", "bilacuti.my", UiTM academic calendar/session/semester data, UiTM lecture weeks, Group A / Group B UiTM schedules, or Malaysia public holiday lookups by state/year, even if they don't give the exact endpoint URL. Also use this before writing any fetch/axios/requests call, API client, cron job, Discord/Telegram bot command, or Cloudflare Worker route that talks to api.bilauitmcuti.com, to make sure the correct base URL, query params, and response shape are used.
---

# Bila UiTM Cuti API

Agent skill for correctly integrating with the **Bila UiTM Cuti API**, an unofficial, read-only, no-auth REST API providing:

1. UiTM academic calendar data (session metadata, calendar activities, "today's status", lecture weeks 1–14, for Group A and Group B)
2. Malaysia public holiday data (by year, state/territory, and coverage type)

Base URL: `https://api.bilauitmcuti.com`
OpenAPI spec: `https://api.bilauitmcuti.com/api/openapi.json`
Human docs: `https://api.bilauitmcuti.com/docs`

**Important — this is unofficial data.** The API is not affiliated with UiTM. Always tell the user to verify dates before using them for anything high-stakes (exam dates, deadlines, official leave), and never present output as UiTM's own official word.

## When to consult which file

- **This file (SKILL.md)** — quick orientation, the 4 endpoints at a glance, the standard call sequence, and common gotchas. Read this first, always.
- **`references/api-reference.md`** — full endpoint reference: every query param, every response field, with types and examples. Read this before writing any non-trivial integration code, or when you need exact field names for parsing a response.
- **`examples/`** — copy-paste-ready working code. Read the file matching the stack you're using (`fetch-client.ts`, `python-client.py`, `curl-examples.sh`, `cloudflare-worker-route.ts`, `discord-bot-command.ts`). Adapt rather than reinvent.

## At a glance

| Property | Value |
|---|---|
| Auth | None — plain unauthenticated `GET` requests |
| Methods | `GET` only (read-only API) |
| Versioning | All routes prefixed `/api/v1` |
| Rate limits | Per-IP when configured; handle `429` + `Retry-After` header |
| Caching | Supports `ETag` / `Cache-Control`; send `If-None-Match` to get `304` |
| Errors | `400` = bad query param (has `error` field), `404` = unknown session on `/calendar` or `/lecture-weeks`, `429` = rate limited |

### The 6 endpoints

| Endpoint | Purpose |
|---|---|
| `GET /api/v1/meta` | Session + program options (call this first to discover valid `session` IDs) |
| `GET /api/v1/calendar` | Calendar activity rows for a session (or a whole group) |
| `GET /api/v1/today` | What's happening on a given date: class day / break / exam week / study week |
| `GET /api/v1/lecture-weeks` | Instructional Weeks 1–14 for a session, with break days already stripped out |
| `GET /api/v1/public-holiday/meta` | Holiday filter options: years, coverage modes, states list |
| `GET /api/v1/public-holiday` | Malaysia public holiday rows, filterable by year / state / coverage |

## Standard call sequence (do this, don't guess session IDs)

Session IDs like `A-20251` or `B-20263` are **not guessable from a semester name** — always resolve them via `meta` first.

1. **Discover options**: call `/api/v1/meta?group=A` or `?group=B` (or `?all=true` for both) to get `sessionOptions` and `defaultSession`.
2. **For holidays**: call `/api/v1/public-holiday/meta` to get valid `yearOptions` and `stateOptions` slugs before filtering.
3. **Fetch the data you actually need**:
   - Full activity list for a session → `/api/v1/calendar?session=<id>&group=<A|B>`
   - Single-day status (e.g. "is there class today?") → `/api/v1/today?group=<A|B>&date=<ISO date>`
   - Clean week-by-week lecture schedule → `/api/v1/lecture-weeks?session=<id>`
   - Holidays → `/api/v1/public-holiday?year=<yyyy>&state=<slug>` or `&coverage=all|nationwide`
4. **Handle empty/missing session** as a `404`, not a crash — a session bucket may not exist yet.
5. **Cache responses** (ETag) when polling repeatedly, e.g. in a cron job or bot — this is a small hobby-scale API, be a good citizen.

## Common gotchas

- `group` is required-ish in practice: `/today` needs `group` to resolve a session; `/calendar` and `/meta` default to aggregating everything if you omit both `session` and `group`, which is usually not what you want.
- `program` filter (e.g. `Diploma`) is mainly relevant for **Group B** — Group A programs typically don't need it.
- `all=true` (legacy alias: `entire=true`) on `/meta` or `/calendar` returns the *entire* dataset across all sessions/groups — only use this for admin/dump use cases, not for a single student-facing query, since it's a much heavier payload.
- `/lecture-weeks` already removes break days from within a week and skips weeks that are entirely break — don't re-filter `type` on this endpoint, that's for `/calendar` only.
- State filter values for public holidays are **slugs** (`kuala-lumpur`, `pulau-pinang`, `negeri-sembilan`), not display names — get exact slugs from `/api/v1/public-holiday/meta`.
- `coverage=all` on `/public-holiday` ignores `state` entirely — don't combine them expecting a filtered "all" result.
- No API key, but don't hammer it — respect `429`/`Retry-After` with backoff, especially from Workers/cron/bot contexts that may run frequently.

## Quick verification

Sanity-check any integration with a plain curl before wiring it into code:

```bash
curl -sS "https://api.bilauitmcuti.com/api/v1/meta?group=A" | head -c 500
```

If that returns JSON with `sessionOptions`, the base URL and network path are good — the rest is just param plumbing (see `references/api-reference.md`).
