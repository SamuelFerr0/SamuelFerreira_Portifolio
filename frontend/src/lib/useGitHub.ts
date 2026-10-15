import { useApi } from "./api";

type Recurso = "perfil" | "linguagens" | "atividade";

export default function useGitHub<T>(recurso: Recurso) {
  return useApi<T>(`/api/github/${recurso}`);
}
