import { useTranslation } from "react-i18next";
import type { Commit } from "../lib/githubTypes";
import useGitHub from "../lib/useGitHub";
import Empty from "./Empty";
import Status from "./Status";

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

const GitHubAtividade = () => {
  const { t, i18n } = useTranslation();
  const { data, loading, error } = useGitHub<Commit[]>("atividade");

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
};

export default GitHubAtividade;
