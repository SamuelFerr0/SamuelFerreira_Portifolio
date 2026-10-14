import { useTranslation } from "react-i18next";
import { certificates } from "../data/certificates";

const Formacao = () => {
  const { t } = useTranslation();

  return (
    <div className="prose">
      <h2>{t("formacao.course")}</h2>
      <p className="meta">{t("formacao.school")}</p>
      <p className="meta">{t("formacao.period")}</p>
      <p>{t("formacao.text")}</p>
      {certificates.length > 0 && (
        <>
          <h2>{t("formacao.certificates")}</h2>
          <ul className="plain">
            {certificates.map((certificate) => (
              <li key={certificate.name}>
                {certificate.url ? (
                  <a href={certificate.url} target="_blank" rel="noopener noreferrer">
                    {certificate.name}
                  </a>
                ) : (
                  certificate.name
                )}
                <span className="meta">
                  {certificate.issuer}, {certificate.year}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Formacao;
