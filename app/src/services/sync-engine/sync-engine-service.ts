import { LogTimeWithPayload } from "../log/log-service";
import { dbService, SyncRecord } from "../db/indexed-db-service";
import { useStore } from "../store/store-service";
import { RealtimeChannel } from "@supabase/supabase-js";
import { apiService } from "../api/api-service";

export type Status = {
  count: 0;
  latestSyncedAt: string | null;
};

class SyncEngine {
  private store = useStore.getState();
  private subscription = null as RealtimeChannel | null;

  constructor() {}

  @LogTimeWithPayload
  async sync_status() {
    const storeStatus = this.store.getStatus();
    const apiStatus = await apiService.get_employees_status();
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
    const status = await this.sync_status();
    const syncedAt =
      status.store.latestSyncedAt || new Date("1970").toISOString();

    console.log("syncedAt ====> ", syncedAt);

    for await (const result of apiService.get_employees_since_at(syncedAt)) {
      this.save_records(result.data);
    }
  }

  @LogTimeWithPayload
  async listener_start() {
    this.subscription = apiService
      .get_subscription()
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
        },
        (payload) => {
          console.log(payload);
          this.save_records([payload.new as SyncRecord]);
        }
      )
      .subscribe();
  }

  @LogTimeWithPayload
  listener_stop() {
    this.subscription?.unsubscribe();
    this.subscription = null;
  }

  @LogTimeWithPayload
  listener_status() {}

  @LogTimeWithPayload
  private async save_records(records: Array<SyncRecord>) {
    await dbService.bulkUpsertRecords(records);
    this.store.setEmployees(records);
  }
}

export const syncEngineService = new SyncEngine();
