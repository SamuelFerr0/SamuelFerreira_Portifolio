const reduzirMovimento = () =>
  typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function criarDigitacao(aoMudar: (texto: string) => void) {
  let alvo = "";
  let mostrado = 0;
  let quadro: number | null = null;
  let espera: (() => void) | null = null;

  function liberar() {
    const resolver = espera;
    espera = null;
    resolver?.();
  }

  function passo() {
    quadro = null;
    const falta = alvo.length - mostrado;
    if (falta > 0) {
      mostrado += Math.max(1, Math.ceil(falta / 10));
      aoMudar(alvo.slice(0, mostrado));
    }
    if (mostrado < alvo.length) quadro = requestAnimationFrame(passo);
    else liberar();
  }

  return {
    receber(textoAteAgora: string) {
      alvo = textoAteAgora;
      if (reduzirMovimento()) {
        mostrado = alvo.length;
        aoMudar(alvo);
        return;
      }
      if (quadro === null && mostrado < alvo.length) quadro = requestAnimationFrame(passo);
    },
    concluir(): Promise<void> {
      if (mostrado >= alvo.length) return Promise.resolve();
      return new Promise((resolver) => {
        espera = resolver;
      });
    },
    zerar() {
      if (quadro !== null) {
        cancelAnimationFrame(quadro);
        quadro = null;
      }
      alvo = "";
      mostrado = 0;
      liberar();
    },
  };
}
