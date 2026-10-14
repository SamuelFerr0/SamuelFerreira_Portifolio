import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiDownload, FiExternalLink, FiMaximize2, FiZoomIn, FiZoomOut } from "react-icons/fi";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2;
const ZOOM_PASSO = 0.25;

const Curriculo = () => {
  const { t, i18n } = useTranslation();
  const areaRef = useRef<HTMLDivElement>(null);
  const [largura, setLargura] = useState<number | null>(null);
  const [paginas, setPaginas] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [erro, setErro] = useState(false);

  const lang = i18n.language.startsWith("pt") ? "pt" : "en";
  const fileUrl = `/cv-${lang}.pdf`;

  const [arquivoAtual, setArquivoAtual] = useState(fileUrl);
  if (arquivoAtual !== fileUrl) {
    setArquivoAtual(fileUrl);
    setPaginas(0);
    setErro(false);
  }

  useEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    const medir = (largura: number) => setLargura(Math.max(200, Math.floor(largura)));
    if (!("ResizeObserver" in window)) {
      const estilo = getComputedStyle(area);
      medir(area.clientWidth - parseFloat(estilo.paddingLeft) - parseFloat(estilo.paddingRight));
      return;
    }
    const observer = new ResizeObserver(([entry]) => medir(entry.contentRect.width));
    observer.observe(area);
    return () => observer.disconnect();
  }, []);

  const mudarZoom = (delta: number) =>
    setZoom((atual) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, atual + delta)));

  const larguraDaPagina = largura ? Math.round(largura * zoom) : undefined;
  const carregando = !erro && paginas === 0;

  return (
    <div>
      <p className="lead">{t("curriculo.text")}</p>
      <div className="curriculo">
        <div className="cv-barra">
          <span className="cv-paginas">
            {paginas > 0 && t("curriculo.paginas", { count: paginas })}
          </span>

          <div className="cv-zoom" role="group" aria-label={t("curriculo.zoom")}>
            <button
              type="button"
              onClick={() => mudarZoom(-ZOOM_PASSO)}
              disabled={zoom <= ZOOM_MIN}
              aria-label={t("curriculo.zoom_menos")}
              title={t("curriculo.zoom_menos")}
            >
              <FiZoomOut aria-hidden="true" />
            </button>
            <span className="cv-zoom-valor" aria-live="polite">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => mudarZoom(ZOOM_PASSO)}
              disabled={zoom >= ZOOM_MAX}
              aria-label={t("curriculo.zoom_mais")}
              title={t("curriculo.zoom_mais")}
            >
              <FiZoomIn aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(1)}
              disabled={zoom === 1}
              aria-label={t("curriculo.zoom_ajustar")}
              title={t("curriculo.zoom_ajustar")}
            >
              <FiMaximize2 aria-hidden="true" />
            </button>
          </div>

          <div className="cv-acoes">
            <a className="button" href={fileUrl} download={t("curriculo.arquivo")}>
              <FiDownload aria-hidden="true" /> {t("curriculo.baixar")}
            </a>
            <a className="button" href={fileUrl} target="_blank" rel="noopener noreferrer">
              <FiExternalLink aria-hidden="true" /> {t("curriculo.abrir")}
            </a>
          </div>
        </div>

        <div className="cv-area" ref={areaRef}>
          {carregando && (
            <p className="cv-aviso" role="status">
              <span className="cv-spinner" aria-hidden="true" />
              {t("curriculo.carregando")}
            </p>
          )}
          {erro ? (
            <p className="cv-aviso">{t("curriculo.erro")}</p>
          ) : (
            <Document
              key={fileUrl}
              file={fileUrl}
              onLoadSuccess={({ numPages }) => setPaginas(numPages)}
              onLoadError={(error) => {
                console.error("Currículo: falha ao abrir o PDF", error);
                setErro(true);
              }}
              loading={null}
              error={null}
              externalLinkTarget="_blank"
              externalLinkRel="noopener noreferrer"
            >
              {larguraDaPagina &&
                Array.from({ length: paginas }, (_, i) => (
                  <div key={i} className="cv-pagina">
                    <Page pageNumber={i + 1} width={larguraDaPagina} loading={null} />
                  </div>
                ))}
            </Document>
          )}
        </div>
      </div>
    </div>
  );
};

export default Curriculo;
