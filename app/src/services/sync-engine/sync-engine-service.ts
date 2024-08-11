import { log, LogTimeWithPayload } from "../log/log-service";
import {
  dbMutationService,
  dbService,
  SyncRecord,
} from "../db/indexed-db-service";
import { Mutation, useStore } from "../store/store-service";
import {
  REALTIME_CHANNEL_STATES,
  RealtimeChannel,
} from "@supabase/supabase-js";
import { apiService, supabase } from "../api/api-service";
import { defaultEmployee } from "@/routes/employees/$employee-id";

export type Status = {
  count: 0;
  latestSyncedAt: string | null;
};

class SyncEngine {
  private logger = log.common.getSubLogger({ name: "[SyncEngine]" });

  private store = useStore.getState();
  private subscription = null as RealtimeChannel | null;

  constructor() {
    this.logger.info("creating instance");
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
  async sync_remote_to_client() {
    this.logger.info("sync_remote_to_client");

    const status = await this.sync_status();

    if (status.api.count === 0) {
      this.logger.info("sync_remote_to_client: api doesn't have any records");
      return;
    }

    if (status.api.latestSyncedAt === status.store.latestSyncedAt) {
      this.logger.info("sync_remote_to_client: sync is up-to-date");
      return;
    }

    const syncedAt =
      status.store.latestSyncedAt || new Date("1970").toISOString();

    for await (const result of apiService.get_employees_since_at(syncedAt)) {
      this.save_records(
        result.data.map((i) => ({
          ...i,
          updated_at: i.updated_at
            ? new Date(i.updated_at).toISOString()
            : null,
        }))
      );
    }
  }

  @LogTimeWithPayload
  async sync_client_to_remote() {
    this.logger.info("sync_client_to_remote");

    const mutations = await dbMutationService
      .getAllRecords()
      .then((res) =>
        (res as Array<Mutation>).sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
      );

    if (mutations.length === 0) {
      this.logger.info("sync_client_to_remote: 0 mutations to sync");
      return;
    }

    for await (const mutation of mutations) {
      const result = await apiService.upsert_employee({
        ...defaultEmployee(),
        ...mutation.payload,
      });

      if (result.error) {
        this.logger.info("sync_client_to_remote: failed to upsert mutation");
      } else {
        this.logger.info(
          `sync_client_to_remote: successfully upserted mutation: ${mutation.id}`
        );
      }

      await dbMutationService.deleteRecord(mutation.id);
      this.store.deleteMutation(mutation.id);
    }
  }

  @LogTimeWithPayload
  async listener_start() {
    const channel = apiService.get_subscription_channel((payload) => {
      this.logger.info("listener_start: ", payload);
      this.save_records([payload.new as SyncRecord]);
    });

    if (channel.state === REALTIME_CHANNEL_STATES.joined) {
      this.logger.warn("channel state isn't joined: ", channel.state);
    }

    this.subscription = channel.subscribe();
  }

  @LogTimeWithPayload
  listener_stop() {
    this.subscription?.unsubscribe();
  }

  @LogTimeWithPayload
  private async save_records(records: Array<SyncRecord>) {
    await dbService.bulkUpsertRecords(records);
    this.store.setEmployees(records);
  }
}

export const syncEngineService = new SyncEngine();
