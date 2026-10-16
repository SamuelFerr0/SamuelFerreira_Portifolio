import { Fragment, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import ASK_CONFIG from "../config/askConfig";
import { ErroAsk, esquecerConversa, perguntar } from "../lib/ask";
import { criarDigitacao } from "../lib/digitacao";

type Message = { role: "user" | "assistant"; text: string };
type Status = "idle" | "loading" | "error";
type Falha = { codigo: Codigo; espera: number | null };

const CODIGOS = [
  "limite",
  "limite_ia",
  "falha_ia",
  "tempo",
  "sem_chave",
  "indisponivel",
  "rede",
  "vazia",
  "pergunta_longa",
  "pergunta_vazia",
] as const;
type Codigo = (typeof CODIGOS)[number];

const codigoConhecido = (codigo: string): Codigo =>
  (CODIGOS as readonly string[]).includes(codigo) ? (codigo as Codigo) : "falha_ia";

function mensagemDeErro(t: TFunction, falha: Falha): string {
  if (falha.codigo === "limite" && falha.espera) {
    return t("ask.erros.limite_espera", { minutos: Math.ceil(falha.espera / 60) });
  }
  return t(`ask.erros.${falha.codigo}`);
}

const ITEM = /^\s*(?:[-*•]|\d+[.)])\s+/;
const INLINE =
  /(\*\*([^*\n]+)\*\*)|(`([^`\n]+)`)|(\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\))|(https?:\/\/[^\s<>()]*[^\s<>().,;:!?'"*])/g;

function inline(texto: string, prefixo: string): ReactNode[] {
  const partes: ReactNode[] = [];
  let ultimo = 0;
  for (const m of texto.matchAll(INLINE)) {
    const inicio = m.index ?? 0;
    if (inicio > ultimo) partes.push(texto.slice(ultimo, inicio));
    const chave = `${prefixo}-${inicio}`;
    if (m[1]) {
      partes.push(<strong key={chave}>{m[2]}</strong>);
    } else if (m[3]) {
      partes.push(<code key={chave}>{m[4]}</code>);
    } else {
      const href = m[7] ?? m[8];
      partes.push(
        <a key={chave} href={href} target="_blank" rel="noopener noreferrer">
          {m[6] ?? m[8]}
        </a>
      );
    }
    ultimo = inicio + m[0].length;
  }
  if (ultimo < texto.length) partes.push(texto.slice(ultimo));
  return partes;
}

const Markdown = ({ texto }: { texto: string }) => {
  const blocos = texto.split(/\n{2,}/).filter((bloco) => bloco.trim());
  return (
    <>
      {blocos.map((bloco, b) => {
        const grupos: { tipo: "lista" | "texto"; linhas: string[] }[] = [];
        for (const linha of bloco.split("\n")) {
          const tipo = ITEM.test(linha) ? "lista" : "texto";
          const atual = grupos[grupos.length - 1];
          if (atual?.tipo === tipo) atual.linhas.push(linha);
          else grupos.push({ tipo, linhas: [linha] });
        }
        return grupos.map((grupo, g) => {
          const chave = `${b}-${g}`;
          if (grupo.tipo === "lista") {
            return (
              <ul key={chave} className="ask-lista">
                {grupo.linhas.map((linha, i) => (
                  <li key={i}>{inline(linha.replace(ITEM, ""), `${chave}-${i}`)}</li>
                ))}
              </ul>
            );
          }
          return (
            <p key={chave}>
              {grupo.linhas.map((linha, i) => (
                <Fragment key={i}>
                  {i > 0 && <br />}
                  {inline(linha, `${chave}-${i}`)}
                </Fragment>
              ))}
            </p>
          );
        });
      })}
    </>
  );
};

const Balao = ({ role, children }: { role: Message["role"]; children: ReactNode }) => {
  const { t } = useTranslation();
  return (
    <div className={role === "user" ? "ask-msg ask-msg-user" : "ask-msg"}>
      <p className="ask-autor">
        {role === "user" ? t("ask.voce") : t("ask.title")}
        {role === "assistant" && <span className="ask-selo">{t("ask.selo")}</span>}
      </p>
      <div className="ask-texto">{children}</div>
    </div>
  );
};

const Digitando = () => {
  const { t } = useTranslation();
  return (
    <p className="ask-digitando" role="status">
      <span className="ask-sr">{t("ask.thinking")}</span>
      <span aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    </p>
  );
};

const BotaoSugestao = ({
  children,
  onPick,
}: {
  children: string;
  onPick: (texto: string) => void;
}) => (
  <button type="button" className="ask-sugestao" onClick={() => onPick(children)}>
    {children}
  </button>
);

const Apresentacao = ({ onPick }: { onPick: (texto: string) => void }) => {
  const { t } = useTranslation();
  const bruto: unknown = t("ask.sugestoes", { returnObjects: true });
  const sugestoes = Array.isArray(bruto)
    ? bruto.filter((item): item is string => typeof item === "string")
    : [];

  return (
    <>
      <p className="ask-note">{t("ask.intro")}</p>
      {sugestoes.length > 0 && (
        <div className="ask-sugestoes">
          <p className="ask-note">{t("ask.experimente")}</p>
          <ul>
            {sugestoes.map((sugestao) => (
              <li key={sugestao}>
                <BotaoSugestao onPick={onPick}>{sugestao}</BotaoSugestao>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

const Ask = () => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [parcial, setParcial] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [falha, setFalha] = useState<Falha | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const controle = useRef<AbortController | null>(null);
  const digitacao = useMemo(() => criarDigitacao(setParcial), []);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  useEffect(() => {
    end.current?.scrollIntoView?.({ block: "end" });
  }, [messages, parcial, status]);

  useEffect(
    () => () => {
      controle.current?.abort();
      digitacao.zerar();
    },
    [digitacao]
  );

  const pick = (texto: string) => {
    setText(texto);
    input.current?.focus();
  };

  const parar = () => {
    controle.current?.abort();
    digitacao.zerar();
    if (parcial.trim()) setMessages((current) => [...current, { role: "assistant", text: parcial }]);
    setParcial("");
    setStatus("idle");
  };

  const novaConversa = () => {
    controle.current?.abort();
    digitacao.zerar();
    esquecerConversa();
    setMessages([]);
    setParcial("");
    setText("");
    setFalha(null);
    setStatus("idle");
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = text.trim();
    if (!question || status === "loading") return;

    const controller = new AbortController();
    controle.current = controller;
    digitacao.zerar();

    setMessages([...messages, { role: "user", text: question }]);
    setText("");
    setFalha(null);
    setParcial("");
    setStatus("loading");

    try {
      const answer = await perguntar(question, {
        idioma: i18n.language.startsWith("pt") ? "pt" : "en",
        sinal: controller.signal,
        aoReceber: digitacao.receber,
      });
      await digitacao.concluir();
      if (controller.signal.aborted) return;
      setMessages((current) => [...current, { role: "assistant", text: answer }]);
      setParcial("");
      setStatus("idle");
    } catch (error) {
      if (controller.signal.aborted) return;
      const codigo = error instanceof ErroAsk ? codigoConhecido(error.codigo) : "falha_ia";
      setFalha({ codigo, espera: error instanceof ErroAsk ? error.esperaSegundos : null });
      setParcial("");
      setStatus("error");
    }
  }

  if (!open) {
    return (
      <button type="button" className="ask-toggle" onClick={() => setOpen(true)}>
        {t("ask.open")}
      </button>
    );
  }

  return (
    <section
      className="ask"
      role="dialog"
      aria-label={t("ask.title")}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <header className="ask-head">
        <h2>{t("ask.title")}</h2>
        <div className="ask-acoes">
          {(messages.length > 0 || status !== "idle") && (
            <button type="button" onClick={novaConversa}>
              {t("ask.nova")}
            </button>
          )}
          <button type="button" onClick={() => setOpen(false)}>
            {t("ask.close")}
          </button>
        </div>
      </header>
      <div className="ask-log" role="log">
        {messages.length === 0 && <Apresentacao onPick={pick} />}
        {messages.map((message, index) => (
          <Balao key={index} role={message.role}>
            {message.role === "user" ? <p>{message.text}</p> : <Markdown texto={message.text} />}
          </Balao>
        ))}
        {status === "loading" && parcial && (
          <Balao role="assistant">
            <Markdown texto={parcial} />
          </Balao>
        )}
        {status === "loading" && !parcial && <Digitando />}
        {status === "error" && falha && (
          <p className="ask-note ask-erro" role="alert">
            {mensagemDeErro(t, falha)}
          </p>
        )}
        <div ref={end} />
      </div>
      <form className="ask-form" onSubmit={handleSubmit}>
        <input
          ref={input}
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={ASK_CONFIG.MAX_PERGUNTA}
          placeholder={t("ask.placeholder")}
          aria-label={t("ask.placeholder")}
        />
        {status === "loading" ? (
          <button type="button" onClick={parar}>
            {t("ask.parar")}
          </button>
        ) : (
          <button type="submit">{t("ask.send")}</button>
        )}
      </form>
    </section>
  );
};

export default Ask;
