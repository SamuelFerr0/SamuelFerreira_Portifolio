import { useEffect, useState } from "react";
import API_CONFIG from "../config/apiConfig";

type State<T> = { path: string; data: T | null; error: boolean };

export function useApi<T>(path: string) {
  const [state, setState] = useState<State<T>>({ path: "", data: null, error: false });

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${API_CONFIG.BASE_URL}${path}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json() as Promise<T>;
      })
      .then((data) => setState({ path, data, error: false }))
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setState({ path, data: null, error: true });
      });

    return () => controller.abort();
  }, [path]);

  const settled = state.path === path;
  return {
    data: settled ? state.data : null,
    loading: !settled,
    error: settled && state.error,
  };
}
