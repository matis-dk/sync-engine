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

  constructor() {
    console.log("🔃 SyncEngine: creating instance");
  }

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

    if (status.api.count === 0) {
      console.info("sync_to_now: api doesn't have any records");
      return;
    }

    if (status.api.latestSyncedAt === status.store.latestSyncedAt) {
      console.info("sync_to_now: sync is up-to-date");
      return;
    }

    const syncedAt =
      status.store.latestSyncedAt || new Date("1970").toISOString();

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
          console.log("listener_start: ", payload);
          this.save_records([payload.new as SyncRecord]);
        }
      )
      .subscribe((status, err) => {
        console.log(" ====> ", { status, err });
      });
  }

  @LogTimeWithPayload
  listener_stop() {
    this.subscription?.unsubscribe();
    this.subscription = null;
  }

  @LogTimeWithPayload
  private async save_records(records: Array<SyncRecord>) {
    await dbService.bulkUpsertRecords(records);
    this.store.setEmployees(records);
  }
}

export const syncEngineService = new SyncEngine();
