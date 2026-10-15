import { useTranslation } from "react-i18next";

const Empty = () => {
  const { t } = useTranslation();
  return <p>{t("app.empty")}</p>;
};

export default Empty;
