import { Suspense, useEffect, useRef, type ComponentType } from "react";
import { useTranslation } from "react-i18next";
import { players, type SectionId } from "../data/formation";
import Carregando from "./Carregando";
import Experiencias from "./Experiencias";
import Formacao from "./Formacao";
import SobreMim from "./SobreMim";

const EmBreve = () => null;

const views: Record<SectionId, ComponentType> = {
  sobre: SobreMim,
  formacao: Formacao,
  curriculo: EmBreve,
  experiencias: Experiencias,
  habilidades: EmBreve,
  projetos: EmBreve,
  wakatime: EmBreve,
  linguagens: EmBreve,
  atividade: EmBreve,
  livro: EmBreve,
  contato: EmBreve,
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
