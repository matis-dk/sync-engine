import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { SyncRecord } from "../db/indexed-db-service";

type EmployeesRecord = SyncRecord & {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  updated_at: string;
  deleted_at: string | null;
};

type Store = {
  isBooted: boolean;
  setBooted: (isBooted: boolean) => void;
  employees: Record<string, EmployeesRecord>;
  setEmployees: (records: Array<SyncRecord>) => void;
  getStatus: () => { count: number; latestSyncedAt: string | null };
  clearEmployees: () => void;
};

export const useStore = create<Store>()(
  devtools((set, get) => ({
    isBooted: false,
    setBooted: (isBooted) => set((state) => ({ isBooted }), false, "setBooted"),
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
            ...records.reduce<Record<string, EmployeesRecord>>((acc, i) => {
              acc[i.id] = i as EmployeesRecord;
              return acc;
            }, {}),
          },
        }),
        false,
        "setEmployees"
      ),
  }))
);
