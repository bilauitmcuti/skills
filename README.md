# bilauitmcuti-api (Claude Agent Skill)

An agent skill so Claude Code / Cursor Agent / Claude.ai always calls the **Bila UiTM Cuti API** correctly — right base URL, right query params, right response shape — instead of guessing endpoint names or hallucinating fields.

The API: unofficial, read-only, no-auth REST API for UiTM academic calendar data (Group A / Group B sessions, calendar activities, "today's status", lecture weeks 1–14) and Malaysia public holiday data.

- Live docs: https://api.bilauitmcuti.com/docs
- OpenAPI spec: https://api.bilauitmcuti.com/api/openapi.json
- Base URL: `https://api.bilauitmcuti.com`

## What's in this skill

```
bilauitmcuti-api/
├── README.md                          <- you are here
├── SKILL.md                           <- the skill itself: frontmatter + quick-start
├── references/
│   └── api-reference.md               <- full endpoint reference (params, fields, examples)
└── examples/
    ├── fetch-client.ts                <- typed TS client, zero deps (Node/Workers/browser)
    ├── python-client.py                <- Python client using `requests`
    ├── curl-examples.sh                <- curl cookbook, one block per endpoint
    ├── cloudflare-worker-route.ts      <- Worker route proxying + KV-caching the API
    └── bot-command.ts                  <- grammY-style bot command ("is there class today?")
```

## Install

### Claude Code / Claude.ai (as a Skill)

1. Copy the `bilauitmcuti-api/` folder into your skills directory (e.g. `.claude/skills/` for a project, or wherever your Claude Code / Cursor Agent setup loads skills from).
2. Claude will pick up `SKILL.md`'s frontmatter automatically and trigger it whenever a task touches `api.bilauitmcuti.com`, UiTM academic calendar data, or Malaysia public holiday lookups.
3. No install step for the API itself — it's a public, no-auth API. Nothing to configure.

### Just want the reference, no agent involved?

Read `references/api-reference.md` directly, or import the OpenAPI spec (`https://api.bilauitmcuti.com/api/openapi.json`) into Postman / Insomnia / Hoppscotch, or feed it to [OpenAPI Generator](https://openapi-generator.tech/docs/installation) to produce a typed client in your language of choice.

## Quick sanity check

```bash
curl -sS "https://api.bilauitmcuti.com/api/v1/meta?group=A" | head -c 500
```

If you get back JSON with `sessionOptions`, you're good — go build.

## The 6 endpoints (summary)

| Endpoint | What it returns |
|---|---|
| `GET /api/v1/meta` | Valid session + program options (start here) |
| `GET /api/v1/calendar` | Calendar activity rows for a session/group |
| `GET /api/v1/today` | Class day / break / exam week / study week for a date |
| `GET /api/v1/lecture-weeks` | Clean Weeks 1–14 schedule, break days stripped |
| `GET /api/v1/public-holiday/meta` | Holiday filter options (years, coverage, state slugs) |
| `GET /api/v1/public-holiday` | Malaysia public holiday rows |

Full param/field docs live in `references/api-reference.md`.

## Design notes / gotchas baked into the skill

- Session IDs (`A-20251`, `B-20263`) aren't guessable — the skill always resolves them via `/meta` first rather than hardcoding.
- `group` is effectively required for `/today` to resolve a session.
- `program` filtering mostly matters for Group B.
- `/lecture-weeks` already strips break days — don't double-filter by `type`.
- State filters for holidays are lowercase slugs (`kuala-lumpur`, not `Kuala Lumpur`).
- The API is unauthenticated but not unlimited — the skill nudges toward ETag caching and `Retry-After` backoff so bots/cron jobs don't hammer it.
- This is unofficial data, not affiliated with UiTM — the skill reminds Claude to flag that important dates should be verified.

## Updating this skill

If the API adds endpoints or changes fields, re-fetch `https://api.bilauitmcuti.com/api/openapi.json` and `https://api.bilauitmcuti.com/docs`, then update `references/api-reference.md` (source of truth for fields/params) and adjust `SKILL.md`'s "6 endpoints" table and gotchas if behavior changed. Keep `SKILL.md` itself short — push detail into `references/`.

## License

MIT, matching the rest of the `bilauitmcuti` project ecosystem.
