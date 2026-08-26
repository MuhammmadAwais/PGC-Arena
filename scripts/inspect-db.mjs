import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  const { data: campuses } = await supabase.from("campuses").select("*");
  console.log("=== Campuses in DB ===");
  console.log(campuses);

  const { data: teams } = await supabase.from("teams").select("*");
  console.log("\n=== Teams in DB ===");
  console.log(teams);

  const { data: users } = await supabase.from("users").select("*");
  console.log("\n=== Users in DB ===");
  console.log(users);
}

run();
