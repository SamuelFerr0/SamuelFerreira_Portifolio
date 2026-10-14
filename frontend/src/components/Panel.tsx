import { Suspense, useEffect, useRef, type ComponentType } from "react";
import { useTranslation } from "react-i18next";
import { players, type SectionId } from "../data/formation";

const EmBreve = () => null;

const views: Record<SectionId, ComponentType> = {
  sobre: EmBreve,
  formacao: EmBreve,
  curriculo: EmBreve,
  experiencias: EmBreve,
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
  onOpen: (id: SectionId) => void;
  onClose: () => void;
};

const Panel = ({ id, onOpen, onClose }: Props) => {
  const { t } = useTranslation();
  const title = useRef<HTMLHeadingElement>(null);
  const View = views[id];

  useEffect(() => {
    window.scrollTo(0, 0);
    title.current?.focus();
  }, [id]);

  return (
    <section className="panel">
      <button type="button" className="back" onClick={onClose}>
        {t("app.back")}
      </button>
      <nav className="shirts" aria-label={t("app.hint")}>
        {players.map((player) => (
          <button
            key={player.id}
            type="button"
            className="chip"
            data-live={player.live}
            aria-current={player.id === id ? "page" : undefined}
            aria-label={t(`nav.${player.id}`)}
            title={t(`nav.${player.id}`)}
            onClick={() => onOpen(player.id)}
          >
            {player.number}
          </button>
        ))}
      </nav>
      <div className="panel-corpo" key={id}>
        <h1 ref={title} tabIndex={-1}>
          {t(`nav.${id}`)}
        </h1>
        <Suspense fallback={<p role="status">{t("app.loading")}</p>}>
          <View />
        </Suspense>
      </div>
    </section>
  );
};

export default Panel;
