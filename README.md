# Library Change Readiness Assessment

A redesigned version of your assessment tool, now built on Next.js so it can save
results from a cohort of participants to a shared database, in addition to the
existing individual PDF summary.

## What's new

- **Redesign**: new type system, color palette, and layout — same content, tightened
  from 32 to 24 questions (3 per domain instead of 4; see the domain data in
  `lib/domains.ts` if you want to tweak wording further).
- **Cohort backend**: when someone selects "Generate summary," their results save to
  a small Postgres database.
- **Facilitator dashboard** at `/facilitator`, protected by a passcode, showing the
  cohort's aggregate scores and a table of individual submissions, with a CSV export.

Nothing about the scoring logic changed — same 1–3 scale, same thresholds
(< 1.75 High risk, 1.75–2.49 At risk, ≥ 2.5 Strength).

## Deploying this (no coding required)

### 1. Get this code into GitHub

If you're comfortable with git:

```bash
cd library-change-readiness-assessment
git init
git add .
git commit -m "Redesign with cohort backend"
git remote add origin <your-repo-url>
git push -u origin main
```

If you'd rather not use the command line: go to your GitHub repo in the browser,
delete the old files (or create a new repo), then drag every file and folder from
this download into the GitHub web uploader and commit.

### 2. Point Vercel at it

- If you already have a Vercel project for this app: open it in the Vercel
  dashboard → **Settings → Git** → make sure it's connected to the GitHub repo you
  just pushed to. Vercel will redeploy automatically.
- If you're starting a new Vercel project instead: go to
  [vercel.com/new](https://vercel.com/new), import the GitHub repo, and click Deploy.
  No configuration needed — Vercel detects Next.js automatically.

### 3. Connect a database (for the cohort backend)

This is the one manual step, and it's a few clicks:

1. Open your project in the Vercel dashboard.
2. Go to the **Storage** tab.
3. Click **Connect Database** → choose **Neon** (Postgres) → **Create**.
4. That's it — Vercel automatically sets the `DATABASE_URL` environment variable for
   you. The app creates its own database table the first time someone submits a
   response, so there's no manual database setup.
5. Redeploy the project (Vercel usually does this automatically after connecting
   storage; if not, go to **Deployments** and click **Redeploy** on the latest one).

### 4. Set your facilitator passcode

- In the Vercel dashboard: **Settings → Environment Variables**.
- Add a variable named `FACILITATOR_PASSWORD` with whatever passcode you want to
  give facilitators for `/facilitator`.
- If you skip this step, the default passcode is `readiness2026` — fine for testing,
  but change it before running a real workshop.
- Redeploy after adding or changing environment variables.

### 5. Test it

- Visit your site, fill out the assessment, and click **Generate summary**. You
  should see "Saved to cohort results" near the download button.
- Visit `/facilitator`, enter your passcode, and confirm the submission shows up.

## Local development (optional)

```bash
npm install
npm run dev
```

Create a `.env.local` file (see `.env.example`) with a `DATABASE_URL` if you want to
test the backend locally — Vercel's project settings page will show you the
connection string once a database is connected.

## Project structure

```
app/
  page.tsx              the assessment itself
  facilitator/page.tsx   passcode-gated cohort dashboard
  api/submit/route.ts    saves a completed assessment
  api/results/route.ts   returns cohort aggregates (passcode-checked)
lib/
  domains.ts             the 24 questions, organized by 8 domains
  scoring.ts             all scoring/aggregation logic (shared by client + API)
  db.ts                  database connection + schema setup
  pdf.ts                 individual PDF export
  csv.ts                 facilitator CSV export
components/
  StampBadge.tsx          the status indicator (Strength/At risk/High risk)
  AggregateGrid.tsx        the 4-bucket summary grid
  ProgressBar.tsx
```
