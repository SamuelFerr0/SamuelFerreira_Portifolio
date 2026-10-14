import { useTranslation } from "react-i18next";
import Abertura from "./components/Abertura";
import Bola from "./components/Bola";
import Canais from "./components/Canais";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Panel from "./components/Panel";
import Pitch from "./components/Pitch";
import TextoDigitado from "./components/TextoDigitado";
import { useRoute } from "./lib/useRoute";

function App() {
  const { t } = useTranslation();
  const { route, go } = useRoute();

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
