const data = [
  {
    id: 1,
    roleId: "estudo_role",
    companyId: "estudo_company",
    startDate: "2026",
    endDate: "present" as string,
    descriptionId: "estudo_desc",
    skillsId: "estudo_skills",
  },
] as const;

export type ExperienceData = (typeof data)[number] & { logo?: string };

export const experiencesData: readonly ExperienceData[] = data;
