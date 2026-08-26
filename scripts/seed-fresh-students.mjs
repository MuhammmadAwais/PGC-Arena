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

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function run() {
  console.log("=== 1. Fetching all existing students to clean up ===");
  const { data: existingStudents, error: fetchErr } = await supabase
    .from("users")
    .select("id, full_name, role, roll_number")
    .eq("role", "STUDENT");

  if (fetchErr) {
    console.error("Error fetching students:", fetchErr);
    process.exit(1);
  }

  console.log(`Found ${existingStudents.length} existing students to delete.`);

  for (const s of existingStudents) {
    console.log(`Deleting student: ${s.full_name} (${s.id})`);
    // Delete from public.users
    await supabase.from("users").delete().eq("id", s.id);
    // Delete from auth.users
    try {
      await supabase.auth.admin.deleteUser(s.id);
    } catch (err) {
      console.warn(`Auth delete failed for ${s.id}:`, err.message);
    }
  }

  console.log("\n=== 2. Fetching Campuses and Squads ===");
  const { data: campuses, error: campusErr } = await supabase
    .from("campuses")
    .select("id, name, region")
    .order("name", { ascending: true });

  if (campusErr || !campuses || campuses.length === 0) {
    console.error("No campuses found:", campusErr);
    process.exit(1);
  }

  const { data: teams, error: teamErr } = await supabase
    .from("teams")
    .select("id, name, campus_id, leader_id");

  console.log(`Found ${campuses.length} campuses and ${teams?.length || 0} teams.`);

  // Pakistani Student Name pool and IGN pools
  const studentPool = [
    // Alpha Campus (Lahore Central)
    [
      { name: "Muhammad Hamza", ign: "FALCON", roll: "LHR-2024-CS01", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150" },
      { name: "Ali Raza Khan", ign: "CYBERPHANTOM", roll: "LHR-2024-CS02", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150" },
      { name: "Zaid Ahmed Malik", ign: "VORTEX_PK", roll: "LHR-2024-CS03", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150" },
    ],
    // Gulberg Campus
    [
      { name: "Bilal Tariq", ign: "SHADOWBLADE", roll: "GLB-2024-CS11", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
      { name: "Usman Ghani", ign: "NIGHT_VIPER", roll: "GLB-2024-CS12", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150" },
      { name: "Danyal Farooq", ign: "ALPHA_SNIPER", roll: "GLB-2024-CS13", avatar: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150" },
    ],
    // Rawalpindi Campus
    [
      { name: "Shahmeer Khan", ign: "TITAN_REIGN", roll: "RWP-2024-CS21", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" },
      { name: "Abdullah Naveed", ign: "GHOST_RECON", roll: "RWP-2024-CS22", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150" },
      { name: "Hassan Qureshi", ign: "BLAZE_FIRE", roll: "RWP-2024-CS23", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150" },
    ],
    // Faisalabad Campus
    [
      { name: "Saad Rehman", ign: "STRIKER_99", roll: "FSD-2024-CS31", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150" },
      { name: "Ayaan Siddiqui", ign: "NEO_MATRIX", roll: "FSD-2024-CS32", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150" },
      { name: "Murtaza Ali", ign: "PHOENIX_PULSE", roll: "FSD-2024-CS33", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150" },
    ],
    // Multan Campus
    [
      { name: "Taimoor Shah", ign: "APEX_PREDATOR", roll: "MLT-2024-CS41", avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150" },
      { name: "Waleed Anjum", ign: "SOLAR_FLARE", roll: "MLT-2024-CS42", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" },
      { name: "Fahad Mustafa", ign: "IRON_CLAD", roll: "MLT-2024-CS43", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150" },
    ],
    // Gujranwala / Other Campuses fallback
    [
      { name: "Zubair Latif", ign: "THUNDER_GOD", roll: "GUJ-2024-CS51", avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150" },
      { name: "Khurram Shehzad", ign: "CYBER_NINJA", roll: "GUJ-2024-CS52", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150" },
      { name: "Arslan Aslam", ign: "HYPER_SONIC", roll: "GUJ-2024-CS53", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150" },
    ],
  ];

  console.log("\n=== 3. Seeding 3 fresh students per campus ===");

  let campusIndex = 0;
  for (const campus of campuses) {
    console.log(`\n--- Seeding for Campus: ${campus.name} (${campus.id}) ---`);
    const campusTeams = (teams || []).filter((t) => t.campus_id === campus.id);
    const primaryTeam = campusTeams[0] || null;

    const rosterData = studentPool[campusIndex % studentPool.length];
    campusIndex++;

    let createdCaptainId = null;

    for (let i = 0; i < 3; i++) {
      const studentInfo = rosterData[i];
      const email = `${studentInfo.roll.toLowerCase().replace(/[^a-z0-9]/g, "")}@pgc.edu`;
      const password = "PgcArena123!";

      console.log(`Creating Student: ${studentInfo.name} (${email}) for campus ${campus.name}...`);

      // 1. Create Supabase Auth user
      const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: studentInfo.name },
      });

      if (authErr || !authUser.user) {
        console.error(`Auth creation failed for ${studentInfo.name}:`, authErr);
        continue;
      }

      const userId = authUser.user.id;

      // 2. Assign to squad: first 2 to primary team, 3rd as free agent or squad player
      const assignedTeamId = primaryTeam ? (i < 2 ? primaryTeam.id : (campusTeams[1]?.id || primaryTeam.id)) : null;

      // Insert into public.users
      const { error: insertErr } = await supabase.from("users").insert({
        id: userId,
        full_name: studentInfo.name,
        role: "STUDENT",
        roll_number: studentInfo.roll,
        campus_id: campus.id,
        team_id: assignedTeamId,
        ign: studentInfo.ign,
        avatar_url: studentInfo.avatar,
        is_first_login: false,
      });

      if (insertErr) {
        console.error(`User row insert error for ${studentInfo.name}:`, insertErr);
        continue;
      }

      console.log(`✓ Enrolled ${studentInfo.name} (${studentInfo.ign}) -> Campus: ${campus.name}, Team: ${assignedTeamId || "Free Agent"}`);

      // If first player and squad exists with no leader, make them captain
      if (i === 0 && primaryTeam && !primaryTeam.leader_id && !createdCaptainId) {
        createdCaptainId = userId;
        await supabase.from("teams").update({ leader_id: userId }).eq("id", primaryTeam.id);
        console.log(`★ Designated ${studentInfo.name} as Captain of ${primaryTeam.name}`);
      }
    }
  }

  console.log("\n==========================================");
  console.log("SUCCESS! All students cleaned & fresh 3 students seeded per campus.");
  console.log("==========================================");
}

run().catch((err) => {
  console.error("Fatal error running seed script:", err);
  process.exit(1);
});
