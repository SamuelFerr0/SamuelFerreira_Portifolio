import { lazy, Suspense, useEffect, useRef, type ComponentType } from "react";
import { useTranslation } from "react-i18next";
import { players, type SectionId } from "../data/formation";
import Carregando from "./Carregando";
import Contato from "./Contato";
import Experiencias from "./Experiencias";
import Formacao from "./Formacao";
import Habilidades from "./Habilidades";
import Projetos from "./Projetos";
import SobreMim from "./SobreMim";

const EmBreve = () => null;
const Curriculo = lazy(() => import("./Curriculo"));

const views: Record<SectionId, ComponentType> = {
  sobre: SobreMim,
  formacao: Formacao,
  curriculo: Curriculo,
  experiencias: Experiencias,
  habilidades: Habilidades,
  projetos: Projetos,
  wakatime: EmBreve,
  linguagens: EmBreve,
  atividade: EmBreve,
  livro: EmBreve,
  contato: Contato,
};

type Props = {
  id: SectionId;
  onClose: () => void;
};

const Panel = ({ id, onClose }: Props) => {
  const { t } = useTranslation();
  const title = useRef<HTMLHeadingElement>(null);
  const View = views[id];
  const numero = players.find((player) => player.id === id)?.number;

  useEffect(() => {
    window.scrollTo(0, 0);
    title.current?.focus();
  }, [id]);

  return (
    <section className="panel">
      <button type="button" className="back" onClick={onClose}>
        {t("app.back")}
      </button>
      {numero !== undefined && (
        <span className="panel-numero" aria-hidden="true">
          {numero}
        </span>
      )}
      <div className="panel-corpo" key={id}>
        <h1 ref={title} tabIndex={-1}>
          {t(`nav.${id}`)}
        </h1>
        <Suspense fallback={<Carregando />}>
          <View />
        </Suspense>
      </div>
    </section>
  );
};

export default Panel;
