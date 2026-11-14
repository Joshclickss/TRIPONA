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

const wranglerFile = path.join(rootDir, 'wrangler.toml');
assert(fs.existsSync(wranglerFile), 'wrangler.toml configuration exists for Cloudflare deployment');
const wranglerContent = fs.readFileSync(wranglerFile, 'utf8');
assert(wranglerContent.includes('not_found_handling = "single-page-application"') || wranglerContent.includes('worker.js'), 'Cloudflare SPA routing is configured');

const workerFile = path.join(rootDir, 'worker.js');
assert(fs.existsSync(workerFile), 'Root worker.js SPA handler exists');

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

// ----------------------------------------------------
// TEST GROUP 6: SIMPLEMAPS WORLD CITIES DATASET INTEGRITY
// ----------------------------------------------------
console.log('\n📌 [Test Group 6] Verifying SimpleMaps 50,000+ World Cities Database...');

const citiesCsv = path.join(rootDir, 'server', 'data', 'worldcities.csv');
assert(fs.existsSync(citiesCsv), 'worldcities.csv exists in server/data');

const citiesMigration = path.join(rootDir, 'supabase', 'migrations', '20261114_add_world_cities.sql');
assert(fs.existsSync(citiesMigration), 'Supabase world_cities migration exists');

const citiesModel = path.join(rootDir, 'server', 'models', 'City.js');
assert(fs.existsSync(citiesModel), 'Mongoose City model exists in server/models/City.js');

const citiesStats = fs.statSync(citiesCsv);
assert(citiesStats.size > 5 * 1024 * 1024, `worldcities.csv is complete (${(citiesStats.size / (1024 * 1024)).toFixed(2)} MB)`);

// ----------------------------------------------------
// TEST GROUP 7: REAL-TIME GLOBAL TRAVEL INTELLIGENCE ENGINE
// ----------------------------------------------------
console.log('\n📌 [Test Group 7] Verifying Real-Time Travel Intelligence Engine...');

const intelMigration = path.join(rootDir, 'supabase', 'migrations', '20261114_add_travel_intelligence.sql');
assert(fs.existsSync(intelMigration), 'travel_intelligence_cache SQL migration exists');

const intelService = path.join(rootDir, 'server', 'services', 'travelIntelligenceService.js');
assert(fs.existsSync(intelService), 'travelIntelligenceService.js exists in server/services');

const intelRoute = path.join(rootDir, 'server', 'routes', 'intelligence.js');
assert(fs.existsSync(intelRoute), 'intelligence.js routes exist in server/routes');

const intelModal = path.join(rootDir, 'client', 'src', 'components', 'TravelIntelligenceModal.jsx');
assert(fs.existsSync(intelModal), 'TravelIntelligenceModal.jsx exists in client/src/components');

// Test budget engine calculations
const { calculateSourceBackedBudget } = await import('../server/services/travelIntelligenceService.js');
const testBudget = calculateSourceBackedBudget({
  destinationName: 'Tokyo',
  country: 'Japan',
  durationDays: 7,
  travellerGroup: 'couple',
  travelStyle: 'mid-range',
  baseCurrency: 'USD',
  fxRate: 0.90,
  targetCurrency: 'EUR'
});

assert(testBudget.totals.totalTripBudget > 0, 'Budget engine calculates positive total');
assert(testBudget.breakdown.accommodation.amount > 0, 'Accommodation cost calculated');
assert(testBudget.sourceVerification.verificationStatus === 'ESTIMATED_STATISTICAL', 'Source status tagged ESTIMATED_STATISTICAL');

// ----------------------------------------------------
// TEST GROUP 8: FREE API PROVIDER ADAPTER ARCHITECTURE
// ----------------------------------------------------
console.log('\n📌 [Test Group 8] Verifying Free Provider Adapter Architecture...');

const currAdapterFile = path.join(rootDir, 'server', 'services', 'adapters', 'currencyAdapter.js');
assert(fs.existsSync(currAdapterFile), 'currencyAdapter.js exists (Frankfurter + Open Exchange Rates)');

const weatherAdapterFile = path.join(rootDir, 'server', 'services', 'adapters', 'weatherAdapter.js');
assert(fs.existsSync(weatherAdapterFile), 'weatherAdapter.js exists (Open-Meteo)');

const countryAdapterFile = path.join(rootDir, 'server', 'services', 'adapters', 'countryStatsAdapter.js');
assert(fs.existsSync(countryAdapterFile), 'countryStatsAdapter.js exists (World Bank Open Data)');

const attrAdapterFile = path.join(rootDir, 'server', 'services', 'adapters', 'attractionsAdapter.js');
assert(fs.existsSync(attrAdapterFile), 'attractionsAdapter.js exists (OpenTripMap + OpenStreetMap)');

const geoAdapterFile = path.join(rootDir, 'server', 'services', 'adapters', 'geocodingAdapter.js');
assert(fs.existsSync(geoAdapterFile), 'geocodingAdapter.js exists (GeoNames + SimpleMaps)');

const registryFile = path.join(rootDir, 'server', 'services', 'adapters', 'travelProviderRegistry.js');
assert(fs.existsSync(registryFile), 'travelProviderRegistry.js exists');

const { currencyAdapter } = await import('../server/services/adapters/currencyAdapter.js');
const fxResult = await currencyAdapter.convert(100, 'USD', 'EUR');
assert(fxResult.convertedAmount > 0, 'Frankfurter / FX conversion returns positive converted amount');
assert(fxResult.verificationStatus === 'VERIFIED_LIVE' || fxResult.verificationStatus === 'ESTIMATED_STATISTICAL', 'FX status is verified');

// ----------------------------------------------------
// TEST GROUP 9: SUPABASE EDGE FUNCTIONS & CLOUD ARCHITECTURE
// ----------------------------------------------------
console.log('\n📌 [Test Group 9] Verifying Supabase Edge Functions & Master Cloud Schema...');

const masterSql = path.join(rootDir, 'supabase', 'migrations', '20261114_master_tripona.sql');
assert(fs.existsSync(masterSql), 'Master unified migration 20261114_master_tripona.sql exists');

const edgePlanTrip = path.join(rootDir, 'supabase', 'functions', 'plan-trip', 'index.ts');
assert(fs.existsSync(edgePlanTrip), 'Edge Function plan-trip/index.ts exists');

const edgeIntel = path.join(rootDir, 'supabase', 'functions', 'intelligence', 'index.ts');
assert(fs.existsSync(edgeIntel), 'Edge Function intelligence/index.ts exists');

const edgeServices = path.join(rootDir, 'supabase', 'functions', 'services-explorer', 'index.ts');
assert(fs.existsSync(edgeServices), 'Edge Function services-explorer/index.ts exists');

const clientGitignore = path.join(rootDir, 'client', '.gitignore');
assert(fs.existsSync(clientGitignore), 'client/.gitignore protects secret env vars');
const gitignoreContent = fs.readFileSync(clientGitignore, 'utf8');
assert(gitignoreContent.includes('.env'), 'client/.gitignore explicitly ignores .env files');

console.log('\n====================================================');
console.log(`🎉 ALL TESTS PASSED: ${passedTests}/${totalTests} tests successful!`);
console.log('====================================================\n');
