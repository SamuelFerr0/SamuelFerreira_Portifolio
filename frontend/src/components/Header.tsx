import { useTranslation } from "react-i18next";
import type { SectionId } from "../data/formation";
import LanguageSwitcher from "./LanguageSwitcher";

type Props = { route: SectionId | null };

const menu = ["sobre", "projetos", "experiencias", "contato"] as const;

const Header = ({ route }: Props) => {
  const { t } = useTranslation();

  return (
    <header className="site-header">
      <a className="brand" href="#/">
        Samuel F. Guimarães
      </a>
      <nav className="menu" aria-label={t("app.menu")}>
        <a href="#/" aria-current={route === null ? "page" : undefined}>
          {t("nav.home")}
        </a>
        {menu.map((id) => (
          <a key={id} href={`#/${id}`} aria-current={route === id ? "page" : undefined}>
            {t(`nav.${id}`)}
          </a>
        ))}
      </nav>
      <div className="controls">
        <LanguageSwitcher />
      </div>
    </header>
  );
};

export default Header;
