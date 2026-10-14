import { useTranslation } from "react-i18next";
import { IoMoonOutline, IoSunnyOutline } from "react-icons/io5";
import { useTheme } from "../theme/themeContext";

const OPTIONS = [
  { id: "light", Icon: IoSunnyOutline, label: "tema.ativar_claro" },
  { id: "dark", Icon: IoMoonOutline, label: "tema.ativar_escuro" },
] as const;

const ThemeToggle = () => {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  return (
    <div className="themeToggleGroup" role="group" aria-label={t("tema.grupo")}>
      {OPTIONS.map(({ id, Icon, label }) => (
        <button
          key={id}
          type="button"
          className="themeToggle"
          aria-pressed={theme === id}
          aria-label={t(label)}
          title={t(label)}
          onClick={() => setTheme(id)}
        >
          <Icon aria-hidden="true" />
        </button>
      ))}
    </div>
  );
};

export default ThemeToggle;
