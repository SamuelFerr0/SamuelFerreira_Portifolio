import EMAILJS_CONFIG from "../config/emailJsConfig";

const { SERVICE_ID, TEMPLATE_ID_FOR_ME, TEMPLATE_ID_FOR_SENDER, PUBLIC_KEY } = EMAILJS_CONFIG;
const EMAILJS_OPTIONS = { publicKey: PUBLIC_KEY, blockHeadless: true };

export const emailJsEnabled = Boolean(SERVICE_ID && TEMPLATE_ID_FOR_ME && PUBLIC_KEY);

type Message = {
  name: string;
  email: string;
  message: string;
  language: string;
  confirmationTitle: string;
  captchaToken: string | null;
};

export async function sendEmail({ name, email, message, language, confirmationTitle, captchaToken }: Message) {
  if (!SERVICE_ID || !TEMPLATE_ID_FOR_ME) throw new Error("EmailJS não configurado");

  const { default: emailjs } = await import("@emailjs/browser");
  const fields = { name, email, message, time: new Date().toLocaleString(language) };
  const title = `Nova mensagem do portfólio de: ${name}`;
  const token = captchaToken ? { "g-recaptcha-response": captchaToken } : {};

  if (TEMPLATE_ID_FOR_SENDER) {
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID_FOR_SENDER,
      { ...fields, title: confirmationTitle, ...token },
      EMAILJS_OPTIONS
    );
    await emailjs.send(SERVICE_ID, TEMPLATE_ID_FOR_ME, { ...fields, title }, EMAILJS_OPTIONS);
  } else {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID_FOR_ME, { ...fields, title, ...token }, EMAILJS_OPTIONS);
  }
}
