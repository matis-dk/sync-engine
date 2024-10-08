import { log, LogTimeWithPayload } from "../log/log-service";
import {
  createClient,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import { EmployeeRecordPartial, EmployeesRecord } from "../store/store-service";
import { default as dayjs } from "dayjs";

const supabaseUrl = "https://bacqiesjoqdkxvluwdel.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhY3FpZXNqb3Fka3h2bHV3ZGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI0Njc1MzcsImV4cCI6MjAzODA0MzUzN30.Ysb8cmpJKKnQv_W6g4MvYUaLxrUvGCZTqmBwsBzjoLw";
export const supabase = createClient(supabaseUrl, supabaseKey);

type IsoString = string;

class ApiService {
  private logger = log.common.getSubLogger({ name: "[ApiService]" });

  constructor() {
    this.logger.info("creating instance");
  }

  @LogTimeWithPayload
  async get_employees_status() {
    return supabase
      .from("employees")
      .select("*", { count: "exact" })
      .order("updated_at", { ascending: false })
      .limit(1);
  }

  @LogTimeWithPayload
  async update_employee(record: EmployeeRecordPartial) {
    return supabase.from("employees").update(record).eq("id", record.id);
  }

  @LogTimeWithPayload
  async upsert_employee(record: EmployeesRecord) {
    return supabase.from("employees").upsert(record, { onConflict: "id" });
  }

  async *get_employees_since_at(sinceAt: IsoString) {
    let fetched = 0;

    while (true) {
      const size = 99;
      const from = fetched;
      const to = from + size;
      fetched = to + 1;

      const res = await supabase
        .from("employees")
        .select("*", { count: "exact" })
        .gt("updated_at", sinceAt)
        .order("updated_at", { ascending: true })
        .order("id", { ascending: true })
        .range(from, to);

      if (res.error) {
        this.logger.error("get_employees_since_at: error");
        return res;
      }
      if (res.data.length === 0) {
        this.logger.info("get_employees_since_at: data.length is 0");
        return;
      }

      yield res;

      if (res.count! <= to) {
        this.logger.info("get_employees_since_at: last items is fetched");
        return;
      }
    }
  }

  get_subscription_channel(
    fn: (
      payload: RealtimePostgresChangesPayload<{
        [key: string]: any;
      }>
    ) => void
  ) {
    return supabase.channel("db-channel-2").on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
      },
      fn
    );
  }
}

export const apiService = new ApiService();
