import { useEffect } from "react";
import { useStore } from "../services/store/store-service";
import { dbService } from "../services/db/indexed-db-service";
import { resultError, resultSuccess } from "../helpers/result";

export function useBoot() {
  const { isBooted, setBooted, setEmployees } = useStore();
  useEffect(() => {
    handleBoot();
  }, []);

  async function handleBoot() {
    console.info("useBoot: booting start");

    const result = await dbService
      .openDB()
      .then(resultSuccess)
      .catch(resultError);

    if (!result.success) {
      console.info(
        "useBoot: booting failed because it was unable to open db service"
      );
      console.error(result.error);
      return;
    }

    const records = await dbService.getAllRecords();

    console.info(`useBoot: hydrating zustand with ${records.length} records`);
    setEmployees(records);

    console.info("useBoot: booting done");
    setBooted(true);
  }

  return isBooted;
}
