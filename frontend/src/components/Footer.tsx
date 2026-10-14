import { useTranslation } from "react-i18next";
import { links } from "../data/links";
import Peixe from "./Peixe";

const ANO = new Date().getFullYear();

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <p>
        © {ANO} {t("app.name")}
      </p>
      <p className="vila">
        <Peixe size={32} />
        {t("app.vila")}
      </p>
      <ul>
        <li>
          <a href={links.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </li>
        <li>
          <a href={links.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        </li>
        <li>
          <a href={`mailto:${links.email}`}>{t("contato.emailLabel")}</a>
        </li>
      </ul>
    </footer>
  );
};

export default Footer;
