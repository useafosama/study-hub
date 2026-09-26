import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Load .env.local manually if present
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [k, ...v] = trimmed.split("=");
      if (k && !process.env[k.trim()]) {
        process.env[k.trim()] = v.join("=").trim();
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey || supabaseUrl.includes("placeholder")) {
  console.log(`
⚠️  Supabase URL and Service Role Key are not configured in .env.local yet.
To create users via SQL Editor in Supabase, execute the contents of 'supabase/seed.sql'.
`);
  process.exit(0);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log("Seeding default users...");

  const users = [
    { username: "admin", fullName: "يوسف أسامة (المشرف)", password: "password123", role: "admin" },
    { username: "khaled", fullName: "خالد علي", password: "password123", role: "student" },
    { username: "salama", fullName: "سلامة محمود", password: "password123", role: "student" },
  ];

  for (const u of users) {
    const email = `${u.username}@studyhub.internal`;
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.fullName, username: u.username, role: u.role },
    });

    if (error) {
      console.log(`User ${u.username} exists or error:`, error.message);
    } else if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: u.fullName,
        username: u.username,
        role: u.role,
        is_active: true,
      });
      console.log(`✓ Created ${u.role}: ${u.username} (password: ${u.password})`);
    }
  }

  console.log("Done seeding users!");
}

main();
