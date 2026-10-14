import type { IconType } from "react-icons";
import { learning, practice } from "./skillsData";

export type GlobeSkill = { name: string; icon: IconType; link: string };

export const globeSkills: GlobeSkill[] = [...practice, ...learning].map((skill) => ({
  name: skill.name,
  icon: skill.icon,
  link: skill.docs,
}));
