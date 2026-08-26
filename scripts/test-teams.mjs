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
    .from("teams")
    .select("id, name, campus_id, leader_id, elo_rating, logo_url, banner_url, leader:users!leader_id(id, full_name, ign, avatar_url, roll_number)")
    .eq("campus_id", campusId);

  console.log("Teams Error:", res.error);
  console.log("Teams Count:", res.data?.length);
  console.log("Teams Data:", res.data);
}

test();
