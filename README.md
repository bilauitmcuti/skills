# bilauitmcuti-api

**Agent skill so every coding agent calls the Bila UiTM Cuti API correctly.**

[![skills.sh](https://skills.sh/b/bilauitmcuti/skills)](https://skills.sh/bilauitmcuti/skills)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Correct base URL, query params, and response shape — instead of guessing endpoint names or hallucinating fields. Works across **landing pages, bots, cron jobs, Cloudflare Workers, mobile apps, dashboards**, and more. The agent reads `SKILL.md` first, then loads `references/api-reference.md` on demand. Code **examples** are optional (different stacks) and live outside the default install.

The API: unofficial, read-only, no-auth REST API for UiTM academic calendar data (Group A / Group B sessions, calendar activities, "today's status", lecture weeks 1–14) and Malaysia public holiday data.

- Live docs: https://api.bilauitmcuti.com/docs
- OpenAPI spec: https://api.bilauitmcuti.com/api/openapi.json
- Base URL: `https://api.bilauitmcuti.com`

**Author:** [bilauitmcuti](https://github.com/bilauitmcuti) · **Version:** 1.0.0

---

## Install

Works in any terminal with [Node.js](https://nodejs.org/) installed. The CLI auto-detects your coding agent (Cursor, Claude Code, Codex, OpenCode, Copilot, Windsurf, Cline, and [68+ more](https://github.com/vercel-labs/skills#supported-agents)).

```bash
npx skills add bilauitmcuti/skills --skill bilauitmcuti-api
```

Installs into the current project by default — good for teams (share via git). Add `-g` for all projects on your machine, or `-y` to skip prompts.

The CLI copies the skill core — `SKILL.md` and `references/api-reference.md` — into your agent's skills directory. **Examples are not included** (stacks differ: TypeScript, Python, Workers, bots, etc.).

> **Why `skills/bilauitmcuti-api/`?** The [skills CLI](https://github.com/vercel-labs/skills) only installs `SKILL.md` when it sits at the **repo root**. Supporting files like `references/` are included only when the skill lives in a subdirectory like `skills/<name>/`. Examples stay at repo root so they are not bundled into every install.

No install step for the API itself — it's a public, no-auth API. Nothing to configure.

### Optional: install examples

Only if you want a copy-paste starter for a specific stack. Pick one file or clone the whole folder:

```bash
# All examples into ./bilauitmcuti-examples/
npx --yes degit bilauitmcuti/skills/examples ./bilauitmcuti-examples

# Or a single file (TypeScript fetch client)
curl -sS -o bilauitmcuti-fetch-client.ts \
  https://raw.githubusercontent.com/bilauitmcuti/skills/main/examples/fetch-client.ts
```

PowerShell (single file):

```powershell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/bilauitmcuti/skills/main/examples/fetch-client.ts" -OutFile "bilauitmcuti-fetch-client.ts"
```

Browse all samples: https://github.com/bilauitmcuti/skills/tree/main/examples

### Ask your agent to install

Paste this into Cursor, Claude Code, Codex, OpenCode, Copilot, or any agent with terminal access:

```
Install the bilauitmcuti-api agent skill:

npx skills add bilauitmcuti/skills --skill bilauitmcuti-api

Verify with: npx skills list
```

Or shorter:

```
Set up the bilauitmcuti-api skill from github.com/bilauitmcuti/skills using npx skills
```

### Where files go

| Agent | Project path | Global path (`-g`) |
|-------|--------------|-------------------|
| Cursor, Codex, Copilot, OpenCode, Cline, … | `.agents/skills/bilauitmcuti-api/` | `~/.cursor/skills/bilauitmcuti-api/` or agent-specific home dir |
| Claude Code | `.claude/skills/bilauitmcuti-api/` | `~/.claude/skills/bilauitmcuti-api/` |
| Windsurf | `.windsurf/skills/bilauitmcuti-api/` | `~/.codeium/windsurf/skills/bilauitmcuti-api/` |

Full matrix: [vercel-labs/skills — Supported Agents](https://github.com/vercel-labs/skills#supported-agents)

### Verify

```bash
npx skills list
```

Confirm the reference was installed (examples should **not** be present):

```bash
# Unix / macOS / Git Bash
ls .agents/skills/bilauitmcuti-api/references/api-reference.md
test ! -d .agents/skills/bilauitmcuti-api/examples && echo "OK: examples not bundled"
```

```powershell
Test-Path .agents\skills\bilauitmcuti-api\references\api-reference.md
-not (Test-Path .agents\skills\bilauitmcuti-api\examples)  # should be True (no examples dir)
```

If that file is missing, re-run install after pulling the latest repo (the skill must be under `skills/bilauitmcuti-api/`, not at repo root).

---

## Update

**Skills do not auto-update.** When this repo changes, pull the latest version:

```bash
npx skills update bilauitmcuti-api
```

Or re-run the install command from your project root. If `.agents/skills/bilauitmcuti-api/` is committed in your repo, you can also `git pull` to get updates from your team.

Check for updates without installing:

```bash
npx skills check
```

**Maintainers:** If the API adds endpoints or changes fields, re-fetch `https://api.bilauitmcuti.com/api/openapi.json` and `https://api.bilauitmcuti.com/docs`, then update `skills/bilauitmcuti-api/references/api-reference.md` (source of truth for fields/params) and adjust `skills/bilauitmcuti-api/SKILL.md`'s endpoint table and gotchas if behavior changed. Keep `SKILL.md` itself short — push detail into `references/`.

---

## Remove

```bash
npx skills remove bilauitmcuti-api
```

---

## Use when

- Call, integrate, debug, or write code against `api.bilauitmcuti.com`
- UiTM academic calendar data — Group A / Group B sessions, lecture weeks, today's status
- Malaysia public holiday lookups by state, year, or coverage
- Build API clients, cron jobs, Discord/Telegram bots, or Cloudflare Worker routes
- User mentions "Bila UiTM Cuti", "bilauitmcuti", "bilacuti.my", or UiTM semester/session data
- Before writing any `fetch` / `axios` / `requests` call — avoid guessing endpoints or field names
- Just want the reference, no agent — read `references/api-reference.md` or import the [OpenAPI spec](https://api.bilauitmcuti.com/api/openapi.json) into Postman / Insomnia / Hoppscotch

---

## Usage

Once installed, ask in natural language — the skill auto-triggers on API integration requests.

```
Build a typed fetch client for today's class status (Group B)
```

```
Add a Telegram bot command: "is there class today?"
```

```
Fetch Malaysia public holidays for Selangor in 2026
```

```
Proxy the today endpoint in a Cloudflare Worker with KV cache
```

```
Debug why /calendar returns 404 for my session ID
```

```
Write a Python script that lists all break weeks for session B-20263
```

```
Show me the lecture week schedule for Group A this semester
```

---

## Repository structure

```
skills/                       # Default npx install (SKILL.md + references only)
└── bilauitmcuti-api/
    ├── SKILL.md              # Core workflow + quick-start
    └── references/
        └── api-reference.md  # Full endpoint reference (params, fields, examples)
examples/                     # Optional — not installed by npx skills add
    ├── fetch-client.ts       # Typed TS client, zero deps (Node/Workers/browser)
    ├── python-client.py      # Python client using requests
    ├── curl-examples.sh      # curl cookbook, one block per endpoint
    ├── cloudflare-worker-route.ts  # Worker route proxying + KV-caching the API
    └── bot-command.ts        # grammY-style bot command ("is there class today?")
README.md
LICENSE
```

Reference files load on demand during integration work. Examples are opt-in — see [Optional: install examples](#optional-install-examples) above.

---

## What it covers

**API surfaces**

| Surface | Endpoints |
|---------|-----------|
| Academic calendar | `GET /api/v1/meta`, `/calendar`, `/today`, `/lecture-weeks` |
| Public holidays | `GET /api/v1/public-holiday/meta`, `/public-holiday` |

**The 6 endpoints (summary)**

| Endpoint | What it returns |
|---|---|
| `GET /api/v1/meta` | Valid session + program options (start here) |
| `GET /api/v1/calendar` | Calendar activity rows for a session/group |
| `GET /api/v1/today` | Class day / break / exam week / study week for a date |
| `GET /api/v1/lecture-weeks` | Clean Weeks 1–14 schedule, break days stripped |
| `GET /api/v1/public-holiday/meta` | Holiday filter options (years, coverage, state slugs) |
| `GET /api/v1/public-holiday` | Malaysia public holiday rows |

Full param/field docs live in `skills/bilauitmcuti-api/references/api-reference.md` (installed to `references/api-reference.md` inside the skill folder).

**Optional code samples** (repo root `examples/`, not bundled with `npx skills add`)

| Type | File |
|------|------|
| TypeScript / Node / browser | [examples/fetch-client.ts](examples/fetch-client.ts) |
| Python | [examples/python-client.py](examples/python-client.py) |
| Shell / curl | [examples/curl-examples.sh](examples/curl-examples.sh) |
| Cloudflare Workers | [examples/cloudflare-worker-route.ts](examples/cloudflare-worker-route.ts) |
| Chat bots | [examples/bot-command.ts](examples/bot-command.ts) |

**Gotchas baked into the skill**

- Session IDs (`A-20251`, `B-20263`) aren't guessable — always resolve via `/meta` first, never hardcode
- `group` is effectively required for `/today` to resolve a session
- `program` filtering mostly matters for Group B
- `/lecture-weeks` already strips break days — don't double-filter by `type`
- State filters for holidays are lowercase slugs (`kuala-lumpur`, not `Kuala Lumpur`)
- The API is unauthenticated but not unlimited — use ETag caching and `Retry-After` backoff for bots/cron jobs
- This is unofficial data, not affiliated with UiTM — verify important dates before relying on them

---

## How it works

1. **Context** — reads `SKILL.md` for base URL, standard call sequence, and common gotchas
2. **Reference** — loads `references/api-reference.md` for exact params, fields, and examples
3. **Optional samples** — if needed, fetch the matching file from [examples/](examples/) on GitHub (not installed by default)
4. **Call sequence** — meta → filter options → fetch data (never guess session IDs)
5. **Verify** — curl sanity check before wiring into production code

### Quick sanity check

```bash
curl -sS "https://api.bilauitmcuti.com/api/v1/meta?group=A" | head -c 500
```

If you get back JSON with `sessionOptions`, you're good — go build.

---

## Contributing

Issues and PRs welcome at https://github.com/bilauitmcuti/skills/issues

---

## License

MIT © [bilauitmcuti](https://github.com/bilauitmcuti) — see [LICENSE](LICENSE).
