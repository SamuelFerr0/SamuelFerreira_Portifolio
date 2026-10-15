import { useCallback, useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import RECAPTCHA_CONFIG from "../config/recaptchaConfig";
import { links } from "../data/links";
import { emailJsEnabled, sendEmail } from "../lib/sendEmail";
import { useTheme } from "../theme/themeContext";
import Canais from "./Canais";
import ReCaptcha, { type ReCaptchaHandle } from "./ReCaptcha";

type Status =
  | ""
  | "contato.sending"
  | "contato.ok"
  | "contato.mailto"
  | "contato.fail"
  | "contato.captcha_pendente"
  | "contato.captcha_erro";
type Errors = { name?: boolean; email?: boolean; message?: boolean };

const MAX_NOME = 100;
const MAX_EMAIL = 254;
const MAX_MENSAGEM = 2000;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Contato = () => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const captchaEnabled = Boolean(RECAPTCHA_CONFIG.SITE_KEY);
  const captchaRef = useRef<ReCaptchaHandle>(null);
  const [status, setStatus] = useState<Status>("");
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaFailed, setCaptchaFailed] = useState(false);
  const showCaptcha = captchaEnabled && !captchaFailed;

  const handleCaptchaChange = useCallback((token: string | null) => {
    setCaptchaToken(token);
    if (token) setStatus((current) => (current === "contato.captcha_pendente" ? "" : current));
  }, []);

  const handleCaptchaError = useCallback(() => {
    setCaptchaFailed(true);
    setStatus("contato.captcha_erro");
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    if (String(data.get("site") ?? "") !== "") {
      form.reset();
      setStatus("contato.ok");
      return;
    }

    const found: Errors = {
      name: name.length < 2 || name.length > MAX_NOME,
      email: !emailPattern.test(email) || email.length > MAX_EMAIL,
      message: message.length < 10 || message.length > MAX_MENSAGEM,
    };
    setErrors(found);
    if (found.name || found.email || found.message) return;

    if (!emailJsEnabled) {
      const subject = encodeURIComponent(`Portfólio: mensagem de ${name}`);
      const body = encodeURIComponent(`${message}\n\n${name} <${email}>`);
      window.location.href = `mailto:${links.email}?subject=${subject}&body=${body}`;
      setStatus("contato.mailto");
      return;
    }

    if (captchaEnabled && !captchaToken) {
      setStatus(captchaFailed ? "contato.captcha_erro" : "contato.captcha_pendente");
      return;
    }

    setSending(true);
    setStatus("contato.sending");
    try {
      await sendEmail({
        name,
        email,
        message,
        language: i18n.language,
        confirmationTitle: t("contato.assuntoConfirmacao"),
        captchaToken: captchaEnabled ? captchaToken : null,
      });
      form.reset();
      setStatus("contato.ok");
    } catch {
      setStatus("contato.fail");
    } finally {
      setSending(false);
      captchaRef.current?.reset();
    }
  }

  return (
    <div className="prose">
      <p>{t("contato.text")}</p>
      <Canais />
      <form className="form" onSubmit={handleSubmit} noValidate aria-busy={sending}>
        <p role="status" aria-live="polite">
          {status && t(status)}
        </p>
        <label>
          {t("contato.name")}
          <input
            name="name"
            maxLength={MAX_NOME}
            autoComplete="name"
            aria-invalid={errors.name ? "true" : undefined}
            aria-describedby={errors.name ? "error-name" : undefined}
          />
          {errors.name && (
            <span id="error-name" className="error">
              {t("contato.errors.name")}
            </span>
          )}
        </label>
        <label>
          {t("contato.email")}
          <input
            name="email"
            type="email"
            maxLength={MAX_EMAIL}
            autoComplete="email"
            aria-invalid={errors.email ? "true" : undefined}
            aria-describedby={errors.email ? "error-email" : undefined}
          />
          {errors.email && (
            <span id="error-email" className="error">
              {t("contato.errors.email")}
            </span>
          )}
        </label>
        <label>
          {t("contato.message")}
          <textarea
            name="message"
            maxLength={MAX_MENSAGEM}
            rows={6}
            aria-invalid={errors.message ? "true" : undefined}
            aria-describedby={errors.message ? "error-message" : undefined}
          />
          {errors.message && (
            <span id="error-message" className="error">
              {t("contato.errors.message")}
            </span>
          )}
        </label>
        {showCaptcha && (
          <ReCaptcha
            ref={captchaRef}
            siteKey={RECAPTCHA_CONFIG.SITE_KEY as string}
            theme={theme}
            language={i18n.language}
            onChange={handleCaptchaChange}
            onError={handleCaptchaError}
          />
        )}
        <input className="hp" name="site" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <button type="submit" className="button" disabled={sending}>
          {sending ? t("contato.sending") : t("contato.send")}
        </button>
      </form>
    </div>
  );
};

export default Contato;
