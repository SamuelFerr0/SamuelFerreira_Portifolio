import { useEffect, useState, type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import WAKATIME_CONFIG from "../config/wakaTimeConfig";
import { formatDate, formatDuration, formatPercent } from "../lib/format";
import { useSkin } from "../lib/skin";
import {
  fetchWakaTimeStats,
  getCachedWakaTimeStats,
  splitTop,
  WakaTimeError,
  type WakaTimeData,
  type WakaTimeItem,
} from "../lib/wakatime";
import CodandoAgora from "./CodandoAgora";
import SkinSwitcher from "./SkinSwitcher";
import Status from "./Status";

type State = {
  status: "loading" | "ready" | "error";
  data: WakaTimeData | null;
  error: WakaTimeError | null;
};

const CATEGORY_NAMES = {
  Coding: "coding",
  "AI Coding": "aiCoding",
  "Writing Docs": "writingDocs",
  "Writing Tests": "writingTests",
  Debugging: "debugging",
  Building: "building",
  Browsing: "browsing",
  "Code Reviewing": "codeReviewing",
  Designing: "designing",
  Meeting: "meeting",
  Researching: "researching",
  Learning: "learning",
  Planning: "planning",
} as const;

const OS_NAMES: Record<string, string> = { Mac: "macOS" };

function isCategory(name: string): name is keyof typeof CATEGORY_NAMES {
  return name in CATEGORY_NAMES;
}

function useWakaTime(): State {
  const [state, setState] = useState<State>(() => {
    const data = getCachedWakaTimeStats();
    return { status: data ? "ready" : "loading", data, error: null };
  });

  useEffect(() => {
    let active = true;
    fetchWakaTimeStats()
      .then((data) => active && setState({ status: "ready", data, error: null }))
      .catch(
        (error: unknown) =>
          active &&
          setState({
            status: "error",
            data: null,
            error: error instanceof WakaTimeError ? error : new WakaTimeError("error", String(error)),
          })
      );
    return () => {
      active = false;
    };
  }, []);

  return state;
}

function useFormatters() {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  return {
    duration: formatDuration,
    percent: (value: number) => formatPercent(value, locale),
    date: (value: string) => formatDate(value, locale),
  };
}

type Formatters = ReturnType<typeof useFormatters>;

const SKINS = ["barras", "grade", "lista"] as const;
type Skin = (typeof SKINS)[number];

function Indicadores({ data, f }: { data: WakaTimeData; f: Formatters }) {
  const { t } = useTranslation();
  const since = data.since ? f.date(data.since) : null;

  return (
    <ul className="tags">
      <li>{t("wakatime.daily", { value: f.duration(data.dailyAverage) })}</li>
      {data.activeDays !== null && data.totalDays !== null && (
        <li>{t("wakatime.days", { active: data.activeDays, total: data.totalDays })}</li>
      )}
      {since && <li>{t("wakatime.since", { date: since })}</li>}
      {data.profileUrl && (
        <li>
          <a href={data.profileUrl} target="_blank" rel="noopener noreferrer">
            {t("wakatime.profile")}
          </a>
        </li>
      )}
    </ul>
  );
}

type SkinProps = { items: WakaTimeItem[]; f: Formatters };

function BarrasSkin({ items, f }: SkinProps) {
  return (
    <ul className="bars">
      {items.map((item) => (
        <li key={item.name}>
          <span>
            {item.name}
            <span className="meta">{f.duration(item.seconds)}</span>
          </span>
          <span className="bar">
            <span style={{ width: `${item.percent}%` }} />
          </span>
          <span className="pct">{f.percent(item.percent)}</span>
        </li>
      ))}
    </ul>
  );
}

function GradeSkin({ items, f }: SkinProps) {
  return (
    <ul className="waka-grid">
      {items.map((item) => (
        <li key={item.name} className="waka-card">
          <span
            className="waka-ring"
            role="img"
            aria-label={`${item.name}: ${f.percent(item.percent)}`}
          >
            <svg viewBox="0 0 80 80" aria-hidden="true">
              <circle className="waka-ring-track" cx="40" cy="40" r="34" />
              <circle
                className="waka-ring-fill"
                cx="40"
                cy="40"
                r="34"
                pathLength="100"
                style={{ strokeDasharray: `${Math.min(100, item.percent)} 100` }}
              />
            </svg>
            <span className="waka-ring-pct">{f.percent(item.percent)}</span>
          </span>
          <span className="waka-card-name">{item.name}</span>
          <span className="meta">{f.duration(item.seconds)}</span>
        </li>
      ))}
    </ul>
  );
}

function ListaSkin({ items, f }: SkinProps) {
  return (
    <ul className="waka-lista">
      {items.map((item) => (
        <li key={item.name}>
          <span>{item.name}</span>
          <span className="meta">{f.duration(item.seconds)}</span>
          <span className="pct">{f.percent(item.percent)}</span>
        </li>
      ))}
    </ul>
  );
}

const SKIN_VIEWS: Record<Skin, (props: SkinProps) => ReactElement> = {
  barras: BarrasSkin,
  grade: GradeSkin,
  lista: ListaSkin,
};

function Ranking({
  title,
  items,
  limit,
  f,
  skin,
}: {
  title: string;
  items: WakaTimeItem[];
  limit: number;
  f: Formatters;
  skin: Skin;
}) {
  const { t } = useTranslation();
  const { top, rest } = splitTop(items, limit);
  const View = SKIN_VIEWS[skin];
  if (top.length === 0) return null;

  return (
    <section className="waka-bloco">
      <h3>{title}</h3>
      <View items={top} f={f} />
      {rest && (
        <p className="meta">
          {t("wakatime.more", {
            count: rest.count,
            time: f.duration(rest.seconds),
            percent: f.percent(rest.percent),
          })}
        </p>
      )}
    </section>
  );
}

function WakaTimeStats({ data }: { data: WakaTimeData }) {
  const { t } = useTranslation();
  const f = useFormatters();
  const { LIMITS } = WAKATIME_CONFIG;
  const [skin, setSkin] = useSkin<Skin>("wakatime-skin", SKINS, "barras");

  const categories = data.categories.map((item) =>
    isCategory(item.name) ? { ...item, name: t(`wakatime.nomes.${CATEGORY_NAMES[item.name]}`) } : item
  );
  const systems = data.operatingSystems.map((item) => ({ ...item, name: OS_NAMES[item.name] ?? item.name }));

  const groups = [
    { title: t("wakatime.languages"), items: data.languages, limit: data.maxLanguages },
    { title: t("wakatime.editors"), items: data.editors, limit: LIMITS.editors },
    { title: t("wakatime.categories"), items: categories, limit: LIMITS.categories },
    { title: t("wakatime.systems"), items: systems, limit: LIMITS.operatingSystems },
    { title: t("wakatime.projects"), items: data.projects, limit: LIMITS.projects },
  ];

  return (
    <>
      <p className="figure">{f.duration(data.totalSeconds)}</p>
      <Indicadores data={data} f={f} />
      <SkinSwitcher
        label={t("wakatime.estilos")}
        skins={SKINS}
        names={{
          barras: t("wakatime.skins.barras"),
          grade: t("wakatime.skins.grade"),
          lista: t("wakatime.skins.lista"),
        }}
        active={skin}
        onChange={setSkin}
      />
      {groups.map((group) => (
        <Ranking key={group.title} {...group} f={f} skin={skin} />
      ))}
    </>
  );
}

export default function WakaTime() {
  const { t } = useTranslation();
  const { status, data, error } = useWakaTime();
  const unavailable = error?.code === "unavailable";

  return (
    <div>
      <p className="lead">{t("wakatime.text")}</p>
      <CodandoAgora />
      <Status loading={status === "loading"} error={status === "error" && !unavailable} />
      {unavailable && <p role="alert">{t("wakatime.unavailable")}</p>}
      {data && <WakaTimeStats data={data} />}
    </div>
  );
}
