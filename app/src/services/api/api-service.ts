import { stat } from "fs";
import { LogTimeWithPayload } from "../log/log-service";
import { createClient } from "@supabase/supabase-js";
import { SyncRecord } from "../db/indexed-db-service";

const supabaseUrl = "https://bacqiesjoqdkxvluwdel.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhY3FpZXNqb3Fka3h2bHV3ZGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI0Njc1MzcsImV4cCI6MjAzODA0MzUzN30.Ysb8cmpJKKnQv_W6g4MvYUaLxrUvGCZTqmBwsBzjoLw";
const supabase = createClient(supabaseUrl, supabaseKey);

const channelA = supabase
  .channel("schema-db-changes")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
    },
    (payload) => console.log(payload)
  )
  .subscribe();

type IsoString = string;

class ApiService {
  constructor() {
    console.log("ApiService: creating instance");
  }

  @LogTimeWithPayload
  async get_employees_status() {
    return supabase
      .from("employees")
      .select("*", { count: "exact" })
      .order("updated_at", { ascending: false })
      .limit(1);
  }

  async *get_employees_since_at(sinceAt: IsoString) {
    let fetched = 0;

    while (true) {
      const size = 99;
      const from = fetched;
      const to = from + size;
      fetched = to + 1;

      console.log(" ====> ", { from, to });
      const res = await supabase
        .from("employees")
        .select("*", { count: "exact" })
        .gt("updated_at", sinceAt)
        .order("updated_at", { ascending: true })
        .order("id", { ascending: true })
        .range(from, to);

      if (res.error) {
        console.info("get_employees_since_at: error");
        return res;
      }
      if (res.data.length === 0) {
        console.info("get_employees_since_at: data.length is 0");
        return;
      }

      yield res;

      if (res.count! <= to) {
        console.info("get_employees_since_at: last items is fetched");
        console.log("res ====> ", res.data);
        return;
      }
    }
  }

  get_subscription() {
    return supabase.channel("schema-db-changes");
  }
}

export const apiService = new ApiService();
