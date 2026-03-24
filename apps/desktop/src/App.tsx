import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { getConfig, getPlatformInfo, getModelStatus } from "@/lib/tauri";
import { Overlay } from "@/components/Overlay";
import { ModelSetup } from "@/components/ModelSetup";
import { useGlobalShortcut } from "@/hooks/useGlobalShortcut";

export function App() {
  const { modelReady, setConfig, setPlatform, setModelReady, setError } =
    useStore();

  useGlobalShortcut();

  useEffect(() => {
    async function init() {
      try {
        const [config, platform, model] = await Promise.all([
          getConfig(),
          getPlatformInfo(),
          getModelStatus(),
        ]);
        setConfig(config);
        setPlatform(platform);
        setModelReady(model.downloaded);
      } catch (err) {
        setError(
          `Failed to initialize: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
    init();
  }, [setConfig, setPlatform, setModelReady, setError]);

  if (!modelReady) {
    return (
      <div className="h-screen bg-transparent">
        <ModelSetup onComplete={() => setModelReady(true)} />
      </div>
    );
  }

  return <Overlay />;
}
