import { useEffect, useRef } from "react";

export function useGlobalShortcut(toggle: () => void) {
  const toggleRef = useRef(toggle);
  toggleRef.current = toggle;

  useEffect(() => {
    (window as unknown as Record<string, unknown>).__toggleDictation = () => {
      toggleRef.current();
    };

    return () => {
      delete (window as unknown as Record<string, unknown>).__toggleDictation;
    };
  }, []);
}
