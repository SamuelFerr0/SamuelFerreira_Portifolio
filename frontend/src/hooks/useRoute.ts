import { useCallback, useEffect, useState } from "react";
import { isSectionId, type SectionId } from "../data/formation";

function read(): SectionId | null {
  const value = window.location.hash.replace(/^#\/?/, "");
  return isSectionId(value) ? value : null;
}

export function useRoute() {
  const [route, setRoute] = useState<SectionId | null>(read);

  useEffect(() => {
    const onChange = () => setRoute(read());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const go = useCallback((id: SectionId | null) => {
    window.location.hash = id ? `/${id}` : "";
  }, []);

  return { route, go };
}
