import { useEffect, useState } from "react";
import WAKATIME_CONFIG from "../config/wakaTimeConfig";
import API_CONFIG from "../config/apiConfig";

const { API_PATH, ATUALIZAR_SEGUNDOS } = WAKATIME_CONFIG.AGORA;
const INTERVALO_MS = ATUALIZAR_SEGUNDOS * 1000;

export type Codando = {
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

export function obterCodando(): Promise<CodandoEstado> {
  if (ultima.estado && Date.now() - ultima.em < INTERVALO_MS / 2) {
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
    let id: ReturnType<typeof setInterval> | null = null;

    const atualizar = () => {
      if (document.visibilityState === "hidden") return;
      void obterCodando().then((novo) => {
        if (!vivo) return;
        setEstado(novo);
        if (novo.status === "indisponivel" && id) {
          clearInterval(id);
          id = null;
        }
      });
    };

    atualizar();
    id = setInterval(atualizar, INTERVALO_MS);
    document.addEventListener("visibilitychange", atualizar);
    return () => {
      vivo = false;
      if (id) clearInterval(id);
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
