import { useTranslation } from "react-i18next";
import { FaGlobeAmericas } from "react-icons/fa";
import ThemeToggle from "./ThemeToggle";

const LanguageSwitcher = ({ onLanguageChange }: { onLanguageChange?: () => void }) => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    void i18n.changeLanguage(lng);
    if (onLanguageChange) {
      onLanguageChange();
    }
  };

  const isPtActive = i18n.language.startsWith("pt");
  const isEnActive = i18n.language.startsWith("en");

  return (
    <div className="switcherContainer">
      <ThemeToggle onToggle={onLanguageChange} />
      <span className="switcherDivider">|</span>
      <FaGlobeAmericas className={`icon ${isEnActive ? "active" : ""}`} />
      <span
        className={`langText ${isPtActive ? "active" : ""}`}
        onClick={() => changeLanguage("pt")}
      >
        PT
      </span>
      <span>|</span>
      <span
        className={`langText ${isEnActive ? "active" : ""}`}
        onClick={() => changeLanguage("en")}
      >
        EN
      </span>
    </div>
  );
};

export default LanguageSwitcher;
