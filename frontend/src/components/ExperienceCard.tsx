export type ExperienceView = {
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string[];
  skills: string[];
  logo?: string;
};

type ExperienceCardProps = { experience: ExperienceView };

const ExperienceCard = ({ experience: item }: ExperienceCardProps) => {
  const { role, company, startDate, endDate, description, skills, logo } = item;

  return (
    <div className="experience-card">
      <div className="timeline-date"></div>
      <div className="timeline-marker"></div>

      <div className="experience-content">
        <div className="role-container">
          {logo && <img src={logo} alt={`${company} logo`} className="company-logo" />}

          <div className="role-text">
            <h3 className="role-title">{role}</h3>
            <p className="company-name">@ {company}</p>
          </div>
        </div>

        <p className="date-range">
          {startDate} – {endDate}
        </p>

        <ul className="description-list">
          {description.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>

        <div className="skills-container">
          {skills.map((tag, i) => (
            <span key={i} className="skill-tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExperienceCard;
