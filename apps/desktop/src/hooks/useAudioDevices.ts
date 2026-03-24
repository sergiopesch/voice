import { useCallback, useEffect } from "react";
import { useStore } from "@/store/useStore";
import type { AudioDevice } from "@/types";

export function useAudioDevices() {
  const { audioDevices, selectedDeviceId, setAudioDevices, setSelectedDevice, setError } =
    useStore();

  const enumerate = useCallback(async () => {
    try {
      // Request mic permission first to get labels
      await navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        stream.getTracks().forEach((t) => t.stop());
      });

      const devices = await navigator.mediaDevices.enumerateDevices();
      const mics: AudioDevice[] = devices
        .filter((d) => d.kind === "audioinput")
        .map((d) => ({
          deviceId: d.deviceId,
          label: d.label || `Microphone ${d.deviceId.slice(0, 8)}`,
        }));

      setAudioDevices(mics);

      // Auto-select first device if none selected
      if (!selectedDeviceId && mics.length > 0) {
        setSelectedDevice(mics[0]!.deviceId);
      }
    } catch (err) {
      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError") {
          setError("Microphone access denied. Check your system permissions.");
        } else if (err.name === "NotFoundError") {
          setError("No microphone found. Connect a microphone and try again.");
        } else {
          setError(`Microphone error: ${err.message}`);
        }
      }
    }
  }, [selectedDeviceId, setAudioDevices, setSelectedDevice, setError]);

  useEffect(() => {
    enumerate();

    const handler = () => enumerate();
    navigator.mediaDevices.addEventListener("devicechange", handler);
    return () => navigator.mediaDevices.removeEventListener("devicechange", handler);
  }, [enumerate]);

  return { audioDevices, selectedDeviceId, setSelectedDevice, refresh: enumerate };
}
