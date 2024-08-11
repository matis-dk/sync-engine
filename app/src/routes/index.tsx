import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "../services/store/store-service";
import { syncEngineService } from "../services/sync-engine/sync-engine-service";
import { dbService } from "../services/db/indexed-db-service";
import { Button } from "@/components/ui/button";
import { apiService, supabase } from "@/services/api/api-service";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const store = useStore();
  return (
    <div className="p-4 flex gap-8">
      <Card>
        <h5>Zustand</h5>
        <Button
          variant="outline"
          onClick={() => {
            console.log(store);
          }}
        >
          store
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            console.log(
              "Object.keys(store.employees).length() ====> ",
              Object.keys(store.employees).length
            );
          }}
        >
          employees length
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            store.setEmployees([createRecord("1"), createRecord("2")]);
          }}
        >
          setEmployees
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            store.clearEmployees();
          }}
        >
          clearEmployees
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            console.log("store.mutations ====> ", store.mutations);
          }}
        >
          mutations
        </Button>
      </Card>
      <Card>
        <h5>IndexedDB</h5>
        <Button
          variant="outline"
          onClick={() => {
            dbService.getAllRecords();
          }}
        >
          getAllRecords
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            dbService.clearAllRecords();
          }}
        >
          clearAllRecords
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            dbService.addRecord(createRecord(`id-${Date.now()}`));
          }}
        >
          addRecord
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            dbService.bulkUpsertRecords([
              createRecord("id-1"),
              createRecord("id-2"),
            ]);
          }}
        >
          bulkUpsertRecords
        </Button>
      </Card>

      <Card>
        <h5>SyncEngine</h5>
        <Button
          variant="outline"
          onClick={() => {
            syncEngineService.sync_status();
          }}
        >
          sync_status
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            syncEngineService.sync_remote_to_client();
          }}
        >
          sync_remote_to_client
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            syncEngineService.sync_client_to_remote();
          }}
        >
          sync_client_to_remote
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            syncEngineService.listener_stop();
          }}
        >
          listener_stop
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            apiService.upsert_employee({
              id: "e7b65897-bce8-4933-9e5b-9660ddfce1f7",
              first_name: "Maaatis",
              last_name: "m",
              email: "m@opacity.dk",
              phone_number: "1234",
              hire_date: new Date().toISOString(),
              updated_at: "2024-08-10T18:19:17.047Z",
              deleted_at: null,
            });
          }}
        >
          apiService upsert
        </Button>
      </Card>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-2">{children}</div>;
}

const createRecord = (id?: string) => ({
  id: `id-${id}`,
  created_at: "",
  deleted_at: null,
  updated_at: null,
});
