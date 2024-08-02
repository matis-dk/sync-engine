import { DBSchema, openDB, IDBPDatabase } from "idb";
import { LogTimeWithPayload } from "../log/log-service";

export type Record<T = object> = T & {
  id: string;
  created_at: string; // ISO string for creation timestamp
  updated_at: string | null; // ISO string for update timestamp
  deleted_at: string | null; // ISO string for deletion timestamp (optional)
};

type MyDbSchema = {
  employees: {
    key: string;
    value: Record;
  };
};
type MyDB = DBSchema & MyDbSchema;

class IndexedDBService {
  private dbName: string;
  private storeName: keyof MyDbSchema;
  private db: IDBPDatabase<MyDB> | null = null;

  constructor(dbName: string, storeName: keyof MyDbSchema) {
    console.log("IndexedDBService: creating instance");
    this.dbName = dbName;
    this.storeName = storeName;
  }

  @LogTimeWithPayload
  async openDB() {
    const storeName = this.storeName;
    this.db = await openDB<MyDB>(this.dbName, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: "id" });
        }
      },
    });
  }

  @LogTimeWithPayload
  async addRecord(record: Record): Promise<void> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    await this.db.add(this.storeName, record);
  }

  @LogTimeWithPayload
  async updateRecord(record: Record): Promise<void> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    await this.db.put(this.storeName, record);
  }

  @LogTimeWithPayload
  async deleteRecord(id: string): Promise<void> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    await this.db.delete(this.storeName, id);
  }

  @LogTimeWithPayload
  async getRecord(id: string): Promise<Record | undefined> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    return await this.db.get(this.storeName, id);
  }
  @LogTimeWithPayload
  async getAllRecords(): Promise<Record[]> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    return await this.db.getAll(this.storeName);
  }
}

export default IndexedDBService;
