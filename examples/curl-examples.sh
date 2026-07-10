#!/usr/bin/env bash
# Bila UiTM Cuti API - curl cookbook.
# Run any block individually to sanity-check the API before wiring up code.
# See ../references/api-reference.md for full field docs.

BASE="https://api.bilauitmcuti.com"

# --- Discover sessions/programs (do this first) ---
curl -sS "$BASE/api/v1/meta?group=A" | jq .
curl -sS "$BASE/api/v1/meta?group=B" | jq .
curl -sS "$BASE/api/v1/meta?all=true" | jq .          # full catalog, all groups

# --- Calendar activities ---
curl -sS "$BASE/api/v1/calendar?session=A-20251&group=A" | jq .
curl -sS "$BASE/api/v1/calendar?session=B-20263&group=B&program=Diploma&type=break" | jq .
curl -sS "$BASE/api/v1/calendar?group=B&allSessions=true" | jq .   # every session in Group B

# --- Today's status ---
curl -sS "$BASE/api/v1/today?group=A" | jq .                                  # today, Group A
curl -sS "$BASE/api/v1/today?group=B&date=2026-03-09&session=B-20263" | jq .  # specific date

# --- Lecture weeks (1-14, break days already removed) ---
curl -sS "$BASE/api/v1/lecture-weeks?session=B-20263" | jq .

# --- Public holiday filter options ---
curl -sS "$BASE/api/v1/public-holiday/meta" | jq .

# --- Public holidays ---
curl -sS "$BASE/api/v1/public-holiday?year=2026" | jq .                       # default year if omitted
curl -sS "$BASE/api/v1/public-holiday?year=2026&state=selangor" | jq .        # nationwide + Selangor rows
curl -sS "$BASE/api/v1/public-holiday?year=2026&coverage=nationwide" | jq .   # nationwide-only
curl -sS "$BASE/api/v1/public-holiday?year=2026&coverage=all" | jq .          # every row, state filter ignored

# --- Caching with ETag (good citizen pattern for cron/bots) ---
ETAG=$(curl -sS -D - -o /dev/null "$BASE/api/v1/public-holiday/meta" | grep -i '^etag:' | cut -d' ' -f2 | tr -d '\r')
curl -sS -H "If-None-Match: $ETAG" -o /dev/null -w "%{http_code}\n" "$BASE/api/v1/public-holiday/meta"
# ^ should print 304 if nothing changed since last fetch

# --- Handling rate limits ---
# On 429, read the Retry-After header and back off:
curl -sS -D - -o /dev/null "$BASE/api/v1/today?group=A" | grep -i 'retry-after'
