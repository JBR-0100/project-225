# 🚀 DriveFlow — Deployment Guide (Railway + Supabase)

> Step-by-step checklist for deploying DriveFlow from your laptop to a live URL, using **Supabase** (free managed PostgreSQL) and **Railway** (one-click from GitHub).

---

## Phase 1: Set Up a Free PostgreSQL Instance on Supabase

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in with GitHub
2. Click **"New Project"**
3. Fill in:
   - **Name:** `driveflow-db`
   - **Database Password:** Generate a strong one — **save this somewhere safe**
   - **Region:** Pick the one closest to your users
4. Click **"Create new project"** and wait ~2 minutes for provisioning

### 1.2 Get Your Connection String

1. In your Supabase dashboard, go to **Settings → Database**
2. Scroll to **"Connection string"** → select the **URI** tab
3. Copy the connection string. It looks like:
   ```
   postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
4. Replace `[YOUR-PASSWORD]` with the database password you set in step 1.1

> [!IMPORTANT]
> Use the **"Transaction Mode" (port 6543)** connection string — this is optimized for serverless/short-lived connections like Railway.

### 1.3 Allow External Connections

Supabase allows all IPs by default for the pooler connection. No firewall changes needed — but verify:

1. Go to **Settings → Database → Network**
2. Ensure "Allow all IPs" is enabled (it should be by default)

---

## Phase 2: Move Hardcoded Strings into `.env`

### 2.1 Create Your Production `.env` Variables

Your project already reads from `process.env` — you just need to set the right values.

Here are the variables DriveFlow needs:

| Variable | Local (Dev) | Production |
|---|---|---|
| `DATABASE_URL` | `file:./dev.db` | `postgresql://postgres.[ref]:[password]@...` |
| `JWT_SECRET` | `secret` (hardcoded fallback) | A random 64-char string |
| `PORT` | `3000` | Set by Railway automatically |

### 2.2 Generate a Secure JWT Secret

Run this in your terminal to generate a proper secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output — you'll paste it into Railway in the next phase.

### 2.3 Update Prisma for PostgreSQL

Your Prisma schema currently uses SQLite. For production, switch the provider:

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"    // ← Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

> [!WARNING]
> After changing the provider, **do not run `prisma migrate dev`** against your production database. Use `prisma migrate deploy` instead (Railway will handle this — see Phase 3).

### 2.4 Add Build & Start Scripts to `package.json`

Railway needs to know how to build and start your app:

```json
{
  "scripts": {
    "build": "npx prisma generate && tsc",
    "start": "node dist/server.js",
    "dev": "ts-node src/server.ts",
    "migrate:deploy": "npx prisma migrate deploy"
  }
}
```

Also make sure `tsconfig.json` has output configured:

```json
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist"
  }
}
```

---

## Phase 3: Deploy to Railway from GitHub

### 3.1 Push Your Code to GitHub

Make sure everything is committed and pushed:

```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### 3.2 Link GitHub to Railway

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub Repo"**
3. Select your `project-223` repository
4. Railway will auto-detect it as a Node.js project

### 3.3 Set Environment Variables in Railway

In your Railway project dashboard:

1. Click on your service → **"Variables"** tab
2. Add these three variables:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | Your Supabase connection string from Phase 1.2 |
   | `JWT_SECRET` | The 64-char hex string from Phase 2.2 |
   | `PORT` | `3000` |

### 3.4 Configure Build & Start Commands

In the Railway service **"Settings"** tab:

| Setting | Value |
|---|---|
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run migrate:deploy && npm run start` |

> This ensures migrations are applied on every deploy, then the server starts.

### 3.5 Deploy & Get Your URL

1. Railway auto-deploys when you push to `main`
2. Go to **Settings → Networking → Generate Domain**
3. Your API is now live at: `https://your-app.up.railway.app`

Test it:
```bash
curl https://your-app.up.railway.app/api/v1/health
```

---

## ⚠️ Common Beginner Gotchas

### 1. "Connection refused" or "Cannot connect to database"
- **Cause:** Wrong connection string or missing `?pgbouncer=true` parameter
- **Fix:** Use the **Transaction Mode** URI from Supabase (port `6543`), and append `?pgbouncer=true&connection_limit=1` to your `DATABASE_URL`:
  ```
  postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
  ```

### 2. Railway says "No start command found"
- **Cause:** Missing `start` script in `package.json`
- **Fix:** Add `"start": "node dist/server.js"` to your scripts

### 3. "Port already in use" or app crashes on start
- **Cause:** Hardcoded port that conflicts with Railway's assigned port
- **Fix:** Always use `process.env.PORT`:
  ```typescript
  const PORT = process.env.PORT || 3000;
  ```
  Your `server.ts` already does this — you're safe ✅

### 4. "Migration failed" on first deploy
- **Cause:** Running `prisma migrate dev` against production (creates shadow databases)
- **Fix:** Always use `prisma migrate deploy` in production. This applies existing migrations without creating shadow databases. The `migrate:deploy` script handles this.

### 5. "Cannot find module './dist/server.js'"
- **Cause:** `tsconfig.json` missing `outDir` and `rootDir`
- **Fix:** Uncomment/add these in `tsconfig.json`:
  ```json
  "rootDir": "./src",
  "outDir": "./dist"
  ```

### 6. `.env` file pushed to GitHub
- **Cause:** Missing `.gitignore` entry
- **Fix:** Ensure your `.gitignore` includes:
  ```
  .env
  node_modules/
  dist/
  ```
  **Never push secrets to GitHub.** Use Railway's Variables panel instead.

### 7. Prisma Client not generated in production
- **Cause:** `prisma generate` not in the build step
- **Fix:** The build script `"npx prisma generate && tsc"` handles this — Prisma Client is generated before TypeScript compiles.

---

## 📋 Pre-Deploy Checklist

```
[ ] Supabase project created & connection string copied
[ ] DATABASE_URL, JWT_SECRET, PORT set in Railway Variables
[ ] prisma/schema.prisma provider changed to "postgresql"
[ ] package.json has build, start, and migrate:deploy scripts
[ ] tsconfig.json has rootDir and outDir set
[ ] .env is in .gitignore
[ ] Code pushed to GitHub
[ ] Railway linked to GitHub repo
[ ] Railway build & start commands configured
[ ] curl /api/v1/health returns 200 ✅
```
