import { useEffect, useRef } from "react";
import { useStore } from "../services/store/store-service";
import useOnlineStatus from "./useOnlineStatus";
import usePageVisibility from "./usePageVisibility";
import { syncEngineService } from "../services/sync-engine/sync-engine-service";
import { stat } from "fs";

export function useSync() {
  const store = useStore();

  const isBooted = store.isBooted;
  const isOnline = useOnlineStatus();
  const isPageVisibile = usePageVisibility();

  useEffect(() => {
    if (!isBooted) {
      console.info("useSync: application is booted yet");
      return;
    }

    if (!isOnline) {
      console.info("useSync: user isn't online");
      syncEngineService.listener_stop();
      return;
    }

    if (!isPageVisibile) {
      console.info("useSync: user tab isn't in focus");
      syncEngineService.listener_stop();
      return;
    }

    handleSync();
  }, [isBooted, isOnline, isPageVisibile]);

  async function handleSync() {
    const result = await syncEngineService.sync_to_now();

    syncEngineService.listener_start();
  }

  return null;
}
