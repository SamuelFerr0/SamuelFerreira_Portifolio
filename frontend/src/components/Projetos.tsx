import { useTranslation } from "react-i18next";
import { links } from "../data/links";
import { projectsData } from "../data/projectsData";
import ProjectCard from "./ProjectCard";
import ProjetosGitHub from "./ProjetosGitHub";

const ordered = [...projectsData].sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));

const Projetos = () => {
  const { t } = useTranslation();

  const translatedProjects = ordered.map((project) => ({
    ...project,
    title: t(`projetos.${project.titleId}`),
    description: t(`projetos.${project.descriptionId}`),
  }));

  return (
    <div>
      <p className="lead">{t("projetos.text")}</p>
      <ol className="timeline">
        {translatedProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </ol>
      <ProjetosGitHub />
      <p>
        <a href={links.github} target="_blank" rel="noopener noreferrer">
          {t("projetos.all")}
        </a>
      </p>
    </div>
  );
};

export default Projetos;
