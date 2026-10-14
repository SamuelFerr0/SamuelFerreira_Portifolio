// apiConfig.ts
// Endereço do back-end (Spring Boot). Vem de VITE_API_URL no build;
// sem essa variável, o site aponta para o servidor local.
const BASE_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

const API_CONFIG = {
  BASE_URL,
};

export default API_CONFIG;
