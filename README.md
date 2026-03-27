# Campus Connect

Campus event management app for colleges (multi-tenant).

## Local Setup

1. **Supabase:**
   - Create project at supabase.com
   - Copy migrations/*.sql to SQL Editor, run.
   - Dashboard > Settings > API: URL/pub key to `.env.local`:
     ```
     VITE_SUPABASE_URL=https://yourproj.supabase.co
     VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
     ```
   - Auth: Enable email, confirmations OFF for demo.

2. **Run:**
   ```
   npm i
   npm run dev
   ```

3. **Seed colleges:** Run 2nd migration seed.

## Demo

- Signup any role (no college select).
- Forgot pwd sends email link.
- Student: register events.
- HOD: add event/venue.
- Admin: approve venues/events.

Live: localhost:5173
