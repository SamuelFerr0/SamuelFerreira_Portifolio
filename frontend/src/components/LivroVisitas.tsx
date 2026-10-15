import { useEffect, useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import API_CONFIG from "../config/apiConfig";
import Status from "./Status";

type Mensagem = { id: string; nome: string; mensagem: string; data: string };
type Situacao = "parado" | "enviando" | "ok" | "limite" | "falhou";
type Erros = { nome?: boolean; mensagem?: boolean };

async function fetchMessages(): Promise<Mensagem[]> {
  const resposta = await fetch(`${API_CONFIG.BASE_URL}/api/livro`);
  if (!resposta.ok) throw new Error(String(resposta.status));
  return (await resposta.json()) as Mensagem[];
}

const LivroVisitas = () => {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [situacao, setSituacao] = useState<Situacao>("parado");
  const [erros, setErros] = useState<Erros>({});
  const sending = useRef(false);

  useEffect(() => {
    let active = true;
    fetchMessages()
      .then((list) => active && setMessages(list))
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    const nome = name.trim();
    const mensagem = message.trim();
    const site = String(new FormData(event.currentTarget).get("site") ?? "");

    const achados: Erros = {
      nome: nome.length < 2 || nome.length > 40,
      mensagem: mensagem.length < 3 || mensagem.length > 300,
    };
    setErros(achados);
    if (achados.nome || achados.mensagem) return;

    sending.current = true;
    setSituacao("enviando");
    try {
      const resposta = await fetch(`${API_CONFIG.BASE_URL}/api/livro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, mensagem, site }),
      });
      if (resposta.status === 429) {
        setSituacao("limite");
        return;
      }
      if (!resposta.ok) throw new Error(String(resposta.status));
      const criada = (await resposta.json()) as Mensagem;
      setMessages((atuais) => [criada, ...atuais]);
      setName("");
      setMessage("");
      setSituacao("ok");
    } catch {
      setSituacao("falhou");
    } finally {
      sending.current = false;
    }
  }

  return (
    <div>
      <p className="lead">{t("livro.text")}</p>

      <form className="form" onSubmit={handleSubmit} noValidate>
        <label>
          {t("livro.name")}
          <input
            name="nome"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={40}
            autoComplete="name"
            aria-invalid={erros.nome ? "true" : undefined}
            aria-describedby={erros.nome ? "erro-nome" : undefined}
          />
          {erros.nome && (
            <span id="erro-nome" className="error">
              {t("livro.errors.name")}
            </span>
          )}
        </label>
        <label>
          {t("livro.message")}
          <textarea
            name="mensagem"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            maxLength={300}
            rows={4}
            aria-invalid={erros.mensagem ? "true" : undefined}
            aria-describedby={erros.mensagem ? "erro-mensagem" : undefined}
          />
          {erros.mensagem && (
            <span id="erro-mensagem" className="error">
              {t("livro.errors.message")}
            </span>
          )}
        </label>
        <input className="hp" name="site" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <button type="submit" className="button" disabled={situacao === "enviando"}>
          {situacao === "enviando" ? t("livro.sending") : t("livro.send")}
        </button>
        <p role="status">
          {situacao === "ok" && t("livro.ok")}
          {situacao === "limite" && t("livro.limite")}
          {situacao === "falhou" && t("livro.fail")}
        </p>
      </form>

      <Status loading={loading} error={error} />
      {!loading && !error && messages.length === 0 && <p>{t("livro.vazio")}</p>}
      {messages.length > 0 && (
        <ul className="livro-lista">
          {messages.map((item) => (
            <li key={item.id}>
              <span className="livro-nome">{item.nome}</span>
              <p>{item.mensagem}</p>
              <span className="meta">{new Date(item.data).toLocaleDateString(i18n.language)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LivroVisitas;
