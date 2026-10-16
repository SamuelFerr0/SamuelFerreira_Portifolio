import { useTranslation } from "react-i18next";
import { certificates } from "../data/certificates";

const Formacao = () => {
  const { t, i18n } = useTranslation();
  const idioma = i18n.language.startsWith("en") ? "en" : "pt";

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
            {certificates.map((certificate) => {
              const nome = certificate.name[idioma];
              return (
                <li key={certificate.name.pt}>
                  {certificate.url ? (
                    <a href={certificate.url} target="_blank" rel="noopener noreferrer">
                      {nome}
                    </a>
                  ) : (
                    nome
                  )}
                  <span className="meta">
                    {certificate.issuer}, {certificate.year}
                    {certificate.hours ? ` · ${certificate.hours}h` : ""}
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
};

export default Formacao;
