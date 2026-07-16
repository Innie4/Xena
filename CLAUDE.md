# Xena — Project Context

## What this is
Xena is an embedded finance & community coordination app built for Wema Bank's
Hackaholics 7.0 Hackathon (Problem Statement 1: Open Banking). It automates
group contributions for shared estate maintenance, security, and waste
management — replacing manual WhatsApp-group cash-chasing with Open
Banking-linked "Smart Sweeps" and Community Escrow Wallets. ALAT by Wema is
positioned as the infrastructure partner.

## Stack
- Frontend: React + Vite + Tailwind CSS, deployed on Vercel (xena-lyart.vercel.app)
- Backend: FastAPI (Python), local dev on http://localhost:8000
- Database: Supabase (Postgres)
- Local dev frontend: http://localhost:5173 (Vite may bump to 5174+ if the port is taken)

## Folder structure
Xena/
src/                  # React frontend
pages/SignupFlow.tsx
...
backend/
app/
main.py           # FastAPI app, CORS, router includes
database.py       # Supabase client init
routers/
users.py
...


## Environment variables
Backend `.env` (in `backend/`):
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
Frontend `.env` (in project root):
VITE_API_BASE_URL=http://localhost:8000

## Hard rules — do not violate these
1. **No visual changes.** Never touch Tailwind classes, layout, copy, or
   component structure unless explicitly asked. This is a data-wiring task,
   not a redesign.
2. **One screen at a time.** Only touch the screen/feature named in the
   current task. Do not "helpfully" wire up other screens.
3. **CORS must allow all local ports**, since Vite's port shifts
   (5173, 5174, ...). Use `allow_origin_regex=r"http://localhost:\d+"` in
   FastAPI's CORSMiddleware, not a hardcoded single origin.
4. **Never hardcode fallback values** (e.g. `estate_id: something || 'fallback'`)
   for fields that must be real database values like UUIDs. If a value is
   missing, surface an inline error instead of silently substituting a
   placeholder.
5. **Only select columns that actually exist** on the current table schema.
   Check the schema below before writing any query — don't carry over
   fields from earlier/mock versions of a table.
6. **Idempotent testing**: signup will be re-run repeatedly with the same
   test BVNs/phone numbers during development. `POST /users` must handle
   duplicate `phone_number` gracefully (return the existing user) instead
   of throwing a 500.

## Current database schema (Supabase, already created)
- `estates(id uuid pk, name, city, state, created_at)` — seeded with 100 real street names across Uyo/Lagos/Abuja
- `users(id uuid pk, phone_number unique, full_name, bvn_hash, estate_id fk, reliability_score, standing_tier, sweep_fee_percent, created_at)`
- `bank_accounts(id uuid pk, user_id fk, bank_name, account_number, account_name, provider, is_primary, connected_at)`
- `bvn_records(bvn pk, full_name, phone_number unique)` — mock Open Banking directory, 10 seeded test BVNs (`22212345671`–`22212345680`)
- `bvn_accounts(id uuid pk, bvn fk, bank_name, account_number unique, account_name, provider)` — 2 accounts per seeded BVN
- `mandates(id uuid pk, user_id fk, bank_account_id fk, bill_id fk, max_amount_per_sweep, min_balance_threshold, status, signed_at)`
- `bills(id uuid pk, user_id fk, estate_id fk, name, provider_name, amount, due_date, status, smart_sweep_enabled, mandate_id fk, created_at)`
- `projects(id uuid pk, estate_id fk, category, title, description, target_amount, current_amount, status, deadline, created_at)`
- `vote_options(id uuid pk, estate_id fk, title, description, votes_count, status, created_at)`
- `votes(id uuid pk, user_id fk, vote_option_id fk, created_at, unique(user_id, vote_option_id))`
- `transactions(id uuid pk, user_id fk, bill_id fk, project_id fk, amount, type, status, created_at)`
- `notifications(id uuid pk, user_id fk, message, type, is_read, created_at)`

## Build order (do not skip ahead)
1. ✅ Signup flow (BVN lookup → bank select → OTP → estate select → create user) — in progress, being debugged
2. Home dashboard (wallet balance, street standing, bills preview, community preview)
3. Bills page
4. Community/projects page
5. Vote page
6. Notifications page
7. Profile/mandates page

## Current status
Signup flow backend + frontend wiring is implemented. `bvn-lookup` now
queries the real `bvn_records`/`bvn_accounts` tables instead of generating
random accounts. Known issues already fixed: CORS origin mismatch, a
hardcoded `"fallback"` string being sent as `estate_id` instead of a real
UUID, and a stale column reference (`bvn_accounts.provider`) from before the
schema was finalized. If you see errors resembling these three, check
whether they're regressions before treating them as new bugs.

Test BVNs available: `22212345671` through `22212345680`, each with 2
distinct bank accounts and a real phone number attached.