import { useTranslation } from "react-i18next";
import { useApi } from "../lib/api";
import Carregando from "./Carregando";

type Share = { name: string; percent: number };
type Commit = { repo: string; message: string; date: string };

export function Status({ loading, error }: { loading: boolean; error: boolean }) {
  const { t } = useTranslation();

  if (loading) return <Carregando />;
  if (error) return <p role="alert">{t("app.failed")}</p>;
  return null;
}

export function Bars({ items }: { items: Share[] }) {
  return (
    <ul className="bars">
      {items.map((item) => (
        <li key={item.name}>
          <span>{item.name}</span>
          <span className="bar">
            <span style={{ width: `${item.percent}%` }} />
          </span>
          <span className="pct">{item.percent.toFixed(1)}%</span>
        </li>
      ))}
    </ul>
  );
}

function Empty() {
  const { t } = useTranslation();
  return <p>{t("app.empty")}</p>;
}

export function Linguagens() {
  const { t } = useTranslation();
  const { data, loading, error } = useApi<Share[]>("/api/github/linguagens");

  return (
    <div>
      <p className="lead">{t("linguagens.text")}</p>
      <Status loading={loading} error={error} />
      {data && (data.length > 0 ? <Bars items={data} /> : <Empty />)}
    </div>
  );
}

type Dia = { chave: string; data: Date; commits: Commit[] };

function agruparPorDia(commits: Commit[]): Dia[] {
  const ordenados = [...commits].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const dias: Dia[] = [];
  for (const commit of ordenados) {
    const data = new Date(commit.date);
    const chave = data.toDateString();
    const ultimo = dias[dias.length - 1];
    if (ultimo && ultimo.chave === chave) ultimo.commits.push(commit);
    else dias.push({ chave, data, commits: [commit] });
  }
  return dias;
}

export function Atividade() {
  const { t, i18n } = useTranslation();
  const { data, loading, error } = useApi<Commit[]>("/api/github/atividade");

  return (
    <div>
      <p className="lead">{t("atividade.text")}</p>
      <Status loading={loading} error={error} />
      {data &&
        (data.length > 0 ? (
          <>
            <p className="meta">
              {t("atividade.resumo", {
                commits: data.length,
                repos: new Set(data.map((commit) => commit.repo)).size,
              })}
            </p>
            <div className="dias">
              {agruparPorDia(data).map((dia) => (
                <section className="dia" key={dia.chave}>
                  <h2 className="dia-titulo">
                    {dia.data.toLocaleDateString(i18n.language, {
                      weekday: "short",
                      day: "2-digit",
                      month: "short",
                    })}
                  </h2>
                  <ul>
                    {dia.commits.map((commit, index) => (
                      <li key={`${commit.repo}-${index}`}>
                        <span className="repo-tag">{commit.repo}</span>
                        <span>{commit.message}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </>
        ) : (
          <Empty />
        ))}
    </div>
  );
}

type PerfilUser = {
  login: string;
  name: string;
  avatarUrl: string;
  url: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  followers: number;
  following: number;
  createdAt: string | null;
};
type PerfilData = { user: PerfilUser; repos: number; stars: number; forks: number };

function Perfil({ user }: { user: PerfilUser }) {
  const { t } = useTranslation();
  const meta = [
    user.company,
    user.location,
    user.createdAt ? t("stats.perfil.desde", { ano: user.createdAt.slice(0, 4) }) : null,
  ].filter((item): item is string => Boolean(item));

  return (
    <div className="ghs-perfil">
      <img
        className="ghs-avatar"
        src={`${user.avatarUrl}${user.avatarUrl.includes("?") ? "&" : "?"}s=128`}
        alt=""
        width={56}
        height={56}
        loading="lazy"
      />
      <div>
        <p className="ghs-perfil-nome">
          {user.name}{" "}
          <a href={user.url} target="_blank" rel="noopener noreferrer">
            @{user.login}
          </a>
        </p>
        {user.bio && <p className="ghs-perfil-bio">{user.bio}</p>}
        {meta.length > 0 && <p className="meta">{meta.join(" · ")}</p>}
      </div>
    </div>
  );
}

function Kpi({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <li className="ghs-kpi">
      <span className="ghs-kpi-label">{label}</span>
      <span className="ghs-kpi-value">{value}</span>
      <span className="ghs-kpi-note">{note}</span>
    </li>
  );
}

function Resumo() {
  const { t, i18n } = useTranslation();
  const { data, loading, error } = useApi<PerfilData>("/api/github/perfil");
  const number = (value: number) => new Intl.NumberFormat(i18n.language).format(value);

  return (
    <div className="ghs-resumo">
      <Status loading={loading} error={error} />
      {data && (
        <>
          <Perfil user={data.user} />
          <ul className="ghs-kpis">
            <Kpi
              label={t("stats.indicadores.repositorios")}
              value={number(data.repos)}
              note={t("stats.notas.publicos")}
            />
            <Kpi
              label={t("stats.indicadores.estrelas")}
              value={number(data.stars)}
              note={t("stats.notas.emRepos", { count: data.repos })}
            />
            <Kpi
              label={t("stats.indicadores.forks")}
              value={number(data.forks)}
              note={t("stats.notas.emRepos", { count: data.repos })}
            />
            <Kpi
              label={t("stats.indicadores.seguidores")}
              value={number(data.user.followers)}
              note={t("stats.notas.seguindo", { valor: number(data.user.following) })}
            />
          </ul>
        </>
      )}
    </div>
  );
}

function LinguagensEResumo() {
  return (
    <>
      <Resumo />
      <Linguagens />
    </>
  );
}

const SECTION_VIEWS = {
  linguagens: LinguagensEResumo,
  atividade: Atividade,
};

type Section = keyof typeof SECTION_VIEWS;

const GitHubStats = ({ section = "linguagens" }: { section?: Section }) => {
  const View = SECTION_VIEWS[section];
  return <View />;
};

export default GitHubStats;
