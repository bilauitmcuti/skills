/**
 * Example bot command (grammY-style, works for Telegram; adapt handler
 * signature for discord.js) that answers "is there class today?" using
 * the Bila UiTM Cuti API. Designed to run on Cloudflare Workers.
 *
 * See ../skills/bilauitmcuti-api/references/api-reference.md for full field docs.
 */

const BASE_URL = "https://api.bilauitmcuti.com";

type Group = "A" | "B";

interface TodayResponse {
  date: string;
  primaryStatus: string;
  statuses: string[];
  matchedActivities: Array<{ name: string; type: string }>;
}

const STATUS_LABELS: Record<string, string> = {
  class_day: "📚 Ada kelas hari ini (class day)",
  break: "🌴 Cuti (break)",
  exam_week: "📝 Minggu peperiksaan (exam week)",
  study_week: "📖 Minggu study (study week)",
};

async function fetchTodayStatus(group: Group, date?: string): Promise<TodayResponse> {
  const url = new URL(`${BASE_URL}/api/v1/today`);
  url.searchParams.set("group", group);
  if (date) url.searchParams.set("date", date);

  const res = await fetch(url.toString());

  if (res.status === 429) {
    throw new Error("Bila UiTM Cuti API is rate-limiting us right now, try again in a bit.");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`Bila UiTM Cuti API error ${res.status}: ${(body as any).error ?? "unknown"}`);
  }

  return res.json();
}

function formatReply(data: TodayResponse): string {
  const label = STATUS_LABELS[data.primaryStatus] ?? data.primaryStatus;
  const lines = [`${label}`, `Tarikh: ${data.date}`];

  if (data.matchedActivities.length > 0) {
    lines.push("", "Aktiviti:");
    for (const activity of data.matchedActivities) {
      lines.push(`- ${activity.name} (${activity.type})`);
    }
  }

  return lines.join("\n");
}

/**
 * Example grammY command handler: `/cuti a` or `/cuti b`
 * ctx.match would be "a" or "b" (the group), grammY conventions.
 */
export async function handleCutiCommand(ctx: { match: string; reply: (text: string) => Promise<unknown> }) {
  const groupInput = ctx.match.trim().toUpperCase();
  const group: Group = groupInput === "B" ? "B" : "A"; // default to Group A if unspecified/invalid

  try {
    const data = await fetchTodayStatus(group);
    await ctx.reply(formatReply(data));
  } catch (err) {
    await ctx.reply(`Ralat: ${(err as Error).message}`);
  }
}
