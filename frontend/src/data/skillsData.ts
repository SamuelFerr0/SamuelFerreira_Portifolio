import type { IconType } from "react-icons";
import { FaGamepad } from "react-icons/fa";
import {
  SiApachemaven,
  SiBootstrap,
  SiChartdotjs,
  SiFigma,
  SiGit,
  SiHtml5,
  SiJavascript,
  SiJson,
  SiNodedotjs,
  SiOpenjdk,
  SiPostgresql,
  SiPython,
  SiReact,
  SiSpringboot,
  SiSupabase,
  SiTypescript,
} from "react-icons/si";
import { TbBrandCss3 } from "react-icons/tb";
import { links } from "./links";
import { projectsData } from "./projectsData";

export type Skill = {
  name: string;
  icon: IconType;
  docs: string;
  repo: string;
  level?: number;
};

type SkillInput = Omit<Skill, "repo"> & { repo?: string };

const repoFor = (name: string) =>
  projectsData.find((project) => project.technologies.some((tech) => tech === name))?.repoLink ??
  links.github;

const build = (list: SkillInput[]): Skill[] =>
  list.map((skill) => ({ ...skill, repo: skill.repo ?? repoFor(skill.name) }));

export const practice: Skill[] = build([
  { name: "HTML", icon: SiHtml5, docs: "https://developer.mozilla.org/pt-BR/docs/Web/HTML" },
  { name: "CSS", icon: TbBrandCss3, docs: "https://developer.mozilla.org/pt-BR/docs/Web/CSS" },
  {
    name: "JavaScript",
    icon: SiJavascript,
    docs: "https://developer.mozilla.org/pt-BR/docs/Web/JavaScript",
  },
  { name: "Python", icon: SiPython, docs: "https://www.python.org/" },
  { name: "Java", icon: SiOpenjdk, docs: "https://dev.java/" },
  { name: "Spring Boot", icon: SiSpringboot, docs: "https://spring.io/projects/spring-boot" },
  { name: "Node.js", icon: SiNodedotjs, docs: "https://nodejs.org/pt" },
  { name: "Git & GitHub", icon: SiGit, docs: "https://git-scm.com/" },
  { name: "Pygame", icon: FaGamepad, docs: "https://www.pygame.org/" },
  { name: "JSON Server", icon: SiJson, docs: "https://github.com/typicode/json-server" },
  { name: "Bootstrap", icon: SiBootstrap, docs: "https://getbootstrap.com/" },
  { name: "Chart.js", icon: SiChartdotjs, docs: "https://www.chartjs.org/" },
  { name: "Maven", icon: SiApachemaven, docs: "https://maven.apache.org/" },
  { name: "Figma", icon: SiFigma, docs: "https://www.figma.com/" },
]);

export const learning: Skill[] = build([
  { name: "React", icon: SiReact, docs: "https://react.dev/" },
  { name: "TypeScript", icon: SiTypescript, docs: "https://www.typescriptlang.org/" },
  { name: "PostgreSQL", icon: SiPostgresql, docs: "https://www.postgresql.org/" },
  { name: "Supabase", icon: SiSupabase, docs: "https://supabase.com/" },
]);
