import { create } from "zustand";
import { devtools } from "zustand/middleware";
import computed from "zustand-computed";

import { SyncRecord } from "../db/indexed-db-service";

type IsoString = string;
type Json = string;

export type EmployeesRecord = SyncRecord & {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  updated_at: string;
  deleted_at: string | null;
};

export type EmployeeRecordPartial = Partial<EmployeesRecord> &
  Pick<EmployeesRecord, "id" | "updated_at">;

type EmployeesMap = Record<string, EmployeesRecord>;

type Store = {
  isBooted: boolean;
  setBooted: (isBooted: boolean) => void;
  getStatus: () => { count: number; latestSyncedAt: string | null };
  employees: EmployeesMap;
  setEmployees: (records: Array<SyncRecord>) => void;
  clearEmployees: () => void;
  mutations: Array<Mutation>;
  addMutation: (record: Mutation) => void;
  setMutations: (records: Array<Mutation>) => void;
};

type ComputedStore = {
  countSq: number;
  computedEmployees: EmployeesMap;
};

export type Mutation = {
  id: string;
  created_at: IsoString;
  table: "employees";
  payload: EmployeeRecordPartial;
};

const computeState = (state: Store): ComputedStore & Partial<Store> => ({
  countSq: 1,
  computedEmployees: applyMutations(state.employees, state.mutations),
});

export const useStore = create<Store>()(
  devtools(
    computed((set, get) => {
      return {
        isBooted: false,
        setBooted: (isBooted) =>
          set((state) => ({ isBooted }), false, "setBooted"),
        mutations: [],
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
        addMutation: (record: Mutation) =>
          set((state) => ({ mutations: [...state.mutations, record] })),
        setMutations: (records) => set((state) => ({ mutations: records })),
      };
    }, computeState)
  )
);

function applyMutations(employees: EmployeesMap, mutations: Array<Mutation>) {
  if (!mutations) {
    console.log("👹 Mutation: no mutation so exiting");
    return employees;
  }
  mutations
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .forEach((mutation) => {
      console.log("👹 Mutation: ", mutation);
      const mutationId = mutation.payload.id;

      if (!mutationId) {
        console.log("👹 Mutation: missing id ====> ", mutation);
        return;
      }

      if (employees[mutationId]) {
        console.log("👹 Mutation: updated id ====> ", mutationId);
        employees[mutationId] = {
          ...employees[mutationId],
          ...mutation.payload,
        };
      } else {
        console.log("👹 Mutation: added id ====> ", mutation.payload.id);
        employees[mutationId] = mutation.payload as any;
      }
    });
  return employees;
}

export function diff<T extends EmployeeRecordPartial>(
  obj1: any,
  obj2: any
): EmployeeRecordPartial {
  if (!obj1) return obj2;

  const record = {} as any;

  Object.keys(obj2).forEach((key) => {
    if (obj1[key] !== obj2[key]) {
      record[key] = obj2[key];
    }
  });

  return record;
}
