import { useTranslation } from "react-i18next";
import { FaEnvelope, FaGithub, FaLinkedin, FaWhatsapp } from "react-icons/fa";
import { FiFileText } from "react-icons/fi";
import { links } from "../data/links";

type Props = {
  curriculo?: boolean;
};

const Canais = ({ curriculo = false }: Props) => {
  const { t } = useTranslation();

  return (
    <ul className="channels" aria-label={t("app.shortcuts")}>
      <li>
        <a href={`mailto:${links.email}`} aria-label={t("contato.emailLabel")}>
          <FaEnvelope aria-hidden="true" />
        </a>
      </li>
      {links.whatsapp && (
        <li>
          <a
            href={`https://wa.me/${links.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
          >
            <FaWhatsapp aria-hidden="true" />
          </a>
        </li>
      )}
      <li>
        <a href={links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
          <FaLinkedin aria-hidden="true" />
        </a>
      </li>
      <li>
        <a href={links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
          <FaGithub aria-hidden="true" />
        </a>
      </li>
      {curriculo && (
        <li>
          <a href="#/curriculo" aria-label={t("nav.curriculo")} title={t("nav.curriculo")}>
            <FiFileText aria-hidden="true" />
          </a>
        </li>
      )}
    </ul>
  );
};

export default Canais;
