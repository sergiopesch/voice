import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { getConfig, getPlatformInfo } from "@/lib/tauri";
import { useGlobalShortcut } from "@/hooks/useGlobalShortcut";
import { useDictation } from "@/hooks/useDictation";

export function App() {
  const { setConfig, setPlatform, setError } = useStore();
  const { moveWindowOffScreen } = useDictation();
  useGlobalShortcut();

  useEffect(() => {
    async function init() {
      try {
        const [config, platform] = await Promise.all([
          getConfig(),
          getPlatformInfo(),
        ]);
        setConfig(config);
        setPlatform(platform);
        moveWindowOffScreen();
      } catch (err) {
        setError(
          `Failed to initialize: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
    init();
  }, [setConfig, setPlatform, setError, moveWindowOffScreen]);

  return null;
}
