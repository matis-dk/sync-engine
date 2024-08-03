import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { SyncRecord } from "../db/indexed-db-service";

type Store = {
  employees: Record<string, SyncRecord>;
  setEmployees: (records: Array<SyncRecord>) => void;
  getStatus: () => { count: number; latestSyncedAt: string | null };
  clearEmployees: () => void;
};

export const useStore = create<Store>()(
  devtools((set, get) => ({
    employees: {},
    clearEmployees: () =>
      set((state) => ({ employees: {} }), false, "clearEmployees"),
    getStatus: () => {
      const employees = Object.values(get().employees);
      return {
        count: employees.length,
        latestSyncedAt:
          employees
            .sort(
              (a, b) =>
                new Date(b.updated_at!).getTime() -
                new Date(a.updated_at!).getTime()
            )
            .at(0)?.updated_at || null,
      };
    },
    setEmployees: (records) =>
      set(
        (state) => ({
          employees: {
            ...state.employees,
            ...records.reduce<Record<string, SyncRecord>>((acc, i) => {
              acc[i.id] = i;
              return acc;
            }, {}),
          },
        }),
        false,
        "setEmployees"
      ),
  }))
);
