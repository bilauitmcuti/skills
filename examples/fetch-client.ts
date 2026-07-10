/**
 * Bila UiTM Cuti API — minimal TypeScript client (fetch-based).
 * No dependencies. Works in Node 18+, Cloudflare Workers, browsers.
 *
 * See ../references/api-reference.md for full field docs.
 */

const BASE_URL = "https://api.bilauitmcuti.com";

export type Group = "A" | "B";

export interface SessionOption {
  id: string;
  label: string;
  group: Group;
}

export interface ProgramOption {
  label: string;
  value: string;
  group: Group;
}

export interface MetaResponse {
  apiVersion: string;
  baseUrl: string;
  all?: boolean;
  defaultSession: string;
  sessionOptions: SessionOption[];
  programOptions: ProgramOption[];
}

export interface CalendarActivity {
  week?: number;
  activity?: string;
  type?: string;
  [key: string]: unknown;
}

export interface TodayResponse {
  apiVersion: string;
  baseUrl: string;
  date: string;
  sessionResolved: { id: string; label: string; group: Group };
  filters: { program: string | null };
  statuses: string[];
  primaryStatus: string;
  matchedActivities: Array<{
    name: string;
    startDate: string;
    endDate: string;
    type: string;
    group: Group;
  }>;
}

export interface LectureWeek {
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  rangeLabel: string;
  days: Array<{ date: string; weekday: string; label: string }>;
}

export interface LectureWeeksResponse {
  apiVersion: string;
  baseUrl: string;
  session: { id: string; label: string; group: Group };
  limit: number;
  weeks: LectureWeek[];
  meta: { weekCount: number; firstLectureDate: string; lastLectureDate: string };
}

export interface PublicHoliday {
  id: string;
  name: string;
  date: string;
  day: string;
  states: string[];
  isSubjectToChange: boolean;
}

export interface PublicHolidayResponse {
  apiVersion: string;
  baseUrl: string;
  defaultYear: number;
  yearOptions: Array<{ value: number; label: string }>;
  query: { year: number; state: string | null; coverage: string | null };
  total: number;
  meta: {
    nationwideTotal: number;
    dateRange: { startDate: string; endDate: string };
    stateTotals: Array<{ state: string; label: string; total: number }>;
  };
  holidays: PublicHoliday[];
}

/** Thrown on non-2xx responses. Carries the parsed body's `error` field when present. */
export class BilaUitmCutiApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(
      `Bila UiTM Cuti API error ${status}: ${
        typeof body === "object" && body && "error" in (body as any)
          ? (body as any).error
          : JSON.stringify(body)
      }`,
    );
  }
}

async function request<T>(path: string, params: Record<string, string | undefined> = {}): Promise<T> {
  const url = new URL(path, BASE_URL);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString());

  if (res.status === 429) {
    const retryAfter = res.headers.get("Retry-After");
    throw new BilaUitmCutiApiError(429, { error: `Rate limited. Retry after ${retryAfter ?? "unknown"}s.` });
  }

  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      /* body wasn't JSON */
    }
    throw new BilaUitmCutiApiError(res.status, body);
  }

  return res.json() as Promise<T>;
}

export const bilaUitmCutiApi = {
  /** Discover valid session/program options. Call this before hardcoding a session id. */
  getMeta: (opts: { group?: Group; all?: boolean } = {}) =>
    request<MetaResponse>("/api/v1/meta", {
      group: opts.group,
      all: opts.all ? "true" : undefined,
    }),

  /** Calendar activity rows for a session, or aggregated across a group. */
  getCalendar: (
    opts: { session?: string; group?: Group; program?: string; type?: string; allSessions?: boolean } = {},
  ) =>
    request<{ activities: CalendarActivity[]; [key: string]: unknown }>("/api/v1/calendar", {
      session: opts.session,
      group: opts.group,
      program: opts.program,
      type: opts.type,
      allSessions: opts.allSessions ? "true" : undefined,
    }),

  /** What's happening on a given date. `group` is effectively required for resolution. */
  getToday: (opts: { group: Group; date?: string; session?: string; program?: string }) =>
    request<TodayResponse>("/api/v1/today", {
      group: opts.group,
      date: opts.date,
      session: opts.session,
      program: opts.program,
    }),

  /** Instructional Weeks 1-14 for a session, break days already stripped out. */
  getLectureWeeks: (opts: { session: string }) =>
    request<LectureWeeksResponse>("/api/v1/lecture-weeks", { session: opts.session }),

  /** Holiday filter options: years, coverage modes, state slugs. */
  getPublicHolidayMeta: () => request<Record<string, unknown>>("/api/v1/public-holiday/meta"),

  /** Malaysia public holidays, filterable by year / state slug / coverage. */
  getPublicHolidays: (opts: { year?: number; state?: string; coverage?: "all" | "nationwide" } = {}) =>
    request<PublicHolidayResponse>("/api/v1/public-holiday", {
      year: opts.year?.toString(),
      state: opts.state,
      coverage: opts.coverage,
    }),
};

// --- Usage example ---
// const meta = await bilaUitmCutiApi.getMeta({ group: "B" });
// const today = await bilaUitmCutiApi.getToday({ group: "A", date: "2026-03-09" });
// const weeks = await bilaUitmCutiApi.getLectureWeeks({ session: "B-20263" });
// const holidays = await bilaUitmCutiApi.getPublicHolidays({ year: 2026, state: "selangor" });
