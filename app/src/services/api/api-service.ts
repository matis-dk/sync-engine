import { stat } from "fs";
import { LogTimeWithPayload } from "../log/log-service";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bacqiesjoqdkxvluwdel.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhY3FpZXNqb3Fka3h2bHV3ZGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI0Njc1MzcsImV4cCI6MjAzODA0MzUzN30.Ysb8cmpJKKnQv_W6g4MvYUaLxrUvGCZTqmBwsBzjoLw";
const supabase = createClient(supabaseUrl, supabaseKey);

type IsoString = string;

export class ApiService {
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
    const status = await this.get_employees_status();
    if (status.error || !status.count) return status;

    let fetched = 0;

    while (status.count > fetched) {
      const paginate = 100;
      const from = fetched;
      const to = from + paginate;

      const res = await supabase
        .from("employees")
        .select("*", { count: "exact" })
        .gte("updated_at", sinceAt)
        .range(from, to);

      if (res.error) return res;
      if (res.data.length === 0) return;

      fetched = fetched + paginate;
      yield res;
    }
  }
}
