import { useTranslation } from "react-i18next";
import { experiencesData } from "../data/experiencesData";
import ExperienceCard from "./ExperienceCard";

const Experiencias = () => {
  const { t } = useTranslation();

  const translatedExperiences = experiencesData.map((exp) => ({
    ...exp,
    logo: exp.logo,
    role: t(`experiencias.${exp.roleId}`),
    company: t(`experiencias.${exp.companyId}`),
    description: t(`experiencias.${exp.descriptionId}`)
      .split(". ")
      .filter((p) => p)
      .map((point) => point.replace(/\.$/, "")),
    skills: t(`experiencias.${exp.skillsId}`)
      .split(", ")
      .filter((s) => s),
    endDate: exp.endDate === "present" ? t("experiencias.present") : exp.endDate,
  }));

  return (
    <div>
      <p className="lead">{t("experiencias.text")}</p>
      <div className="timeline-container">
        {translatedExperiences.map((exp) => (
          <ExperienceCard key={exp.id} experience={exp} />
        ))}
      </div>
    </div>
  );
};

export default Experiencias;
