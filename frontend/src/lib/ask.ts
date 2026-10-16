import ASK_CONFIG from "../config/askConfig";
import API_CONFIG from "../config/apiConfig";

const { PROXY_PATH, MAX_HISTORICO, MAX_TEXTO_HISTORICO } = ASK_CONFIG;

type Papel = "visitante" | "ia";
type Mensagem = { papel: Papel; texto: string };

let conversa: Mensagem[] = [];

export class ErroAsk extends Error {
  codigo: string;
  esperaSegundos: number | null;

  constructor(codigo: string, esperaSegundos: number | null = null) {
    super(codigo);
    this.codigo = codigo;
    this.esperaSegundos = esperaSegundos;
  }
}

type Opcoes = {
  idioma: "pt" | "en";
  sinal?: AbortSignal;
  aoReceber?: (textoAteAgora: string) => void;
};

const abortou = (error: unknown) => error instanceof DOMException && error.name === "AbortError";

export function esquecerConversa() {
  conversa = [];
}

async function ler(resposta: Response, aoReceber?: (textoAteAgora: string) => void): Promise<string> {
  if (!resposta.body) {
    const completo = await resposta.text();
    aoReceber?.(completo.trim());
    return completo;
  }
  const leitor = resposta.body.getReader();
  const decodificador = new TextDecoder();
  let texto = "";
  try {
    for (;;) {
      const { done, value } = await leitor.read();
      if (done) break;
      texto += decodificador.decode(value, { stream: true });
      aoReceber?.(texto.trimStart());
    }
    texto += decodificador.decode();
  } catch (error) {
    if (abortou(error)) throw error;
    if (!texto.trim()) throw new ErroAsk("rede");
  }
  return texto;
}

export async function perguntar(pergunta: string, { idioma, sinal, aoReceber }: Opcoes): Promise<string> {
  let resposta: Response;
  try {
    resposta = await fetch(`${API_CONFIG.BASE_URL}${PROXY_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pergunta, idioma, historico: conversa.slice(-MAX_HISTORICO) }),
      signal: sinal,
    });
  } catch (error) {
    if (abortou(error)) throw error;
    throw new ErroAsk("rede");
  }

  if (!resposta.headers.get("X-Ask-Proxy")) throw new ErroAsk("indisponivel");

  if (!resposta.ok) {
    const corpo = (await resposta.json().catch(() => ({}))) as { erro?: string };
    const espera = Number(resposta.headers.get("Retry-After")) || null;
    throw new ErroAsk(corpo.erro ?? "falha_ia", espera);
  }

  const texto = (await ler(resposta, aoReceber)).trim();
  if (!texto) throw new ErroAsk("vazia");

  conversa = [
    ...conversa,
    { papel: "visitante" as const, texto: pergunta },
    { papel: "ia" as const, texto: texto.slice(0, MAX_TEXTO_HISTORICO) },
  ].slice(-MAX_HISTORICO);

  return texto;
}
