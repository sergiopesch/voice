import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { getConfig, getPlatformInfo } from "@/lib/tauri";
import { MainView } from "@/components/MainView";
import { SettingsView } from "@/components/SettingsView";

export function App() {
  const { view, setConfig, setPlatform, setError } = useStore();

  useEffect(() => {
    async function init() {
      try {
        const [config, platform] = await Promise.all([
          getConfig(),
          getPlatformInfo(),
        ]);
        setConfig(config);
        setPlatform(platform);
      } catch (err) {
        setError(
          `Failed to initialize: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
    init();
  }, [setConfig, setPlatform, setError]);

  return (
    <div className="flex flex-col h-screen bg-[var(--color-bg)]">
      {view === "main" ? <MainView /> : <SettingsView />}
    </div>
  );
}
