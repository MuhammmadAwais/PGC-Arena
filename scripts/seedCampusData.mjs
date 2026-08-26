import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createAuthUser(email, password, fullName) {
  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const found = existingUsers?.users?.find((u) => u.email === email);
  if (found) {
    return found.id;
  }
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error) {
    console.error(`Error creating auth user ${email}:`, error.message);
    throw error;
  }
  return data.user.id;
}

async function seed() {
  console.log("🌱 Starting Supabase Seeding for Campuses & Teams...");

  // 1. Clean existing records (except super admin)
  console.log("1. Cleaning old test data...");
  const { data: superAdmins } = await supabase
    .from("users")
    .select("id")
    .eq("role", "SUPER_ADMIN");
  const superAdminIds = (superAdmins || []).map((u) => u.id);

  await supabase.from("match_answers").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("matches").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  
  // Set leader_id to null on teams before deleting users
  await supabase.from("teams").update({ leader_id: null }).neq("id", "00000000-0000-0000-0000-000000000000");
  
  // Delete users not super_admin
  if (superAdminIds.length > 0) {
    await supabase.from("users").delete().not("id", "in", `(${superAdminIds.join(",")})`);
  } else {
    await supabase.from("users").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  }

  await supabase.from("teams").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("campuses").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  // 2. Insert 3 Campuses
  console.log("2. Inserting 3 Campuses...");
  const { data: campuses, error: campusErr } = await supabase
    .from("campuses")
    .insert([
      { name: "PGC Alpha Campus (Lahore Central)" },
      { name: "PGC Beta Campus (Islamabad North)" },
      { name: "PGC Gamma Campus (Karachi South)" },
    ])
    .select();

  if (campusErr) throw campusErr;
  console.log(`Inserted ${campuses.length} campuses.`);

  const [alphaCampus, betaCampus, gammaCampus] = campuses;

  // 3. Create Managers and Teachers
  console.log("3. Creating Campus Managers & Teachers...");
  const managersData = [
    { email: "ali.khan@pgc.edu", pass: "Pass123!", name: "Dr. Ali Khan", role: "CAMPUS_MANAGER", roll: "MGR-001", campusId: alphaCampus.id },
    { email: "sarah.ahmed@pgc.edu", pass: "Pass123!", name: "Sarah Ahmed", role: "CAMPUS_MANAGER", roll: "MGR-002", campusId: betaCampus.id },
    { email: "usman.tariq@pgc.edu", pass: "Pass123!", name: "Usman Tariq", role: "CAMPUS_MANAGER", roll: "MGR-003", campusId: gammaCampus.id },
  ];

  const teachersData = [
    { email: "tariq.m@pgc.edu", pass: "Pass123!", name: "Prof. Tariq Mehmood", role: "TEACHER", roll: "TCH-101", campusId: alphaCampus.id },
    { email: "nida.f@pgc.edu", pass: "Pass123!", name: "Dr. Nida Fatima", role: "TEACHER", roll: "TCH-102", campusId: alphaCampus.id },
    { email: "kamran.a@pgc.edu", pass: "Pass123!", name: "Prof. Kamran Aslam", role: "TEACHER", roll: "TCH-201", campusId: betaCampus.id },
    { email: "zainab.q@pgc.edu", pass: "Pass123!", name: "Ms. Zainab Qureshi", role: "TEACHER", roll: "TCH-301", campusId: gammaCampus.id },
  ];

  for (const item of [...managersData, ...teachersData]) {
    const authId = await createAuthUser(item.email, item.pass, item.name);
    await supabase.from("users").upsert({
      id: authId,
      full_name: item.name,
      role: item.role,
      roll_number: item.roll,
      campus_id: item.campusId,
      is_first_login: false,
    });
  }

  // 4. Create Teams for Campuses
  console.log("4. Inserting Teams...");
  const teamsToCreate = [
    // Alpha Campus Teams
    { name: "Cyber Lions", campus_id: alphaCampus.id, elo_rating: 1580 },
    { name: "Shaheen Strikers", campus_id: alphaCampus.id, elo_rating: 1490 },
    // Beta Campus Teams
    { name: "Northern Falcons", campus_id: betaCampus.id, elo_rating: 1620 },
    { name: "Islamabad Titans", campus_id: betaCampus.id, elo_rating: 1410 },
    // Gamma Campus Teams
    { name: "Karachi Knights", campus_id: gammaCampus.id, elo_rating: 1530 },
  ];

  const { data: insertedTeams, error: teamErr } = await supabase
    .from("teams")
    .insert(teamsToCreate)
    .select();

  if (teamErr) throw teamErr;
  console.log(`Inserted ${insertedTeams.length} teams.`);

  const cyberLions = insertedTeams.find((t) => t.name === "Cyber Lions");
  const shaheenStrikers = insertedTeams.find((t) => t.name === "Shaheen Strikers");
  const northernFalcons = insertedTeams.find((t) => t.name === "Northern Falcons");
  const isbTitans = insertedTeams.find((t) => t.name === "Islamabad Titans");
  const karachiKnights = insertedTeams.find((t) => t.name === "Karachi Knights");

  // 5. Create Students, Team Leaders, and Members
  console.log("5. Creating Students and Captains...");
  const students = [
    // Cyber Lions (Alpha) - Leader: Hassan Raza
    { email: "hassan.r@student.pgc.edu", name: "Hassan Raza", ign: "CyberKhan", roll: "LHR-23-01", campusId: alphaCampus.id, teamId: cyberLions.id, isLeader: true, teamObj: cyberLions },
    { email: "bilal.a@student.pgc.edu", name: "Bilal Ahmed", ign: "ShadowStrike", roll: "LHR-23-02", campusId: alphaCampus.id, teamId: cyberLions.id, isLeader: false },
    { email: "hamza.a@student.pgc.edu", name: "Hamza Ali", ign: "Vortex", roll: "LHR-23-03", campusId: alphaCampus.id, teamId: cyberLions.id, isLeader: false },
    { email: "daniyal.m@student.pgc.edu", name: "Daniyal Malik", ign: "PhantomX", roll: "LHR-23-04", campusId: alphaCampus.id, teamId: cyberLions.id, isLeader: false },

    // Shaheen Strikers (Alpha) - Leader: Ayesha Noor
    { email: "ayesha.n@student.pgc.edu", name: "Ayesha Noor", ign: "Valkyrie", roll: "LHR-23-11", campusId: alphaCampus.id, teamId: shaheenStrikers.id, isLeader: true, teamObj: shaheenStrikers },
    { email: "fatima.s@student.pgc.edu", name: "Fatima Sheikh", ign: "Nova", roll: "LHR-23-12", campusId: alphaCampus.id, teamId: shaheenStrikers.id, isLeader: false },
    { email: "saad.z@student.pgc.edu", name: "Saad Zafar", ign: "Blaze", roll: "LHR-23-13", campusId: alphaCampus.id, teamId: shaheenStrikers.id, isLeader: false },

    // Northern Falcons (Beta) - Leader: Zainab Shah
    { email: "zainab.s@student.pgc.edu", name: "Zainab Shah", ign: "PhoenixQueen", roll: "ISB-23-01", campusId: betaCampus.id, teamId: northernFalcons.id, isLeader: true, teamObj: northernFalcons },
    { email: "mustafa.k@student.pgc.edu", name: "Mustafa Kamal", ign: "FrostByte", roll: "ISB-23-02", campusId: betaCampus.id, teamId: northernFalcons.id, isLeader: false },
    { email: "omer.f@student.pgc.edu", name: "Omer Farooq", ign: "Apex", roll: "ISB-23-03", campusId: betaCampus.id, teamId: northernFalcons.id, isLeader: false },

    // Islamabad Titans (Beta) - Leader: Waleed Akhtar
    { email: "waleed.a@student.pgc.edu", name: "Waleed Akhtar", ign: "Warlord", roll: "ISB-23-11", campusId: betaCampus.id, teamId: isbTitans.id, isLeader: true, teamObj: isbTitans },
    { email: "zeeshan.a@student.pgc.edu", name: "Zeeshan Ali", ign: "Thunder", roll: "ISB-23-12", campusId: betaCampus.id, teamId: isbTitans.id, isLeader: false },

    // Karachi Knights (Gamma) - Leader: Rohail Tariq
    { email: "rohail.t@student.pgc.edu", name: "Rohail Tariq", ign: "NightCrawler", roll: "KHI-23-01", campusId: gammaCampus.id, teamId: karachiKnights.id, isLeader: true, teamObj: karachiKnights },
    { email: "danish.k@student.pgc.edu", name: "Danish Khan", ign: "Venom", roll: "KHI-23-02", campusId: gammaCampus.id, teamId: karachiKnights.id, isLeader: false },
    { email: "maheen.a@student.pgc.edu", name: "Maheen Asif", ign: "Mystic", roll: "KHI-23-03", campusId: gammaCampus.id, teamId: karachiKnights.id, isLeader: false },

    // Unassigned / Reserve Students
    { email: "ali.haider@student.pgc.edu", name: "Ali Haider", ign: "LoneWolf", roll: "LHR-23-99", campusId: alphaCampus.id, teamId: null, isLeader: false },
    { email: "maryam.j@student.pgc.edu", name: "Maryam Javed", ign: "Starlight", roll: "ISB-23-99", campusId: betaCampus.id, teamId: null, isLeader: false },
    { email: "zaid.q@student.pgc.edu", name: "Zaid Qasim", ign: "Glitch", roll: "KHI-23-99", campusId: gammaCampus.id, teamId: null, isLeader: false },
  ];

  for (const stu of students) {
    const authId = await createAuthUser(stu.email, "Pass123!", stu.name);
    await supabase.from("users").upsert({
      id: authId,
      full_name: stu.name,
      role: "STUDENT",
      roll_number: stu.roll,
      ign: stu.ign,
      campus_id: stu.campusId,
      team_id: stu.teamId,
      is_first_login: false,
    });

    if (stu.isLeader && stu.teamObj) {
      await supabase
        .from("teams")
        .update({ leader_id: authId })
        .eq("id", stu.teamObj.id);
      console.log(`👑 Assigned leader ${stu.name} (${stu.ign}) to team ${stu.teamObj.name}`);
    }
  }

  console.log("✅ Seeding completed successfully!");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
