import { useTranslation } from "react-i18next";
import type { Share } from "../lib/githubTypes";
import useGitHub from "../lib/useGitHub";
import Bars from "./Bars";
import Empty from "./Empty";
import Status from "./Status";

const GitHubLinguagens = () => {
  const { t } = useTranslation();
  const { data, loading, error } = useGitHub<Share[]>("linguagens");

  return (
    <div>
      <p className="lead">{t("linguagens.text")}</p>
      <Status loading={loading} error={error} />
      {data && (data.length > 0 ? <Bars items={data} /> : <Empty />)}
    </div>
  );
};

export default GitHubLinguagens;
