import { useTranslation } from "react-i18next";
import Peixe from "./Peixe";

const Carregando = () => {
  const { t } = useTranslation();

  return (
    <p role="status" className="carregando">
      <span aria-hidden="true">
        <Peixe size={32} />
      </span>
      {t("app.loading")}
    </p>
  );
};

export default Carregando;
