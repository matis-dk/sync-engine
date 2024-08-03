import { useEffect, useRef } from "react";
import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { useStore } from "../services/store/store-service";
import { syncEngineService } from "../services/sync-engine/sync-engine-service";
import { dbService } from "../services/db/indexed-db-service";

const btn =
  "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const refSyncEngineService = useRef(syncEngineService);
  const refDbService = useRef(dbService);

  const store = useStore();

  return (
    <div className="p-2 flex flex-col justify-start items-start gap-3">
      <h5>Zustand</h5>
      <p>employees: {Object.keys(store.employees).length}</p>
      <button
        className={btn}
        onClick={() => {
          console.log(
            "Object.keys(store.employees).length() ====> ",
            Object.keys(store.employees).length
          );
        }}
      >
        employees length
      </button>
      <button
        className={btn}
        onClick={() => {
          store.setEmployees([createRecord("1"), createRecord("2")]);
        }}
      >
        setEmployees
      </button>
      <button
        className={btn}
        onClick={() => {
          store.clearEmployees();
        }}
      >
        clearEmployees
      </button>
      <h5>IndexedDB</h5>
      <button
        className={btn}
        onClick={() => {
          printPromise(refDbService.current!.getAllRecords());
        }}
      >
        getAllRecords
      </button>
      <button
        className={btn}
        onClick={() => {
          printPromise(refDbService.current!.clearAllRecords());
        }}
      >
        clearAllRecords
      </button>
      <button
        className={btn}
        onClick={() => {
          refDbService.current!.addRecord(createRecord(`id-${Date.now()}`));
        }}
      >
        addRecord
      </button>
      <button
        className={btn}
        onClick={() => {
          refDbService.current!.bulkUpsertRecords([
            createRecord("id-1"),
            createRecord("id-2"),
          ]);
        }}
      >
        bulkUpsertRecords
      </button>
      <hr />
      <h5>SyncEngine</h5>
      <button
        className={btn}
        onClick={() => {
          printPromise(refSyncEngineService.current.sync_status());
        }}
      >
        sync_status
      </button>
      <button
        className={btn}
        onClick={() => {
          printPromise(refSyncEngineService.current.sync_to_now());
        }}
      >
        sync_to_now
      </button>
      <button
        className={btn}
        onClick={() => {
          refSyncEngineService.current.listener_start();
        }}
      >
        listener_start
      </button>
      <button
        className={btn}
        onClick={() => {
          refSyncEngineService.current.listener_stop();
        }}
      >
        listener_stop
      </button>
      <button
        className={btn}
        onClick={() => {
          refSyncEngineService.current.listener_status();
        }}
      >
        listener_status
      </button>
    </div>
  );
}

const createRecord = (id?: string) => ({
  id: `id-${id}`,
  created_at: "",
  deleted_at: null,
  updated_at: null,
});

const printPromise = <T,>(p: Promise<T>) => {
  return p
    .then((res) => {
      console.log("res ====> ", res);
    })
    .catch((err) => {
      console.log("err ====> ", err);
    });
};
