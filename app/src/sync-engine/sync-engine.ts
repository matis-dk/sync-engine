import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bacqiesjoqdkxvluwdel.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhY3FpZXNqb3Fka3h2bHV3ZGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI0Njc1MzcsImV4cCI6MjAzODA0MzUzN30.Ysb8cmpJKKnQv_W6g4MvYUaLxrUvGCZTqmBwsBzjoLw";
const supabase = createClient(supabaseUrl, supabaseKey);

type SyncRecord<T = object> = T & {
  id: string;
  created_at: string; // ISO string for creation timestamp
  updated_at: string | null; // ISO string for update timestamp
  deleted_at: string | null; // ISO string for deletion timestamp (optional)
};

class SyncEngine {
  sync_status() {
    console.log("sync_status: ", Date.now());
  }
  sync_to_now() {
    console.log("sync_to_now: ", Date.now());
  }
  listener_start() {
    console.log("listener_start: ", Date.now());
  }
  listener_stop() {
    console.log("listener_stop: ", Date.now());
  }
  listener_status() {
    console.log("listener_status: ", Date.now());
  }
}

const engine = new SyncEngine();

// engine.
