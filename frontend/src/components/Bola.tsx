import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaFutbol } from "react-icons/fa";
import type { SectionId } from "../data/formation";
import Pitch from "./Pitch";

type Props = { onOpen: (id: SectionId) => void };

const Bola = ({ onOpen }: Props) => {
  const { t } = useTranslation();
  const [aberta, setAberta] = useState(false);
  const botao = useRef<HTMLButtonElement>(null);
  const fechar = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!aberta) return;
    fechar.current?.focus();
    const rolagem = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        setAberta(false);
        botao.current?.focus();
      }
    };
    window.addEventListener("keydown", aoTeclar);
    return () => {
      document.body.style.overflow = rolagem;
      window.removeEventListener("keydown", aoTeclar);
    };
  }, [aberta]);

  const voltar = () => {
    setAberta(false);
    botao.current?.focus();
  };

  const escolher = (id: SectionId) => {
    setAberta(false);
    onOpen(id);
  };

  return (
    <>
      <button
        ref={botao}
        type="button"
        className="bola"
        aria-expanded={aberta}
        aria-label={t("app.abrirMenu")}
        title={t("app.abrirMenu")}
        onClick={() => setAberta(true)}
      >
        <FaFutbol aria-hidden="true" />
      </button>
      {aberta && (
        <div className="bola-painel" role="dialog" aria-modal="true" aria-label={t("app.menu")} onClick={voltar}>
          <div className="bola-conteudo" onClick={(evento) => evento.stopPropagation()}>
            <button ref={fechar} type="button" className="bola-fechar" onClick={voltar}>
              {t("app.fechar")}
            </button>
            <Pitch onOpen={escolher} />
          </div>
        </div>
      )}
    </>
  );
};

export default Bola;
