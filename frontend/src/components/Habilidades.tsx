import { lazy, Suspense, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaGithub } from "react-icons/fa";
import { globeSkills } from "../data/globeSkills";
import { learning, practice, type Skill } from "../data/skillsData";
import { useSkin } from "../lib/skin";
import SkinSwitcher from "./SkinSwitcher";

const SkillsGlobe = lazy(() => import("./SkillsGlobe"));

function temWebGL() {
  try {
    const tela = document.createElement("canvas");
    const gl = tela.getContext("webgl2") ?? tela.getContext("webgl");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return Boolean(gl);
  } catch {
    return false;
  }
}

const SKINS = ["cards", "lista", "tags"] as const;
type Skin = (typeof SKINS)[number];

const levelKey = (level: number) =>
  level >= 80 ? "avancado" : level >= 50 ? "intermediario" : "basico";

const levelOf = (skill: Skill) =>
  skill.level === undefined ? null : Math.min(100, Math.max(0, skill.level));

const CardSkill = ({ skill }: { skill: Skill }) => {
  const { t } = useTranslation();
  const Icon = skill.icon;
  const level = levelOf(skill);

  return (
    <li className="skill-card">
      <a
        className="skill-card-link"
        href={skill.repo}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("habilidades.noGithub", { name: skill.name })}
      >
        <FaGithub className="skill-card-github" aria-hidden="true" />
        <Icon className="skill-card-icon" aria-hidden="true" />
        <span className="skill-card-name">{skill.name}</span>
        {level !== null && (
          <>
            <span className="skill-card-bar" role="img" aria-label={`${skill.name}: ${level}%`}>
              <span style={{ width: `${level}%` }} />
            </span>
            <span className="meta">
              {level}% · {t(`habilidades.nivel.${levelKey(level)}`)}
            </span>
          </>
        )}
      </a>
    </li>
  );
};

const ListaSkill = ({ skill }: { skill: Skill }) => {
  const { t } = useTranslation();
  const Icon = skill.icon;
  const level = levelOf(skill);

  return (
    <li>
      <a
        className="skill-row"
        href={skill.repo}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("habilidades.noGithub", { name: skill.name })}
      >
        <Icon className="skill-row-icon" aria-hidden="true" />
        <span className="skill-card-name">{skill.name}</span>
        {level !== null ? (
          <>
            <span className="skill-card-bar" role="img" aria-label={`${skill.name}: ${level}%`}>
              <span style={{ width: `${level}%` }} />
            </span>
            <span className="pct">{level}%</span>
          </>
        ) : (
          <>
            <span />
            <span />
          </>
        )}
        <FaGithub className="skill-row-github" aria-hidden="true" />
      </a>
    </li>
  );
};

const SkillGroup = ({ items, skin }: { items: Skill[]; skin: Skin }) => {
  if (skin === "tags") {
    return (
      <ul className="tags">
        {items.map((skill) => (
          <li key={skill.name}>{skill.name}</li>
        ))}
      </ul>
    );
  }
  if (skin === "lista") {
    return (
      <ul className="skill-rows">
        {items.map((skill) => (
          <ListaSkill key={skill.name} skill={skill} />
        ))}
      </ul>
    );
  }
  return (
    <ul className="skill-cards">
      {items.map((skill) => (
        <CardSkill key={skill.name} skill={skill} />
      ))}
    </ul>
  );
};

export default function Habilidades() {
  const { t } = useTranslation();
  const [mostrarGlobo] = useState(temWebGL);
  const [skin, setSkin] = useSkin<Skin>("skills-skin", SKINS, "cards");

  return (
    <div className="prose">
      {mostrarGlobo && (
        <Suspense
          fallback={
            <div className="skills-globe__stage skills-globe__loading" role="status">
              {t("app.loading")}
            </div>
          }
        >
          <SkillsGlobe skills={globeSkills} />
        </Suspense>
      )}
      <SkinSwitcher
        label={t("habilidades.estilos")}
        skins={SKINS}
        names={{
          cards: t("habilidades.skins.cards"),
          lista: t("habilidades.skins.lista"),
          tags: t("habilidades.skins.tags"),
        }}
        active={skin}
        onChange={setSkin}
      />
      <h2>{t("habilidades.practice")}</h2>
      <SkillGroup items={practice} skin={skin} />
      <h2>{t("habilidades.learning")}</h2>
      <SkillGroup items={learning} skin={skin} />
    </div>
  );
}
