import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import RECAPTCHA_CONFIG from "../config/recaptchaConfig";
import { loadRecaptcha } from "../lib/recaptcha";

export type ReCaptchaHandle = { reset: () => void };

type Props = {
  siteKey: string;
  theme: "dark" | "light";
  language: string;
  onChange: (token: string | null) => void;
  onError?: () => void;
  ref?: Ref<ReCaptchaHandle>;
};

export default function ReCaptcha({ siteKey, theme, language, onChange, onError, ref }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);
  const onChangeRef = useRef(onChange);
  const onErrorRef = useRef(onError);
  const languageRef = useRef(language);

  useEffect(() => {
    onChangeRef.current = onChange;
    onErrorRef.current = onError;
  });

  useImperativeHandle(
    ref,
    () => ({
      reset() {
        if (widgetId.current !== null) window.grecaptcha?.reset(widgetId.current);
        onChangeRef.current(null);
      },
    }),
    []
  );

  useEffect(() => {
    let cancelled = false;
    const slot = document.createElement("div");
    container.current?.appendChild(slot);

    loadRecaptcha(languageRef.current)
      .then((grecaptcha) => {
        if (cancelled) return;
        widgetId.current = grecaptcha.render(slot, {
          sitekey: siteKey,
          theme,
          size: window.innerWidth < RECAPTCHA_CONFIG.COMPACT_BELOW ? "compact" : "normal",
          callback: (token: string) => onChangeRef.current(token),
          "expired-callback": () => onChangeRef.current(null),
          "error-callback": () => onChangeRef.current(null),
        });
      })
      .catch(() => {
        if (!cancelled) onErrorRef.current?.();
      });

    return () => {
      cancelled = true;
      widgetId.current = null;
      slot.remove();
      onChangeRef.current(null);
    };
  }, [siteKey, theme]);

  return <div ref={container} className="contato-captcha" />;
}
