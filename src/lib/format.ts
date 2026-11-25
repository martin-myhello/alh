const DAY = 86_400_000;
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const dayIndex = (ms: number) => Math.floor(ms / DAY);
const pad = (n: number) => String(n).padStart(2, "0");

export const todayISO = (now = Date.now()) => new Date(now).toISOString().slice(0, 10);

/** "Today", "Yesterday", "Monday", then "01.11", as on the Note screen. */
export function agoLabel(ms: number, now = Date.now()): string {
  const diff = dayIndex(now) - dayIndex(ms);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  const d = new Date(ms);
  if (diff < 7) return WEEKDAYS[d.getUTCDay()];
  return `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}`;
}

/** Ship day: a weekday name inside the coming week, otherwise "12 Dec". */
export function dueLabel(due: string | null, now = Date.now()): string | null {
  if (!due) return null;
  const ms = Date.parse(`${due}T00:00:00Z`);
  const diff = dayIndex(ms) - dayIndex(now);
  const d = new Date(ms);
  if (diff >= 0 && diff < 7) return WEEKDAYS[d.getUTCDay()];
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

export function longDate(ms = Date.now()): string {
  const d = new Date(ms);
  return `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS_LONG[d.getUTCMonth()]}`;
}

export function timelineLabel(due: string, now = Date.now()): string {
  const ms = Date.parse(`${due}T00:00:00Z`);
  const diff = dayIndex(ms) - dayIndex(now);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  const d = new Date(ms);
  if (diff > 1 && diff < 7) return WEEKDAYS[d.getUTCDay()];
  return `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}`;
}

/** "PR #12" for a pull request link, the fallback word for anything else. */
export function linkLabel(url: string, fallback: string): string {
  const m = url.match(/\/pull\/(\d+)/);
  return m ? `${fallback} #${m[1]}` : fallback;
}

/** Split a trailing emoji off a short comment: "Looks good 👍" -> ["Looks good", "👍"]. */
export function splitEmoji(text: string): [string, string | null] {
  const m = text.match(/^(.*?)\s*((?:\p{Extended_Pictographic}|\p{Emoji_Modifier}|‍|️)+)$/u);
  if (m && m[1].trim()) return [m[1].trim(), m[2]];
  return [text.trim(), null];
}

/** Formatting marks removed, for one-line previews and notifications. */
export function plain(text: string): string {
  return text
    .replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g, "$1")
    .replace(/\*\*([^*\n]+)\*\*/g, "$1")
    .replace(/\*([^*\n]+)\*/g, "$1")
    .replace(/`([^`\n]+)`/g, "$1")
    .replace(/^\s*(?:[-*•]|\d+[.)])\s+/gm, "")
    .replace(/\s*\n+\s*/g, " · ")
    .trim();
}
