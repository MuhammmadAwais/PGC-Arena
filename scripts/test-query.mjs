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

async function test() {
  const campusId = "bda67ebb-be51-432d-af0f-b27077beb847";
  const res = await supabase
    .from("users")
    .select("id, full_name, role, roll_number, ign, avatar_url, campus_id, team_id")
    .eq("campus_id", campusId);

  console.log("Error:", res.error);
  console.log("Data count:", res.data?.length);
  console.log("Data:", res.data);
}

test();
