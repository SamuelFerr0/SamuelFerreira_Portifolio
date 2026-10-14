import { useTranslation } from "react-i18next";
import { haQuanto, useCodando, useRelogio } from "../lib/codando";
import { formatDuration } from "../lib/wakatime";

const CodandoAgora = () => {
  const { t } = useTranslation();
  const estado = useCodando();
  const agora = useRelogio(estado.status === "ok");

  if (estado.status !== "ok") return null;

  const { ativo, hojeSegundos, ultimo } = estado.dados;
  const quando = ultimo ? haQuanto(ultimo.em, agora) : null;

  const onde = ultimo
    ? ultimo.publico && ultimo.projeto
      ? t("wakatime.agora.em", { projeto: ultimo.projeto })
      : t("wakatime.agora.privado")
    : null;

  const detalhes = [
    ultimo?.branch ? t("wakatime.agora.branch", { branch: ultimo.branch }) : null,
    ultimo?.linguagem,
    ultimo?.editor,
    ativo && ultimo
      ? t("wakatime.agora.sessao", { tempo: formatDuration((agora - ultimo.sessaoDesde) / 1000) })
      : quando
        ? t("wakatime.agora.ultima", {
            quando: t(`wakatime.agora.ha.${quando.unidade}`, { n: quando.n }),
          })
        : null,
    hojeSegundos > 0 ? t("wakatime.agora.hoje", { tempo: formatDuration(hojeSegundos) }) : null,
  ].filter(Boolean);

  return (
    <div className="codando" data-ativo={ativo} role="status">
      <span className="codando-dot" aria-hidden="true" />
      <p>
        <strong>{ativo ? t("wakatime.agora.ativo") : t("wakatime.agora.inativo")}</strong>
        {onde && ` ${onde}`}
      </p>
      {detalhes.length > 0 && <p className="meta">{detalhes.join(" · ")}</p>}
    </div>
  );
};

export default CodandoAgora;
