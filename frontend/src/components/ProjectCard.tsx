import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiGithub } from "react-icons/fi";

export type ProjectView = {
  title: string;
  description: string;
  date: string | null;
  gif: string | null;
  gifFallbacks?: readonly string[];
  repoLink: string;
  technologies: readonly string[];
};

const ESPERAS = [2000, 6000];

const ProjectCard = ({ project }: { project: ProjectView }) => {
  const { t, i18n } = useTranslation();
  const { title, description, date, gif, gifFallbacks = [], repoLink, technologies } = project;

  const fontes = [gif, ...gifFallbacks].filter((fonte): fonte is string => Boolean(fonte));
  const [tentativa, setTentativa] = useState(0);
  const [esperando, setEsperando] = useState(false);
  const [falhou, setFalhou] = useState(fontes.length === 0);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onError = () => {
    if (tentativa + 1 >= fontes.length) {
      setFalhou(true);
      return;
    }
    setEsperando(true);
    timer.current = window.setTimeout(
      () => {
        setEsperando(false);
        setTentativa((n) => n + 1);
      },
      ESPERAS[tentativa] ?? ESPERAS[ESPERAS.length - 1]
    );
  };

  const quando = date
    ? new Date(`${date}-01T12:00:00`).toLocaleDateString(i18n.language, {
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <li className="timeline-item">
      {quando && <span className="when">{quando}</span>}
      <h2>{title}</h2>
      {!falhou && (
        <img
          key={fontes[tentativa]}
          className={esperando ? "project-media waiting" : "project-media"}
          src={fontes[tentativa]}
          alt={t("projetos.imageAlt", { name: title })}
          loading="lazy"
          decoding="async"
          onError={onError}
        />
      )}
      {falhou && (
        <div className="project-media project-placeholder" aria-hidden="true">
          <span>{title}</span>
        </div>
      )}
      {description && <p>{description}</p>}
      <ul className="tags">
        {technologies.map((tech) => (
          <li key={tech}>{tech}</li>
        ))}
      </ul>
      <a className="repo-link" href={repoLink} target="_blank" rel="noopener noreferrer">
        <FiGithub aria-hidden="true" /> {t("projetos.repo")}
      </a>
    </li>
  );
};

export default ProjectCard;
