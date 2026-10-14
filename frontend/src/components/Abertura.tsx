import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Peixe from "./Peixe";

const CHAVE = "abertura-vista";
const DURACAO = 2200;
const SAIDA = 500;

function deveAbrir() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    return sessionStorage.getItem(CHAVE) !== "1";
  } catch {
    return true;
  }
}

const Abertura = () => {
  const { t } = useTranslation();
  const [aberta, setAberta] = useState(deveAbrir);
  const [saindo, setSaindo] = useState(false);

  const fechar = useCallback(() => {
    setSaindo(true);
    try {
      sessionStorage.setItem(CHAVE, "1");
    } catch {
      return;
    }
  }, []);

  useEffect(() => {
    if (!aberta) return;
    const sair = window.setTimeout(fechar, DURACAO);
    const remover = window.setTimeout(() => setAberta(false), DURACAO + SAIDA);
    window.addEventListener("keydown", fechar);
    return () => {
      window.clearTimeout(sair);
      window.clearTimeout(remover);
      window.removeEventListener("keydown", fechar);
    };
  }, [aberta, fechar]);

  if (!aberta) return null;

  return (
    <div className="abertura" data-saindo={saindo} aria-hidden="true" onClick={fechar}>
      <Peixe size={110} />
      <p className="abertura-vila">{t("app.alvinegro")}</p>
      <p className="abertura-nome">{t("app.vila")}</p>
      <p className="abertura-nome">{t("app.name")}</p>
    </div>
  );
};

export default Abertura;
