import WAKATIME_CONFIG from "../config/wakaTimeConfig";
import API_CONFIG from "../config/apiConfig";

export type WakaTimeItem = { name: string; seconds: number; percent: number };

export type WakaTimeData = {
  totalSeconds: number;
  dailyAverage: number;
  activeDays: number | null;
  totalDays: number | null;
  since: string | null;
  languages: WakaTimeItem[];
  editors: WakaTimeItem[];
  categories: WakaTimeItem[];
  operatingSystems: WakaTimeItem[];
};

let request: Promise<WakaTimeData> | null = null;
let cached: WakaTimeData | null = null;

export const getCachedWakaTimeStats = () => cached;

export function fetchWakaTimeStats(): Promise<WakaTimeData> {
  if (!request) {
    request = load()
      .then((stats) => (cached = stats))
      .catch((error: unknown) => {
        request = null;
        throw error;
      });
  }
  return request;
}

async function load(): Promise<WakaTimeData> {
  const { API_PATH, RANGE, HIDDEN_LANGUAGES } = WAKATIME_CONFIG;
  const response = await fetch(`${API_CONFIG.BASE_URL}${API_PATH}/stats/${RANGE}`);
  if (!response.ok) throw new Error(`WakaTime: HTTP ${response.status}`);

  const stats = (await response.json()) as WakaTimeData;
  const hidden = new Set(HIDDEN_LANGUAGES);
  return { ...stats, languages: stats.languages.filter((item) => !hidden.has(item.name)) };
}

export function splitTop(items: WakaTimeItem[], limit: number) {
  const top = items.slice(0, limit);
  const rest = items.slice(limit);
  if (rest.length === 0) return { top, rest: null };
  return {
    top,
    rest: {
      count: rest.length,
      seconds: rest.reduce((sum, item) => sum + item.seconds, 0),
      percent: rest.reduce((sum, item) => sum + item.percent, 0),
    },
  };
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export function formatPercent(percent: number, locale: string): string {
  if (percent > 0 && percent < 0.1) return `<${formatPercent(0.1, locale)}`;
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(percent / 100);
}

export function formatDate(value: string, locale: string): string | null {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
