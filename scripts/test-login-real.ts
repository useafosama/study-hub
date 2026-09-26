import * as fs from "fs";
import * as path from "path";

// Load .env.local
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

import { createClient } from "@supabase/supabase-js";
import { getCleanSupabaseUrl, getCleanAnonKey, getCleanServiceRoleKey } from "../lib/supabase/utils";
import { usernameToInternalEmail } from "../lib/auth/utils";

const url = getCleanSupabaseUrl();
const anonKey = getCleanAnonKey();
const serviceKey = getCleanServiceRoleKey();

console.log("Supabase URL:", url);
console.log("Anon Key prefix:", anonKey.slice(0, 15) + "...");
console.log("Service Key prefix:", serviceKey.slice(0, 15) + "...");

async function testLogin(username: string, pass: string) {
  const email = usernameToInternalEmail(username);
  console.log(`\n=== Testing Login for: "${username}" -> "${email}" ===`);

  // 1. Test with Anon Key
  const anonClient = createClient(url, anonKey);
  const anonRes = await anonClient.auth.signInWithPassword({
    email,
    password: pass,
  });

  console.log("Anon Client Response:");
  console.log("  Success:", Boolean(anonRes.data?.user));
  console.log("  User ID:", anonRes.data?.user?.id);
  console.log("  Error Message:", anonRes.error?.message);
  console.log("  Error Status:", anonRes.error?.status);
  console.log("  Error Code:", (anonRes.error as any)?.code);

  // 2. Test with Service Role Key
  const adminClient = createClient(url, serviceKey);
  const adminRes = await adminClient.auth.signInWithPassword({
    email,
    password: pass,
  });

  console.log("Service Role Client Response:");
  console.log("  Success:", Boolean(adminRes.data?.user));
  console.log("  User ID:", adminRes.data?.user?.id);
  console.log("  Error Message:", adminRes.error?.message);
  console.log("  Error Status:", adminRes.error?.status);
}

async function run() {
  await testLogin("admin", "password123");
  await testLogin("khaled", "password123");
  await testLogin("salama", "password123");
}

run();
