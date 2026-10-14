import { useCallback, useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import EMAILJS_CONFIG from "../config/emailJsConfig";
import RECAPTCHA_CONFIG from "../config/recaptchaConfig";
import { links } from "../data/links";
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

const { SERVICE_ID, TEMPLATE_ID_FOR_ME, TEMPLATE_ID_FOR_SENDER, PUBLIC_KEY } = EMAILJS_CONFIG;
const EMAILJS_OPTIONS = { publicKey: PUBLIC_KEY };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Contato = () => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const captchaEnabled = Boolean(RECAPTCHA_CONFIG.SITE_KEY);
  const captcha = useRef<ReCaptchaHandle>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("");
  const [errors, setErrors] = useState<Errors>({});

  const handleCaptchaChange = useCallback((token: string | null) => {
    setCaptchaToken(token);
    if (token) setStatus((current) => (current === "contato.captcha_pendente" ? "" : current));
  }, []);

  const handleCaptchaError = useCallback(() => setStatus("contato.captcha_erro"), []);

  async function sendEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      name: name.length < 2,
      email: !emailPattern.test(email),
      message: message.length < 10,
    };
    setErrors(found);
    if (found.name || found.email || found.message) return;

    if (!SERVICE_ID || !TEMPLATE_ID_FOR_ME || !PUBLIC_KEY) {
      const subject = encodeURIComponent(`Portfólio: mensagem de ${name}`);
      const body = encodeURIComponent(`${message}\n\n${name} <${email}>`);
      window.location.href = `mailto:${links.email}?subject=${subject}&body=${body}`;
      setStatus("contato.mailto");
      return;
    }

    if (captchaEnabled && !captchaToken) {
      setStatus("contato.captcha_pendente");
      return;
    }

    setStatus("contato.sending");
    try {
      const { default: emailjs } = await import("@emailjs/browser");
      const time = new Date().toLocaleString(i18n.language);
      const fields = { name, email, message, time };
      const title = `Nova mensagem do portfólio de: ${name}`;
      const token = captchaEnabled ? { "g-recaptcha-response": captchaToken } : {};

      if (TEMPLATE_ID_FOR_SENDER) {
        await emailjs.send(
          SERVICE_ID,
          TEMPLATE_ID_FOR_SENDER,
          { ...fields, title: t("contato.assuntoConfirmacao"), ...token },
          EMAILJS_OPTIONS
        );
        await emailjs.send(SERVICE_ID, TEMPLATE_ID_FOR_ME, { ...fields, title }, EMAILJS_OPTIONS);
      } else {
        await emailjs.send(
          SERVICE_ID,
          TEMPLATE_ID_FOR_ME,
          { ...fields, title, ...token },
          EMAILJS_OPTIONS
        );
      }
      form.reset();
      captcha.current?.reset();
      setStatus("contato.ok");
    } catch {
      setStatus("contato.fail");
    }
  }

  return (
    <div className="prose">
      <p>{t("contato.text")}</p>
      <Canais />
      <form className="form" onSubmit={sendEmail} noValidate>
        <label>
          {t("contato.name")}
          <input
            name="name"
            maxLength={80}
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
            maxLength={120}
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
            maxLength={2000}
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
        {captchaEnabled && (
          <ReCaptcha
            ref={captcha}
            siteKey={RECAPTCHA_CONFIG.SITE_KEY as string}
            theme={theme}
            language={i18n.language}
            onChange={handleCaptchaChange}
            onError={handleCaptchaError}
          />
        )}
        <input className="hp" name="site" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <button type="submit" className="button" disabled={status === "contato.sending"}>
          {status === "contato.sending" ? t("contato.sending") : t("contato.send")}
        </button>
        <p role="status">{status && t(status)}</p>
      </form>
    </div>
  );
};

export default Contato;
