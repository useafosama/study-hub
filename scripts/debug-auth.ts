import { createClient } from "@supabase/supabase-js";

// Test 1: with /rest/v1/
const wrongUrl = "https://zjcmyzdfauxbjzblikum.supabase.co/rest/v1/";
const cleanedUrl = "https://zjcmyzdfauxbjzblikum.supabase.co";
const anonKey = "sb_publishable_8oeqqzepc2szPVhdMDwRgA_91ByI";

async function test() {
  console.log("--- Testing with raw URL (with /rest/v1/) ---");
  const client1 = createClient(wrongUrl, anonKey);
  const res1 = await client1.auth.signInWithPassword({
    email: "admin@studyhub.internal",
    password: "password123",
  });
  console.log("Result 1 Error:", res1.error?.message, "Status:", res1.error?.status);

  console.log("\n--- Testing with cleaned URL (https://zjcmyzdfauxbjzblikum.supabase.co) ---");
  const client2 = createClient(cleanedUrl, anonKey);
  const res2 = await client2.auth.signInWithPassword({
    email: "admin@studyhub.internal",
    password: "password123",
  });
  console.log("Result 2 User:", res2.data.user?.id, "Error:", res2.error?.message);

  if (res2.data.user) {
    const { data: profile, error: profErr } = await client2
      .from("profiles")
      .select("*")
      .eq("id", res2.data.user.id)
      .single();
    console.log("Result 2 Profile:", profile, "Profile Error:", profErr);
  }
}

test();
