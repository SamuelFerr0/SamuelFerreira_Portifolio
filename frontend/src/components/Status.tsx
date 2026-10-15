import { useTranslation } from "react-i18next";
import Carregando from "./Carregando";

const Status = ({ loading, error }: { loading: boolean; error: boolean }) => {
  const { t } = useTranslation();

  if (loading) return <Carregando />;
  if (error) return <p role="alert">{t("app.failed")}</p>;
  return null;
};

export default Status;
