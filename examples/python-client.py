"""
Bila UiTM Cuti API - minimal Python client.
Dependency: requests (pip install requests)

See ../skills/bilauitmcuti-api/references/api-reference.md for full field docs.
"""

from __future__ import annotations

import time
from typing import Any, Literal, Optional

import requests

BASE_URL = "https://api.bilauitmcuti.com"

Group = Literal["A", "B"]


class BilaUitmCutiApiError(Exception):
    def __init__(self, status: int, body: Any):
        self.status = status
        self.body = body
        error_msg = body.get("error") if isinstance(body, dict) else body
        super().__init__(f"Bila UiTM Cuti API error {status}: {error_msg}")


def _request(path: str, params: Optional[dict] = None, max_retries: int = 2) -> dict:
    """GET a path, retrying once on 429 using Retry-After."""
    params = {k: v for k, v in (params or {}).items() if v is not None}
    url = f"{BASE_URL}{path}"

    for attempt in range(max_retries + 1):
        res = requests.get(url, params=params, timeout=10)

        if res.status_code == 429 and attempt < max_retries:
            retry_after = int(res.headers.get("Retry-After", "1"))
            time.sleep(retry_after)
            continue

        if not res.ok:
            try:
                body = res.json()
            except ValueError:
                body = res.text
            raise BilaUitmCutiApiError(res.status_code, body)

        return res.json()

    raise BilaUitmCutiApiError(429, {"error": "Rate limited after retries"})


def get_meta(group: Optional[Group] = None, all_groups: bool = False) -> dict:
    """Discover valid session/program options. Call before hardcoding a session id."""
    return _request("/api/v1/meta", {"group": group, "all": "true" if all_groups else None})


def get_calendar(
    session: Optional[str] = None,
    group: Optional[Group] = None,
    program: Optional[str] = None,
    type: Optional[str] = None,
    all_sessions: bool = False,
) -> dict:
    """Calendar activity rows for a session, or aggregated across a group."""
    return _request(
        "/api/v1/calendar",
        {
            "session": session,
            "group": group,
            "program": program,
            "type": type,
            "allSessions": "true" if all_sessions else None,
        },
    )


def get_today(
    group: Group,
    date: Optional[str] = None,
    session: Optional[str] = None,
    program: Optional[str] = None,
) -> dict:
    """What's happening on a given date (defaults to today). `group` is required."""
    return _request(
        "/api/v1/today",
        {"group": group, "date": date, "session": session, "program": program},
    )


def get_lecture_weeks(session: str) -> dict:
    """Instructional Weeks 1-14 for a session, break days already stripped out."""
    return _request("/api/v1/lecture-weeks", {"session": session})


def get_public_holiday_meta() -> dict:
    """Holiday filter options: years, coverage modes, state slugs."""
    return _request("/api/v1/public-holiday/meta")


def get_public_holidays(
    year: Optional[int] = None,
    state: Optional[str] = None,
    coverage: Optional[Literal["all", "nationwide"]] = None,
) -> dict:
    """Malaysia public holidays, filterable by year / state slug / coverage."""
    return _request(
        "/api/v1/public-holiday",
        {"year": year, "state": state, "coverage": coverage},
    )


if __name__ == "__main__":
    meta = get_meta(group="B")
    print("Default session:", meta["defaultSession"])

    today = get_today(group="A", date="2026-03-09")
    print("Primary status on 2026-03-09:", today["primaryStatus"])

    holidays = get_public_holidays(year=2026, state="selangor")
    print(f"Found {holidays['total']} holidays for Selangor in 2026")
