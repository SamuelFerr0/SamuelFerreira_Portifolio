import { useCallback, useState } from "react";

export function useSkin<T extends string>(storageKey: string, skins: readonly T[], fallback: T) {
  const [skin, setSkinState] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return skins.find((name) => name === saved) ?? fallback;
    } catch {
      return fallback;
    }
  });

  const setSkin = useCallback(
    (next: T) => {
      setSkinState(next);
      try {
        localStorage.setItem(storageKey, next);
      } catch {
        return;
      }
    },
    [storageKey]
  );

  return [skin, setSkin] as const;
}
