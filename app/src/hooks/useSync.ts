import { useEffect, useRef, useState } from "react";
import { useStore } from "../services/store/store-service";
import useOnlineStatus from "./useOnlineStatus";
import usePageVisibility from "./usePageVisibility";
import { syncEngineService } from "../services/sync-engine/sync-engine-service";
import { stat } from "fs";
import { log } from "@/services/log/log-service";

export function useSync() {
  const store = useStore();

  const isBooted = store.isBooted;
  const isOnline = useOnlineStatus();
  const isPageVisibile = usePageVisibility();

  const [isSynced, setSynced] = useState(false);

  useEffect(() => {
    if (!isBooted) {
      log.useSync.info("application is booted yet");
      return;
    }

    if (!isOnline) {
      log.useSync.info("user isn't online");
      syncEngineService.listener_stop();
      setSynced(false);
      return;
    }

    if (!isPageVisibile) {
      log.useSync.info("user tab isn't in focus");
      syncEngineService.listener_stop();
      setSynced(false);
      return;
    }

    handleSync();
  }, [isBooted, isOnline, isPageVisibile]);

  async function handleSync() {
    const result = await syncEngineService.sync_to_now();

    syncEngineService.listener_start();
    setSynced(true);
  }

  return isSynced;
}
