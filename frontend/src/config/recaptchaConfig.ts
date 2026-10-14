const RECAPTCHA_CONFIG = {
  SITE_KEY: import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined,
  SCRIPT_URL: "https://www.google.com/recaptcha/api.js",
  COMPACT_BELOW: 480,
};

export default RECAPTCHA_CONFIG;
