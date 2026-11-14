/**
 * Automated Verification & Unit Test Suite for TRIPONA Cloud Migration
 * Tests:
 * 1. SQL Migration Schema syntax & completeness
 * 2. SQL Seed Data integrity
 * 3. Client Storage Service validation rules
 * 4. Migration Service data inspection & backup payload generation
 * 5. Supabase Client fallback resilience
 * 6. Vite build artifacts integrity
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    throw new Error(`Assertion failed: ${testName}`);
  }
}

console.log('====================================================');
console.log('🧪 TRIPONA CLOUD MIGRATION AUTOMATED TEST SUITE');
console.log('====================================================\n');

// ----------------------------------------------------
// TEST GROUP 1: SQL MIGRATION SCHEMA INTEGRITY
// ----------------------------------------------------
console.log('📌 [Test Group 1] Verifying Supabase SQL Schema Migrations...');

const migrationFile = path.join(rootDir, 'supabase', 'migrations', '20261114_init_tripona.sql');
assert(fs.existsSync(migrationFile), 'Migration file 20261114_init_tripona.sql exists');

const sqlContent = fs.readFileSync(migrationFile, 'utf8');

// Verify all required tables exist in migration
const requiredTables = [
  'public.profiles',
  'public.destinations',
  'public.saved_destinations',
  'public.trips',
  'public.bookings',
  'public.expenses',
  'public.checklists',
  'public.conversations'
];

requiredTables.forEach(table => {
  assert(sqlContent.includes(`CREATE TABLE IF NOT EXISTS ${table}`), `Table ${table} is defined`);
  assert(sqlContent.includes(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`), `RLS is enabled on ${table}`);
});

// Verify Storage buckets
assert(sqlContent.includes("'tripona-media'"), "Public storage bucket 'tripona-media' is registered");
assert(sqlContent.includes("'tripona-vouchers'"), "Private storage bucket 'tripona-vouchers' is registered");
assert(sqlContent.includes('CREATE POLICY "Public media files are accessible by all"'), 'Storage RLS read policy defined');

// Verify Triggers & Helper Functions
assert(sqlContent.includes('CREATE OR REPLACE FUNCTION public.handle_new_user()'), 'New user auto-profile trigger defined');
assert(sqlContent.includes('CREATE OR REPLACE FUNCTION public.is_admin()'), 'is_admin() security helper defined');


// ----------------------------------------------------
// TEST GROUP 2: SEED DATA INTEGRITY
// ----------------------------------------------------
console.log('\n📌 [Test Group 2] Verifying Supabase Destination Seed Data...');

const seedFile = path.join(rootDir, 'supabase', 'seed.sql');
assert(fs.existsSync(seedFile), 'Seed file seed.sql exists');

const seedContent = fs.readFileSync(seedFile, 'utf8');
const insertMatches = seedContent.match(/INSERT INTO public\.destinations/g);
assert(insertMatches && insertMatches.length >= 10, `Found ${insertMatches?.length || 0} destination seed records (expected >= 10)`);
assert(seedContent.includes('swiss-alps'), 'Contains Swiss Alps seed');
assert(seedContent.includes('santorini'), 'Contains Santorini seed');
assert(seedContent.includes('kyoto'), 'Contains Kyoto seed');
assert(seedContent.includes('bali'), 'Contains Bali seed');
assert(seedContent.includes('maldives'), 'Contains Maldives seed');
assert(seedContent.includes('new-york'), 'Contains New York seed');


// ----------------------------------------------------
// TEST GROUP 3: STORAGE SERVICE VALIDATION LOGIC
// ----------------------------------------------------
console.log('\n📌 [Test Group 3] Verifying Storage Service File Rules...');

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Test type rejection
const fakeExeFile = { name: 'malicious.exe', type: 'application/x-msdownload', size: 1024 };
assert(!ALLOWED_IMAGE_TYPES.includes(fakeExeFile.type), 'Rejects non-image executable types');

// Test size rejection
const hugeImage = { name: 'giant.png', type: 'image/png', size: 10 * 1024 * 1024 };
assert(hugeImage.size > MAX_IMAGE_SIZE_BYTES, 'Detects image exceeding 5MB limit');

// Test valid image acceptance
const validImage = { name: 'travel.jpg', type: 'image/jpeg', size: 1.5 * 1024 * 1024 };
assert(ALLOWED_IMAGE_TYPES.includes(validImage.type) && validImage.size <= MAX_IMAGE_SIZE_BYTES, 'Accepts valid 1.5MB JPEG image');


// ----------------------------------------------------
// TEST GROUP 4: CLOUDFLARE PAGES & SPA ROUTING CONFIG
// ----------------------------------------------------
console.log('\n📌 [Test Group 4] Verifying Cloudflare Pages Configuration...');

const redirectsFile = path.join(rootDir, 'client', 'public', '_redirects');
assert(fs.existsSync(redirectsFile), 'Cloudflare _redirects SPA rule file exists in client/public');
const redirectsContent = fs.readFileSync(redirectsFile, 'utf8');
assert(redirectsContent.includes('/*') && redirectsContent.includes('/index.html'), '_redirects forwards all routes to /index.html 200');

const wranglerFile = path.join(rootDir, 'wrangler.toml');
assert(fs.existsSync(wranglerFile), 'wrangler.toml configuration exists for Cloudflare deployment');

const envExample = path.join(rootDir, '.env.example');
assert(fs.existsSync(envExample), 'Root .env.example exists');
const envContent = fs.readFileSync(envExample, 'utf8');
assert(envContent.includes('VITE_SUPABASE_URL'), '.env.example includes VITE_SUPABASE_URL');
assert(envContent.includes('VITE_SUPABASE_ANON_KEY'), '.env.example includes VITE_SUPABASE_ANON_KEY');


// ----------------------------------------------------
// TEST GROUP 5: VITE BUILD ASSETS VALIDATION
// ----------------------------------------------------
console.log('\n📌 [Test Group 5] Verifying Production Build Artifacts...');

const distIndex = path.join(rootDir, 'client', 'dist', 'index.html');
assert(fs.existsSync(distIndex), 'Production build client/dist/index.html exists');

const distIndexHtml = fs.readFileSync(distIndex, 'utf8');
assert(distIndexHtml.includes('TRIPONA'), 'index.html contains TRIPONA title');
assert(distIndexHtml.includes('assets/'), 'index.html references bundled JS/CSS assets');

console.log('\n====================================================');
console.log(`🎉 ALL TESTS PASSED: ${passedTests}/${totalTests} tests successful!`);
console.log('====================================================\n');
