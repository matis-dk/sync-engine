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
      log.useSync.info("application isn't booted yet");
      handleSyncStop();
      return;
    }

    if (!isOnline) {
      log.useSync.info("user isn't online");
      handleSyncStop();
      return;
    }

    if (!isPageVisibile) {
      log.useSync.info("user tab isn't in focus");
      syncEngineService.listener_stop();
      setSynced(false);
      return;
    }

    log.useSync.info("handleSyncStart");
    handleSyncStart();

    return () => {
      log.useSync.info("handleSyncStop");
      handleSyncStop();
    };
  }, [isBooted, isOnline, isPageVisibile]);

  function handleSyncStop() {
    syncEngineService.listener_stop();
    setSynced(false);
  }

  async function handleSyncStart() {
    await syncEngineService.sync_remote_to_client();

    syncEngineService.listener_start();
    setSynced(true);
  }

  return isSynced;
}
