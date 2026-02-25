# Supabase setup for Creativity Puzzle Game

Follow these steps to create and configure the Supabase backend.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New project**.
3. Choose your organization, name the project (e.g. `creative-puzzle-studio`), set a database password, and pick a region.
4. Wait for the project to be ready.

## 2. Get your credentials

1. In the Dashboard, open **Project Settings** (gear icon) → **API**.
2. Copy:
   - **Project URL** → use as `VITE_SUPABASE_URL`
   - **anon public** key → use as `VITE_SUPABASE_PUBLISHABLE_KEY`
3. In the project root, copy `.env.example` to `.env` and paste these values:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 3. Run the database migrations

Apply the schema and RLS policies in one of two ways.

### Option A: Supabase CLI (recommended)

1. Install the [Supabase CLI](https://supabase.com/docs/guides/cli).
2. From the project root:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

`YOUR_PROJECT_REF` is the part of your project URL before `.supabase.co` (e.g. `saojmrkjjcjxfmyjocsd`).

### Option B: SQL Editor (no CLI)

1. In the Dashboard go to **SQL Editor**.
2. Run the migration files in **filename order** (oldest first), one by one:
   - `supabase/migrations/20260220152055_31760d76-34ea-48c5-874f-0be5936559a3.sql`
   - `supabase/migrations/20260220161416_325e3afb-1bc0-44d6-8f57-f8348997fd94.sql`
   - `supabase/migrations/20260220164620_ec78323d-8c63-4ea4-9ee9-a6baf171c85f.sql`
   - `supabase/migrations/20260220172222_711907a2-3bef-448a-9f10-2e0f2d1e5a8b.sql`
   - `supabase/migrations/20260225100000_allow_join_by_code_when_playing.sql`
3. Paste each file’s contents into a new query and run it.

## 4. Enable Auth providers

1. Go to **Authentication** → **Providers**.
2. **Email**: leave enabled (teachers sign in with email/password).
3. **Anonymous**: turn **on** (students join without an account).

(Optional) To allow the demo teacher to sign in without email confirmation:

- **Authentication** → **Providers** → **Email** → disable **Confirm email** for development, or add the demo user in step 5 and confirm it.

## 5. (Optional) Create the demo teacher user

So the **Use Demo Account** button works on the Teacher Login page:

**Option A – Dashboard**

1. **Authentication** → **Users** → **Add user** → **Create new user**.
2. Email: `demo.teacher@puzzle.com`
3. Password: `Teacher2024!`
4. Check **Auto Confirm User** → Create.

**Option B – Seed script**

1. In **Project Settings** → **API**, copy the **service_role** key (keep it secret).
2. Add to `.env` (do not commit):

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

3. From the project root:

```bash
npm run db:seed-demo
```

## 6. Run the app

```bash
npm install
npm run dev
```

Open the app, go to **Teacher Login**, and use **Use Demo Account** or create your own teacher account.
