import { useEffect, useState } from "react";
import WAKATIME_CONFIG from "../config/wakaTimeConfig";
import API_CONFIG from "../config/apiConfig";

const { API_PATH, ATUALIZAR_SEGUNDOS } = WAKATIME_CONFIG.AGORA;
const INTERVALO_PADRAO_MS = ATUALIZAR_SEGUNDOS * 1000;

export type Codando = {
  atualizarSegundos: number;
  ativo: boolean;
  hojeSegundos: number;
  ultimo: {
    publico: boolean;
    projeto: string | null;
    branch: string | null;
    linguagem: string | null;
    editor: string | null;
    em: number;
    sessaoDesde: number;
    projetoHojeSegundos: number;
  } | null;
};

export type CodandoEstado =
  | { status: "carregando" }
  | { status: "indisponivel" }
  | { status: "erro" }
  | { status: "ok"; dados: Codando };

let ultima: { em: number; estado: CodandoEstado | null } = { em: 0, estado: null };
let emAndamento: Promise<CodandoEstado> | null = null;

async function buscar(): Promise<CodandoEstado> {
  try {
    const resp = await fetch(`${API_CONFIG.BASE_URL}${API_PATH}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    const tipo = resp.headers.get("content-type") ?? "";
    if (resp.status === 204) return { status: "indisponivel" };
    if (!tipo.includes("application/json")) return { status: "indisponivel" };
    if (resp.status === 503) return { status: "indisponivel" };
    if (!resp.ok) return { status: "erro" };
    const dados = (await resp.json()) as Codando;
    if (typeof dados?.ativo !== "boolean") return { status: "erro" };
    return { status: "ok", dados };
  } catch {
    return { status: "erro" };
  }
}


const intervaloMs = (estado: CodandoEstado | null) =>
  estado?.status === "ok" && estado.dados.atualizarSegundos > 0
    ? estado.dados.atualizarSegundos * 1000
    : INTERVALO_PADRAO_MS;

export function obterCodando(): Promise<CodandoEstado> {
  if (ultima.estado && Date.now() - ultima.em < intervaloMs(ultima.estado) / 2) {
    return Promise.resolve(ultima.estado);
  }
  if (!emAndamento) {
    emAndamento = buscar().then((estado) => {
      ultima = { em: Date.now(), estado };
      emAndamento = null;
      return estado;
    });
  }
  return emAndamento;
}

export const codandoGuardado = () => ultima.estado;

export function useCodando(ativo = true): CodandoEstado {
  const [estado, setEstado] = useState<CodandoEstado>(
    () => codandoGuardado() ?? { status: "carregando" }
  );

  useEffect(() => {
    if (!ativo) return;
    let vivo = true;
    let parado = false;
    let id: ReturnType<typeof setTimeout> | null = null;

    const agendar = () => {
      id = setTimeout(atualizar, intervaloMs(codandoGuardado()));
    };

    const atualizar = () => {
      if (id) clearTimeout(id);
      id = null;
      if (!vivo || parado) return;
      if (document.visibilityState === "hidden") {
        agendar();
        return;
      }
      void obterCodando().then((novo) => {
        if (!vivo) return;
        setEstado(novo);
        // 204 e 503 chegam aqui como "indisponivel": para de consultar
        if (novo.status === "indisponivel") {
          parado = true;
          return;
        }
        agendar();
      });
    };

    atualizar();
    document.addEventListener("visibilitychange", atualizar);
    return () => {
      vivo = false;
      if (id) clearTimeout(id);
      document.removeEventListener("visibilitychange", atualizar);
    };
  }, [ativo]);

  return estado;
}

export function useRelogio(ativo = true) {
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    if (!ativo) return;
    const id = setInterval(() => setAgora(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [ativo]);

  return agora;
}

export function haQuanto(desdeMs: number, agoraMs: number) {
  const min = Math.max(0, Math.floor((agoraMs - desdeMs) / 60000));
  if (min < 1) return { unidade: "instantes" as const, n: 0 };
  if (min < 60) return { unidade: "minutos" as const, n: min };
  return { unidade: "horas" as const, n: Math.floor(min / 60) };
}
