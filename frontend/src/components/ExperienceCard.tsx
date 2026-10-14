export type ExperienceView = {
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string[];
  skills: string[];
  logo?: string;
};

const ExperienceCard = ({ experience }: { experience: ExperienceView }) => {
  const { role, company, startDate, endDate, description, skills, logo } = experience;

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
          {description.map((point, index) => (
            <li key={index}>{point}</li>
          ))}
        </ul>

        <div className="skills-container">
          {skills.map((skill, index) => (
            <span key={index} className="skill-tag">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExperienceCard;
