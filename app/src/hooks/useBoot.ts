import { useEffect } from "react";
import { Mutation, useStore } from "../services/store/store-service";
import {
  dbMutationService,
  dbService,
} from "../services/db/indexed-db-service";
import { resultError, resultSuccess } from "../helpers/result";
import { log } from "@/services/log/log-service";

export function useBoot() {
  const { isBooted, setBooted, setEmployees, setMutations } = useStore();
  useEffect(() => {
    handleBoot();
  }, []);

  async function handleBoot() {
    log.useBoot.info("booting start");

    const dbResult = await dbService
      .openDB()
      .then(resultSuccess)
      .catch(resultError);

    const dbMutationResult = await dbMutationService
      .openDB()
      .then(resultSuccess)
      .catch(resultError);

    if (!dbResult.success || !dbMutationResult.success) {
      log.useBoot.error(
        "booting failed because it was unable to open db service",
        {
          dbResult,
          dbMutationResult,
        }
      );

      return;
    }

    const records = await dbService.getAllRecords();

    log.useBoot.info(`hydrating zustand with ${records.length} records`);
    setEmployees(records);

    const mutations = await dbMutationService.getAllRecords();

    log.useBoot.info(`hydrating zustand with ${mutations.length} mutations`);
    setMutations(mutations as Array<Mutation>);

    log.useBoot.info("booting done");
    setBooted(true);
  }

  return isBooted;
}
