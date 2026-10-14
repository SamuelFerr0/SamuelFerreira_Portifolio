import { useTranslation } from "react-i18next";
import { formation, type SectionId } from "../data/formation";
import { useSkin } from "../hooks/useSkin";
import Camisa from "./Camisa";
import Peixe from "./Peixe";
import SkinSwitcher from "./SkinSwitcher";

type Props = { onOpen: (id: SectionId) => void };

const CAMISAS = ["jogo", "treino"] as const;

const Pitch = ({ onOpen }: Props) => {
  const { t } = useTranslation();
  const [camisa, setCamisa] = useSkin("camisa", CAMISAS, "jogo");

  return (
    <div className="pitch-wrap">
      <div
        className="pitch"
        data-camisa={camisa}
        style={{ gridTemplateRows: `repeat(${formation.length}, 1fr)` }}
      >
        <div className="pitch-box" aria-hidden="true" />
        <div className="pitch-box pitch-box-topo" aria-hidden="true" />
        <div className="pitch-centro" aria-hidden="true">
          <Peixe size={36} />
        </div>
        {formation.map((row, index) => (
          <div className="pitch-row" key={index}>
            {row.map((player) => (
              <button
                key={player.id}
                type="button"
                className="player"
                data-live={player.live}
                style={{ animationDelay: `${player.number * 70}ms` }}
                onClick={() => onOpen(player.id)}
              >
                <span className="shirt" data-dez={player.number === 10}>
                  <Camisa numero={player.number} />
                </span>
                <span className="player-name">{t(`nav.${player.id}`)}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
      <SkinSwitcher
        label={t("app.camisa")}
        skins={CAMISAS}
        names={{ jogo: t("app.camisas.jogo"), treino: t("app.camisas.treino") }}
        active={camisa}
        onChange={setCamisa}
      />
    </div>
  );
};

export default Pitch;
