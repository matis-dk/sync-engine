import { createClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";

// Initialize Supabase client
const supabaseUrl = "https://bacqiesjoqdkxvluwdel.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhY3FpZXNqb3Fka3h2bHV3ZGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI0Njc1MzcsImV4cCI6MjAzODA0MzUzN30.Ysb8cmpJKKnQv_W6g4MvYUaLxrUvGCZTqmBwsBzjoLw";
const supabase = createClient(supabaseUrl, supabaseKey);

// Generate seed data
const generateEmployees = (num: number) => {
  const employees: Array<any> = [];

  for (let i = 0; i < num; i++) {
    const employee = {
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
      phone_number: faker.phone.number(),
      hire_date: faker.date.past({ years: 10 }).toISOString().split("T")[0],
    };
    employees.push(employee);
  }

  return employees;
};

// Insert seed data into Supabase
const insertEmployees = async (employees: any[]) => {
  const { data, error } = await supabase.from("employees").insert(employees);

  if (error) {
    console.error("Error inserting data:", error);
  } else {
    console.log("Inserted data:", data);
  }
};

// Main function to generate and insert seed data
const main = async () => {
  const employees = generateEmployees(1000);
  console.log("employees ====> ", employees);
  await insertEmployees(employees);
};

main().catch((err) => console.error(err));
