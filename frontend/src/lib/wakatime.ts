import WAKATIME_CONFIG from "../config/wakaTimeConfig";
import API_CONFIG from "../config/apiConfig";

export type WakaTimeItem = { name: string; seconds: number; percent: number };

export type WakaTimeData = {
  totalSeconds: number;
  dailyAverage: number;
  activeDays: number | null;
  totalDays: number | null;
  since: string | null;
  profileUrl: string | null;
  maxLanguages: number;
  languages: WakaTimeItem[];
  editors: WakaTimeItem[];
  categories: WakaTimeItem[];
  operatingSystems: WakaTimeItem[];
  projects: WakaTimeItem[];
};

type WakaTimeErrorCode = "network" | "unavailable" | "error";

export class WakaTimeError extends Error {
  code: WakaTimeErrorCode;

  constructor(code: WakaTimeErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

const requests = new Map<string, Promise<WakaTimeData>>();
const cache = new Map<string, WakaTimeData>();


const DEFAULT_KEY = "default";

export const getCachedWakaTimeStats = (range?: string) => cache.get(range ?? DEFAULT_KEY) ?? null;

export function fetchWakaTimeStats(range?: string): Promise<WakaTimeData> {
  const key = range ?? DEFAULT_KEY;
  const pending = requests.get(key);
  if (pending) return pending;

  const request = load(range)
    .then((stats) => {
      cache.set(key, stats);
      return stats;
    })
    .catch((error: unknown) => {
      requests.delete(key);
      throw error;
    });
  requests.set(key, request);
  return request;
}

async function load(range?: string): Promise<WakaTimeData> {
  const { API_PATH } = WAKATIME_CONFIG;
  const path = range ? `${API_PATH}/stats/${range}` : `${API_PATH}/stats`;

  let response: Response;
  try {
    response = await fetch(`${API_CONFIG.BASE_URL}${path}`);
  } catch {
    throw new WakaTimeError("network", "WakaTime: sem conexão com o servidor");
  }
  if (response.status === 503) {
    throw new WakaTimeError("unavailable", "WakaTime: estatísticas indisponíveis");
  }
  if (!response.ok) throw new WakaTimeError("error", `WakaTime: HTTP ${response.status}`);

  return (await response.json()) as WakaTimeData;
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
