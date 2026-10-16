import { useEffect, useState } from "react";
import API_CONFIG from "../config/apiConfig";
import { liveEnabled } from "../data/formation";

const JANELA_MS = 30 * 60 * 1000;
const CHAVE = "portfolio:ultimaAtividade";

function lerUltimaAtividade(): number {
  try {
    return Number(localStorage.getItem(CHAVE)) || 0;
  } catch {
    return 0;
  }
}

export function marcarAtividade() {
  try {
    localStorage.setItem(CHAVE, String(Date.now()));
  } catch {}
}

let promessa: Promise<number | null> | null = null;

export function obterVisitas(): Promise<number | null> {
  if (promessa) return promessa;

  promessa = (async () => {
    const novaVisita = Date.now() - lerUltimaAtividade() > JANELA_MS;
    marcarAtividade();

    try {
      const resposta = await fetch(`${API_CONFIG.BASE_URL}/api/visitas`, {
        method: novaVisita ? "POST" : "GET",
      });
      if (!resposta.ok) return null;
      const dados = (await resposta.json()) as { total: number };
      return dados.total;
    } catch {
      return null;
    }
  })();

  return promessa;
}

export function useVisitas(): number | null {
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    if (liveEnabled) void obterVisitas().then(setTotal);
  }, []);

  return total;
}
