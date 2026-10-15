import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Abertura from "./components/Abertura";
import Bola from "./components/Bola";
import Canais from "./components/Canais";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Panel from "./components/Panel";
import Pitch from "./components/Pitch";
import TextoDigitado from "./components/TextoDigitado";
import { liveEnabled } from "./data/formation";
import API_CONFIG from "./config/apiConfig";
import { useRoute } from "./lib/rota";
import { useContagem } from "./lib/contagem";
import { marcarAtividade, useVisitas } from "./lib/visitas";

function App() {
  const { t } = useTranslation();
  const { route, go } = useRoute();
  const visitas = useContagem(useVisitas());

  useEffect(() => {
    if (liveEnabled) fetch(`${API_CONFIG.BASE_URL}/api/health`).catch(() => undefined);
  }, []);

  useEffect(() => {
    marcarAtividade();
  }, [route]);

  return (
    <>
      <Abertura />
      <Header />
      <main className="page">
        {route ? (
          <Panel id={route} onClose={() => go(null)} />
        ) : (
          <div className="home">
            <div className="intro">
              <h1>{t("app.name")}</h1>
              <TextoDigitado className="role" texto={t("app.role")} />
              <p>{t("app.goal")}</p>
              <Canais curriculo />
              <p className="hint">{t("app.hint")}</p>
              {visitas !== null && (
                <p className="visitas">{t("visitas.total", { count: visitas })}</p>
              )}
            </div>
            <Pitch onOpen={go} />
          </div>
        )}
      </main>
      {route && <Bola onOpen={go} />}
      <Footer />
    </>
  );
}

export default App;
