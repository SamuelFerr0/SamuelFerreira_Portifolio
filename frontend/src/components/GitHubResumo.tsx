import { useTranslation } from "react-i18next";
import type { PerfilData } from "../lib/githubTypes";
import useGitHub from "../lib/useGitHub";
import GitHubPerfil from "./GitHubPerfil";
import Status from "./Status";

function Kpi({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <li className="ghs-kpi">
      <span className="ghs-kpi-label">{label}</span>
      <span className="ghs-kpi-value">{value}</span>
      <span className="ghs-kpi-note">{note}</span>
    </li>
  );
}

const GitHubResumo = () => {
  const { t, i18n } = useTranslation();
  const { data, loading, error } = useGitHub<PerfilData>("perfil");
  const number = (value: number) => new Intl.NumberFormat(i18n.language).format(value);

  return (
    <div className="ghs-resumo">
      <Status loading={loading} error={error} />
      {data && (
        <>
          <GitHubPerfil user={data.user} />
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
};

export default GitHubResumo;
