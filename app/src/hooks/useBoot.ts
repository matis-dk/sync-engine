import { useEffect } from "react";
import { Mutation, useStore } from "../services/store/store-service";
import {
  dbMutationService,
  dbService,
} from "../services/db/indexed-db-service";
import { resultError, resultSuccess } from "../helpers/result";

export function useBoot() {
  const { isBooted, setBooted, setEmployees, setMutations } = useStore();
  useEffect(() => {
    handleBoot();
  }, []);

  async function handleBoot() {
    console.info("useBoot: booting start");

    const dbResult = await dbService
      .openDB()
      .then(resultSuccess)
      .catch(resultError);

    const dbMutationResult = await dbMutationService
      .openDB()
      .then(resultSuccess)
      .catch(resultError);

    if (!dbResult.success || !dbMutationResult.success) {
      console.info(
        "useBoot: booting failed because it was unable to open db service"
      );
      console.error({
        dbResult,
        dbMutationResult,
      });
      return;
    }

    const records = await dbService.getAllRecords();

    console.info(`useBoot: hydrating zustand with ${records.length} records`);
    setEmployees(records);

    const mutations = await dbMutationService.getAllRecords();

    console.info(
      `useBoot: hydrating zustand with ${mutations.length} mutations`
    );
    setMutations(mutations as Array<Mutation>);

    console.info("useBoot: booting done");
    setBooted(true);
  }

  return isBooted;
}
