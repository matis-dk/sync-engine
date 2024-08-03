import { LogTimeWithPayload } from "../log/log-service";
import IndexedDBService, { SyncRecord } from "../db/indexed-db-service";
import { ApiService } from "../api/api-service";
import { useStore } from "../store/store-service";

export class SyncEngine {
  @LogTimeWithPayload
  async sync_status() {
    const storeStatus = useStore.getState().getStatus();
    const apiStatus = await new ApiService().get_employees_status();
    return {
      store: storeStatus,
      api: {
        count: apiStatus.count,
        latestSyncedAt: apiStatus.data?.at(0)?.updated_at || null,
      },
    };
  }

  @LogTimeWithPayload
  async sync_to_now() {
    const syncedAt = new Date("2024").toISOString();

    const dbService = new IndexedDBService("db", "employees");
    const apiService = new ApiService();

    await dbService.openDB();

    for await (const result of apiService.get_employees_since_at(syncedAt)) {
      await dbService.bulkUpsertRecords(result.data);
    }
  }

  @LogTimeWithPayload
  async listener_start() {}

  @LogTimeWithPayload
  listener_stop() {}

  @LogTimeWithPayload
  listener_status() {}
}

const engine = new SyncEngine();
