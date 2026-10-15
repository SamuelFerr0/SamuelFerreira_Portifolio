import { useTranslation } from "react-i18next";
import { FaGlobeAmericas } from "react-icons/fa";
import ThemeToggle from "./ThemeToggle";

type LanguageSwitcherProps = { onChange?: () => void };

const LanguageSwitcher = ({ onChange }: LanguageSwitcherProps) => {
  const { i18n } = useTranslation();

  const selectLanguage = (code: string) => {
    void i18n.changeLanguage(code);
    onChange?.();
  };

  const current = i18n.language;
  const ptSelected = current.startsWith("pt");
  const enSelected = current.startsWith("en");

  return (
    <div className="switcherContainer">
      <ThemeToggle onToggle={onChange} />
      <span className="switcherDivider">|</span>
      <FaGlobeAmericas className={`icon ${enSelected ? "active" : ""}`} />
      <span
        className={`langText ${ptSelected ? "active" : ""}`}
        onClick={() => selectLanguage("pt")}
      >
        PT
      </span>
      <span>|</span>
      <span
        className={`langText ${enSelected ? "active" : ""}`}
        onClick={() => selectLanguage("en")}
      >
        EN
      </span>
    </div>
  );
};

export default LanguageSwitcher;
