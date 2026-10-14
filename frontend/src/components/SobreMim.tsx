import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { FaBriefcase, FaGraduationCap } from "react-icons/fa";
import type { SectionId } from "../data/formation";
import { certificates } from "../data/certificates";
import { projectsData } from "../data/projectsData";
import { AVATAR, disciplinas, hoje, pessoal, secoes, type Texto } from "../data/sobreData";
import { learning, practice } from "../data/skillsData";

function iniciais(nome: string) {
  const partes = nome.split(" ").filter(Boolean);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? (partes.at(-1)?.[0] ?? "") : "";
  return `${primeira}${ultima}`.toUpperCase();
}

const escolher = (texto: Texto, idioma: string) => (idioma.startsWith("en") ? texto.en : texto.pt);

const Secao = ({
  titulo,
  to,
  children,
}: {
  titulo: string;
  to?: SectionId;
  children: ReactNode;
}) => {
  const { t } = useTranslation();
  return (
    <section className="sobre-secao">
      <div className="sobre-secao-cabecalho">
        <h2>{titulo}</h2>
        {to && <a href={`#/${to}`}>{t("sobre.ver", { name: t(`nav.${to}`) })}</a>}
      </div>
      {children}
    </section>
  );
};

function Avatar() {
  const { t } = useTranslation();
  const [semFoto, setSemFoto] = useState(false);

  if (semFoto) {
    return (
      <div
        className="sobre-avatar sobre-avatar-iniciais"
        role="img"
        aria-label={t("sobre.avatarAlt")}
      >
        {iniciais(t("app.name"))}
      </div>
    );
  }

  return (
    <img
      className="sobre-avatar"
      src={AVATAR}
      alt={t("sobre.avatarAlt")}
      width={144}
      height={144}
      onError={() => setSemFoto(true)}
    />
  );
}

function Cabecalho() {
  const { t } = useTranslation();

  return (
    <header className="sobre-cabecalho">
      <Avatar />
      <div>
        <p className="sobre-nome">{t("app.name")}</p>
        <p className="sobre-cargo">{t("app.role")}</p>
        <ul className="tags">
          <li>
            <FaGraduationCap aria-hidden="true" />
            {t("sobre.chips.periodo")}
          </li>
          <li>
            <FaBriefcase aria-hidden="true" />
            {t("sobre.chips.estagio")}
          </li>
        </ul>
      </div>
    </header>
  );
}

function Numeros() {
  const { t } = useTranslation();
  const cards: { id: "projetos" | "habilidades" | "certificados"; valor: number }[] = [
    { id: "projetos" as const, valor: projectsData.length },
    { id: "habilidades" as const, valor: practice.length + learning.length },
    { id: "certificados" as const, valor: certificates.length },
  ].filter((card) => card.valor > 0);

  if (cards.length === 0) return null;

  return (
    <ul className="sobre-kpis">
      {cards.map((card) => (
        <li key={card.id} className="sobre-kpi">
          <span className="sobre-kpi-valor">{card.valor}</span>
          <span className="sobre-kpi-rotulo">{t(`sobre.kpi.${card.id}`)}</span>
        </li>
      ))}
    </ul>
  );
}

function Hoje() {
  const { t, i18n } = useTranslation();

  if (hoje.length === 0) return null;

  return (
    <Secao titulo={t("sobre.hojeTitulo")}>
      <ul className="sobre-hoje">
        {hoje.map((item) => {
          const org = escolher(item.org, i18n.language);
          return (
            <li key={item.id}>
              <p className="sobre-hoje-cargo">
                {escolher(item.cargo, i18n.language)} {t("sobre.hoje.em")}{" "}
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {org}
                  </a>
                ) : (
                  org
                )}
              </p>
              <p className="sobre-hoje-detalhe">{escolher(item.detalhe, i18n.language)}</p>
            </li>
          );
        })}
      </ul>
    </Secao>
  );
}

function Disciplinas() {
  const { t } = useTranslation();

  if (disciplinas.length === 0) return null;

  return (
    <Secao titulo={t("sobre.disciplinasTitulo")}>
      {disciplinas.map((periodo) => (
        <div key={periodo.periodo}>
          <p className="sobre-periodo">{periodo.periodo}</p>
          <ul className="sobre-tags">
            {periodo.itens.map((disciplina) => (
              <li key={disciplina} className="sobre-tag">
                {disciplina}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Secao>
  );
}

function Pessoal() {
  const { t, i18n } = useTranslation();

  if (pessoal.length === 0) return null;

  return (
    <Secao titulo={t("sobre.pessoalTitulo")}>
      {pessoal.map((grupo) => (
        <div key={grupo.id}>
          <p className="sobre-periodo">{escolher(grupo.rotulo, i18n.language)}</p>
          <ul className="sobre-tags">
            {grupo.itens.map((item) => {
              const texto = escolher(item, i18n.language);
              return (
                <li key={texto} className="sobre-tag">
                  {texto}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </Secao>
  );
}

const SobreMim = () => {
  const { t } = useTranslation();

  return (
    <div className="prose">
      <Cabecalho />
      <p>{t("sobre.p1")}</p>
      <p>{t("sobre.p2")}</p>
      <p>{t("sobre.p3")}</p>
      <Numeros />
      {secoes.map(({ id, to }) => (
        <Secao key={id} titulo={t(`sobre.items.${id}.label`)} to={to}>
          <p>{t(`sobre.items.${id}.text`)}</p>
        </Secao>
      ))}
      <Hoje />
      <Disciplinas />
      <Pessoal />
    </div>
  );
};

export default SobreMim;
