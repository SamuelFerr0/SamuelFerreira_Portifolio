import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { AVATAR, disciplinas, hoje, pessoal, secoes, type Texto } from "../data/sobreData";

function iniciais(nome: string) {
  const partes = nome.split(" ").filter(Boolean);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? (partes.at(-1)?.[0] ?? "") : "";
  return `${primeira}${ultima}`.toUpperCase();
}

const escolher = (texto: Texto, idioma: string) => (idioma.startsWith("en") ? texto.en : texto.pt);

const Secao = ({ titulo, children }: { titulo: string; children: ReactNode }) => (
  <section className="sobre-secao">
    <h2>{titulo}</h2>
    {children}
  </section>
);

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
      </div>
    </header>
  );
}

function Ficha() {
  const { t } = useTranslation();

  return (
    <dl className="sobre-ficha">
      {secoes.map(({ id, to }) => (
        <div key={id}>
          <dt>{t(`sobre.items.${id}.label`)}</dt>
          <dd>
            {t(`sobre.items.${id}.text`)}
            {to && <a href={`#/${to}`}>{t("sobre.ver", { name: t(`nav.${to}`) })} →</a>}
          </dd>
        </div>
      ))}
    </dl>
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
          <p className="sobre-linha">{periodo.itens.join(" · ")}</p>
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
          <p className="sobre-linha">
            {grupo.itens.map((item) => escolher(item, i18n.language)).join(" · ")}
          </p>
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
      <Ficha />
      <Hoje />
      <Disciplinas />
      <Pessoal />
    </div>
  );
};

export default SobreMim;
