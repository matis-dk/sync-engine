import { useEffect, useRef } from "react";
import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import IndexedDBService from "../services/db/service-indexed-db";

const btn =
  "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const refIdb = useRef<IndexedDBService | null>(null);

  useEffect(() => {
    const instance = new IndexedDBService("db", "employees");
    instance.openDB().then((res) => {
      refIdb.current = instance;
    });
  }, []);

  return (
    <div className="p-2 flex flex-col justify-start items-start gap-3">
      <h5>IDB</h5>
      <button
        className={btn}
        onClick={() => {
          refIdb.current!.getAllRecords().then((res) => {
            console.log("res ====> ", res);
          });
        }}
      >
        getAllRecords
      </button>
      <button
        className={btn}
        onClick={() => {
          refIdb.current!.addRecord({
            id: `id-${Date.now()}`,
            created_at: "",
            deleted_at: null,
            updated_at: null,
          });
        }}
      >
        addRecord
      </button>

      <hr />
    </div>
  );
}
