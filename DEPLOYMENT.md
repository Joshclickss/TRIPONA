# TRIPONA Cloud Deployment & Migration Guide
## Cloudflare Pages (Frontend) + Supabase (Database, Auth & Storage)

This guide provides end-to-end instructions for deploying TRIPONA to free-tier cloud infrastructure.

---

### Architecture Overview

- **Frontend Hosting:** Cloudflare Pages (Free, Global Edge CDN, Unlimited Bandwidth, Free SSL/HTTPS)
- **Database:** Supabase PostgreSQL (Free tier, 500MB DB, automated backups)
- **Authentication:** Supabase Auth (Free tier, 50,000 monthly active users, Email/Password + OAuth)
- **File Storage:** Supabase Storage (Free tier, 1GB storage, public & private buckets)
- **Security:** PostgreSQL Row Level Security (RLS) on every table + JWT verification

---

## Step 1: Set Up Supabase Project (Free Tier)

1. Navigate to [https://supabase.com](https://supabase.com) and sign in / create a free account.
2. Click **New Project**:
   - **Name:** `tripona-cloud`
   - **Database Password:** Choose a secure password (save it safely)
   - **Region:** Choose the region closest to your primary audience (e.g., `Singapore`, `Frankfurt`, or `US East`)
   - **Pricing Plan:** Free
3. Once the project finishes provisioning (takes ~1-2 minutes):
   - Go to **Project Settings** → **API**.
   - Copy the **Project URL** (`https://<project-id>.supabase.co`).
   - Copy the **anon public API Key** (`eyJ...`).

---

## Step 2: Apply Database Schema & Seed Data

1. In your Supabase Dashboard, click on **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open [`supabase/migrations/20261114_init_tripona.sql`](file:///Users/joshuathomas/Documents/Antigravity%20project/TRIPONA/supabase/migrations/20261114_init_tripona.sql) in your code editor, copy its entire contents, paste them into the SQL editor, and click **Run**.
   - This creates all 8 core tables: `profiles`, `destinations`, `saved_destinations`, `trips`, `bookings`, `expenses`, `checklists`, `conversations`.
   - Enables Row Level Security (RLS) on all tables with zero data leakage.
   - Sets up automatic profile creation on user signup.
4. Click **New query** again.
5. Open [`supabase/seed.sql`](file:///Users/joshuathomas/Documents/Antigravity%20project/TRIPONA/supabase/seed.sql), copy its contents, paste them into the SQL editor, and click **Run**.
   - This seeds the 12 worldwide curated destinations into PostgreSQL.

---

## Step 3: Verify Supabase Storage Buckets

The migration script creates the required storage buckets automatically:
- `tripona-media` (Public bucket for destination photos, trip covers, avatars)
- `tripona-vouchers` (Private bucket for booking receipts and travel passes)

To verify:
1. In the Supabase Dashboard, open **Storage**.
2. Confirm `tripona-media` and `tripona-vouchers` are listed.

---

## Step 4: Deploy to Cloudflare Pages (Free Tier)

### Method A: Direct GitHub Integration (Recommended)
1. Go to [https://dash.cloudflare.com](https://dash.cloudflare.com) and select **Workers & Pages**.
2. Click **Create Application** → **Pages** → **Connect to Git**.
3. Select your GitHub repository: `Joshclickss/TRIPONA`.
4. Configure Build Settings:
   - **Framework preset:** `Vite`
   - **Root directory:** `client`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Under **Environment variables (Advanced)**, add:
   - `VITE_SUPABASE_URL` = your Supabase Project URL (`https://<project-id>.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY` = your Supabase `anon` public key
6. Click **Save and Deploy**.
7. Cloudflare Pages will build the site and deploy it to a free `*.pages.dev` domain with free SSL.

### Method B: Wrangler CLI
```bash
cd client
npm run build
npx wrangler pages deploy dist --project-name tripona
```

---

## Step 5: Client-Side Routing (SPA)

Cloudflare Pages automatically reads the included file [`client/public/_redirects`](file:///Users/joshuathomas/Documents/Antigravity%20project/TRIPONA/client/public/_redirects):
```
/*    /index.html   200
```
This ensures seamless browser navigation and refreshes without 404 errors.

---

## Step 6: Local Data Migration Utility

TRIPONA includes an automated migration utility [`client/src/services/migrationService.js`](file:///Users/joshuathomas/Documents/Antigravity%20project/TRIPONA/client/src/services/migrationService.js) to migrate local browser data:
- **Inspect:** `migrationService.inspectLocalData()` inspects locally cached trips, bookings, and preferences.
- **Export Backup:** `migrationService.exportBackup()` downloads a validated JSON backup.
- **Migrate to Cloud:** `migrationService.migrateToCloud(userId)` safely upserts local records to Supabase with duplicate detection.

---

## Step 7: Local Development with Cloud Backend

To test locally connected to your live Supabase database:
1. Create `client/.env`:
   ```bash
   VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   ```
2. Start the dev server:
   ```bash
   cd client
   npm run dev
   ```
3. Open [http://localhost:5173](http://localhost:5173). All user profiles, trips, and bookings will now sync in real-time with your Supabase PostgreSQL cloud database.
