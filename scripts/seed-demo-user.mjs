/**
 * One-time script to create the demo teacher user in Supabase.
 * Run: npm run db:seed-demo  (reads VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env)
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env");
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
}

const url = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error("Missing env: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  console.error("Get the service role key from Supabase Dashboard → Project Settings → API.");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_EMAIL = "demo.teacher@puzzle.com";
const DEMO_PASSWORD = "Teacher2024!";

const { data, error } = await supabase.auth.admin.createUser({
  email: DEMO_EMAIL,
  password: DEMO_PASSWORD,
  email_confirm: true,
  user_metadata: { display_name: "Demo Teacher" },
});

if (error) {
  if (error.message?.includes("already been registered")) {
    console.log("Demo user already exists. You can use 'Use Demo Account' on the Teacher Login page.");
    process.exit(0);
  }
  console.error("Error creating demo user:", error.message);
  process.exit(1);
}

console.log("Demo teacher user created successfully.");
console.log("  Email:", DEMO_EMAIL);
console.log("  Password: (see Teacher Login page or README)");
console.log("You can now use 'Use Demo Account' on the Teacher Login page.");
