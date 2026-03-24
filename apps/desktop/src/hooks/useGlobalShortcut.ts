import { useEffect, useRef } from "react";
import { register, unregister } from "@tauri-apps/plugin-global-shortcut";
import { useStore } from "@/store/useStore";
import { useDictation } from "@/hooks/useDictation";

const DEFAULT_SHORTCUT = "CommandOrControl+Shift+Space";

export function useGlobalShortcut() {
  const { config } = useStore();
  const { toggle } = useDictation();
  const toggleRef = useRef(toggle);
  toggleRef.current = toggle;

  const shortcut = config?.hotkey
    ? convertHotkeyToTauriFormat(config.hotkey)
    : DEFAULT_SHORTCUT;

  useEffect(() => {
    let registered = false;

    async function setup() {
      try {
        await register(shortcut, (event) => {
          if (event.state === "Pressed") {
            toggleRef.current();
          }
        });
        registered = true;
        console.log(`Global shortcut registered: ${shortcut}`);
      } catch (err) {
        console.error("Failed to register global shortcut:", err);
      }
    }

    setup();

    return () => {
      if (registered) {
        unregister(shortcut).catch(console.error);
      }
    };
  }, [shortcut]);
}

function convertHotkeyToTauriFormat(hotkey: string): string {
  return hotkey
    .replace("Super", "CommandOrControl")
    .replace("Cmd", "CommandOrControl")
    .replace("Command", "CommandOrControl")
    .replace("Ctrl", "CommandOrControl")
    .replace("+", "+");
}
