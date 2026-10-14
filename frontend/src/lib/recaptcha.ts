import RECAPTCHA_CONFIG from "../config/recaptchaConfig";

export type Grecaptcha = {
  render: (container: HTMLElement, options: Record<string, unknown>) => number;
  reset: (widgetId?: number) => void;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
    __samuelRecaptchaOnload?: () => void;
  }
}

let loading: Promise<Grecaptcha> | null = null;

export function loadRecaptcha(language?: string): Promise<Grecaptcha> {
  if (window.grecaptcha?.render) return Promise.resolve(window.grecaptcha);
  if (loading) return loading;

  loading = new Promise<Grecaptcha>((resolve, reject) => {
    window.__samuelRecaptchaOnload = () => {
      delete window.__samuelRecaptchaOnload;
      resolve(window.grecaptcha as Grecaptcha);
    };

    const params = new URLSearchParams({
      onload: "__samuelRecaptchaOnload",
      render: "explicit",
      hl: language?.startsWith("en") ? "en" : "pt-BR",
    });
    const script = document.createElement("script");
    script.src = `${RECAPTCHA_CONFIG.SCRIPT_URL}?${params}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      loading = null;
      delete window.__samuelRecaptchaOnload;
      script.remove();
      reject(new Error("Não foi possível carregar o reCAPTCHA"));
    };
    document.head.appendChild(script);
  });

  return loading;
}
