import { useEffect, useState } from "react";

const DURACAO = 1200;

function reduzido() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useContagem(alvo: number | null): number | null {
  const [valor, setValor] = useState<number | null>(null);

  useEffect(() => {
    if (alvo === null) return;
    const duracao = reduzido() ? 0 : DURACAO;
    let quadro = 0;
    const inicio = performance.now();
    const passo = (agora: number) => {
      const progresso = duracao === 0 ? 1 : Math.min((agora - inicio) / duracao, 1);
      setValor(Math.round(alvo * (1 - Math.pow(1 - progresso, 3))));
      if (progresso < 1) quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [alvo]);

  return alvo === null ? null : (valor ?? 0);
}
