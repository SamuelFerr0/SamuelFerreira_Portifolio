import React from "react";
import { useTranslation } from "react-i18next";
import { IoMoonOutline, IoSunnyOutline } from "react-icons/io5";
import { useTheme, type Theme } from "../theme/themeContext";

const OPTIONS = [
  { id: "light", Icon: IoSunnyOutline, label: "tema.ativar_claro" },
  { id: "dark", Icon: IoMoonOutline, label: "tema.ativar_escuro" },
] as const;

const ThemeToggle = ({ onToggle }: { onToggle?: () => void }) => {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  const choose = (id: Theme) => {
    setTheme(id);
    if (onToggle) onToggle();
  };

  return (
    <div className="themeToggleGroup" role="group" aria-label={t("tema.grupo")}>
      {OPTIONS.map(({ id, Icon: icon, label }) => (
        <button
          key={id}
          type="button"
          className={`themeToggle themeToggle-${id}${theme === id ? " themeToggle-active" : ""}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => choose(id)}
          aria-pressed={theme === id}
          aria-label={t(label)}
          title={t(label)}
        >
          {React.createElement(icon)}
        </button>
      ))}
    </div>
  );
};

export default ThemeToggle;
