import { DBSchema, openDB, IDBPDatabase } from "idb";
import { log, LogTimeWithPayload } from "../log/log-service";

const VERSION = 5;

export type SyncRecord<T = object> = T & {
  id: string;
};

type MyDbSchema = {
  employees: {
    key: string;
    value: SyncRecord;
  };
  mutations: {
    key: string;
    value: SyncRecord;
  };
};
type MyDB = DBSchema & MyDbSchema;

const stores = ["employees", "mutations"] as const;

class IndexedDBService {
  private dbName: string;
  private storeName: keyof MyDbSchema;
  private db: IDBPDatabase<MyDB> | null = null;
  private logger = log.common.getSubLogger({ name: "[IndexedDBService]" });

  constructor(dbName: string, storeName: keyof MyDbSchema) {
    this.logger.info("creating instance");
    this.dbName = dbName;
    this.storeName = storeName;
  }

  @LogTimeWithPayload
  async openDB() {
    this.db = await openDB<MyDB>(this.dbName, VERSION, {
      upgrade(db) {
        stores.forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: "id" });
          }
        });
      },
    });
  }

  @LogTimeWithPayload
  async addRecord(record: SyncRecord): Promise<void> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    await this.db.add(this.storeName, record);
  }

  @LogTimeWithPayload
  async upsertRecord(record: SyncRecord): Promise<void> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    await this.db.put(this.storeName, record);
  }

  @LogTimeWithPayload
  async bulkUpsertRecords(records: SyncRecord[]): Promise<void> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    const transaction = this.db.transaction(this.storeName, "readwrite");
    const store = transaction.objectStore(this.storeName);
    for (const record of records) {
      store.put(record);
    }
    await transaction.done;
  }

  @LogTimeWithPayload
  async deleteRecord(id: string): Promise<void> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    await this.db.delete(this.storeName, id);
  }

  @LogTimeWithPayload
  async bulkDeleteRecords(ids: string[]): Promise<void> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    const transaction = this.db.transaction(this.storeName, "readwrite");
    const store = transaction.objectStore(this.storeName);
    for (const id of ids) {
      store.delete(id);
    }
    await transaction.done;
  }

  @LogTimeWithPayload
  async getRecord(id: string): Promise<SyncRecord | undefined> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    return await this.db.get(this.storeName, id);
  }

  @LogTimeWithPayload
  async getAllRecords(): Promise<SyncRecord[]> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    return await this.db.getAll(this.storeName);
  }

  @LogTimeWithPayload
  async clearAllRecords(): Promise<void> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    const transaction = this.db.transaction(this.storeName, "readwrite");
    const store = transaction.objectStore(this.storeName);
    await store.clear();
    await transaction.done;
  }
}

export const dbService = new IndexedDBService("db", "employees");
export const dbMutationService = new IndexedDBService("db", "mutations");
