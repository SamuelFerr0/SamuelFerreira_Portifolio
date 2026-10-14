const EMAILJS_CONFIG = {
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined,
  TEMPLATE_ID_FOR_ME: (import.meta.env.VITE_EMAILJS_TEMPLATE_ID_FOR_ME ||
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID) as string | undefined,
  TEMPLATE_ID_FOR_SENDER: import.meta.env.VITE_EMAILJS_TEMPLATE_ID_FOR_SENDER as string | undefined,
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined,
};

export default EMAILJS_CONFIG;
