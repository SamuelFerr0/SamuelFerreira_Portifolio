import { useTranslation } from "react-i18next";
import type { PerfilUser } from "../lib/githubTypes";

const GitHubPerfil = ({ user }: { user: PerfilUser }) => {
  const { t } = useTranslation();
  const meta = [
    user.company,
    user.location,
    user.createdAt ? t("stats.perfil.desde", { ano: user.createdAt.slice(0, 4) }) : null,
  ].filter((item): item is string => Boolean(item));

  return (
    <div className="ghs-perfil">
      <img
        className="ghs-avatar"
        src={`${user.avatarUrl}${user.avatarUrl.includes("?") ? "&" : "?"}s=128`}
        alt=""
        width={56}
        height={56}
        loading="lazy"
      />
      <div>
        <p className="ghs-perfil-nome">
          {user.name}{" "}
          <a href={user.url} target="_blank" rel="noopener noreferrer">
            @{user.login}
          </a>
        </p>
        {user.bio && <p className="ghs-perfil-bio">{user.bio}</p>}
        {meta.length > 0 && <p className="meta">{meta.join(" · ")}</p>}
      </div>
    </div>
  );
};

export default GitHubPerfil;
