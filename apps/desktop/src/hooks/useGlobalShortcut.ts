import { useEffect, useRef } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

const TOGGLE_EVENT = "voice:toggle-dictation";

export function useGlobalShortcut(toggle: () => void) {
  const toggleRef = useRef(toggle);
  toggleRef.current = toggle;

  useEffect(() => {
    let unlisten: (() => void) | null = null;
    let disposed = false;

    void getCurrentWindow()
      .listen(TOGGLE_EVENT, () => {
        toggleRef.current();
      })
      .then((cleanup) => {
        if (disposed) {
          cleanup();
          return;
        }

        unlisten = cleanup;
      })
      .catch((error) => {
        console.warn("Failed to register dictation toggle listener:", error);
      });

    return () => {
      disposed = true;
      if (unlisten) {
        unlisten();
      }
    };
  }, []);
}
