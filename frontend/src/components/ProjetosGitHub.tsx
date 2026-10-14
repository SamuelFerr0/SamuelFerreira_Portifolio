import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import GITHUB_API_CONFIG from "../config/gitHubApiConfig";
import { fetchGitHub, GitHubRateLimitError } from "../lib/githubApi";
import { githubPaths } from "../lib/githubPaths";
import ProjectCard, { type ProjectView } from "./ProjectCard";

type GitHubRepo = {
  id: number;
  name: string;
  description: string | null;
  fork: boolean;
  html_url: string;
  topics?: string[];
  created_at: string;
};

type Repo = ProjectView & { id: number };

const ProjetosGitHub = () => {
  const { t } = useTranslation();
  const { USERNAME, HIDDEN_REPOS } = GITHUB_API_CONFIG;

  const [items, setItems] = useState<Repo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<"limite" | "erro" | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function loadRepos() {
      try {
        const lista = await fetchGitHub<GitHubRepo[]>(githubPaths.recentRepos());
        const visiveis = lista.filter(
          (repo) =>
            !repo.fork &&
            !HIDDEN_REPOS.some((nome) => nome.toLowerCase() === repo.name.toLowerCase())
        );

        const capa = (repo: GitHubRepo, variante: number) =>
          `https://opengraph.githubassets.com/${variante}/${USERNAME}/${repo.name}`;

        const cards = visiveis.map((repo) => ({
          id: repo.id,
          title: repo.name,
          description: repo.description || "",
          date: repo.created_at.slice(0, 7),
          gif: capa(repo, 1),
          gifFallbacks: [capa(repo, 2), capa(repo, 3)],
          repoLink: repo.html_url,
          technologies: repo.topics || [],
        }));

        if (!cancelado) setItems(cards);
      } catch (error) {
        console.error("Erro ao buscar repositórios:", error);
        if (!cancelado) {
          setItems([]);
          setErro(error instanceof GitHubRateLimitError ? "limite" : "erro");
        }
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }

    void loadRepos();
    return () => {
      cancelado = true;
    };
  }, [USERNAME, HIDDEN_REPOS]);

  return (
    <section className="github-projects">
      <h2>{t("projetos.githubTitle")}</h2>
      <p className="lead">{t("projetos.githubText")}</p>

      {carregando && <p role="status">{t("projetos.carregando")}</p>}
      {erro === "limite" && <p role="alert">{t("projetos.limite")}</p>}
      {erro === "erro" && <p role="alert">{t("projetos.erro")}</p>}
      {!carregando && !erro && items.length === 0 && <p>{t("projetos.nenhum")}</p>}

      <ol className="timeline">
        {items.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </ol>
    </section>
  );
};

export default ProjetosGitHub;
