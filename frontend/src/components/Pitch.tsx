import { useTranslation } from "react-i18next";
import { formation, type SectionId } from "../data/formation";
import Camisa from "./Camisa";
import Peixe from "./Peixe";

type Props = { onOpen: (id: SectionId) => void };

const Pitch = ({ onOpen }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="pitch-wrap">
      <div
        className="pitch"
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
    </div>
  );
};

export default Pitch;
