# FullSaas FeedPlatform

A production-grade social feed web application built with **Next.js 14** (App Router), **PostgreSQL** + **Knex**, **JWT auth**, and **TailwindCSS** — optimized for **Vercel** deployment.

## Features

- Cursor-based paginated feed (50k+ posts via `react-virtuoso`)
- Full-text search with PostgreSQL GIN indexes
- JWT httpOnly cookie authentication (register / login / logout)
- Like toggle & threaded comments
- Sort by date or popularity
- Responsive, accessible UI with TailwindCSS
- Server Components for initial data fetch with graceful fallback

## Tech Stack

| Layer      | Technology                         |
|------------|------------------------------------|
| Framework  | Next.js 14 (App Router)            |
| Database   | PostgreSQL + Knex query builder    |
| Auth       | JWT (jsonwebtoken) + bcryptjs      |
| Validation | Zod                                |
| State      | Zustand (auth + feed stores)       |
| Styling    | TailwindCSS                        |
| Deploy     | Vercel (serverless functions)      |

## Getting Started

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL and JWT_SECRET

# Run migrations & seed
npx knex migrate:latest --knexfile knexfile.ts
npx knex seed:run --knexfile knexfile.ts

# Start dev server
npm run dev
```

### Environment Variables

| Variable       | Description                                    |
|----------------|------------------------------------------------|
| `DATABASE_URL` | PostgreSQL connection string (with `?sslmode=require` for production) |
| `JWT_SECRET`   | Secret key for JWT signing                     |

## Project Structure

```
src/
├── app/                  # Next.js App Router pages & API routes
│   ├── api/              # REST API endpoints
│   │   ├── auth/         # login, register, logout, me
│   │   └── posts/        # CRUD, likes, comments
│   ├── page.tsx          # Server Component feed page
│   ├── FeedClient.tsx    # Client Component interactive feed
│   ├── login/            # Login page
│   └── register/         # Register page
├── components/           # React UI components
├── hooks/                # Custom hooks (useDebounce)
├── lib/                  # Core utilities (db, auth, errors, validation)
├── services/             # Business logic layer
├── stores/               # Zustand stores
└── types/                # TypeScript type definitions
db/
├── migrations/           # Knex migration files
└── seeds/                # Seed data (10 users, 200 posts)
```

---

## Quality Gates & Autofix

### Code Scanning (CodeQL)

This repo uses **GitHub Code Scanning with CodeQL** on every PR and weekly (Monday 03:00 UTC).

- Alerts appear under **Security → Code scanning alerts** and as PR annotations.
- **Copilot Autofix** automatically suggests patches for detected vulnerabilities directly on alerts. Always review and test before merging.

**Enabling Default Setup (UI):**
1. Go to **Settings → Security → Code security and analysis**
2. Under **Code scanning**, click **Set up** → **Default**
3. CodeQL will auto-detect languages and run on PRs + weekly

If Default Setup is unavailable, the repo includes [`.github/workflows/codeql.yml`](.github/workflows/codeql.yml) for advanced setup.

### Sentry Copilot Extension

Use the **Sentry for GitHub Copilot** extension to surface production errors directly in your IDE/PR workflow:

1. **Install**: Search "Sentry" in VS Code / Codespaces Marketplace → Install
2. **Connect**: Link your Sentry project via the extension settings (Sentry DSN + auth token)
3. **In PRs**: The extension surfaces error insights, suggests fixes, and can generate unit tests
4. **Prompts**:
   - `@sentry What errors are related to this PR?`
   - `@sentry Suggest a minimal fix and generate tests for commit <SHA>`
   - `@sentry Show recent unhandled exceptions affecting the feed endpoint`

### Docker Copilot

If you use Docker with this project:

1. **Install**: Search "Docker" in VS Code Marketplace → Install the Docker extension
2. **Prompts for Dockerfile optimization**:
   - `@docker Optimize this Dockerfile for a Next.js production build with multi-stage`
   - `@docker Add a healthcheck to my Next.js container`
   - `@docker Scan this image for vulnerabilities`
   - `@docker Convert this to a multi-stage build with standalone output`

### Required Status Checks (Branch Protection)

Protect `main` by requiring these checks to pass before merge:

1. Go to **Settings → Branches → Branch protection rules**
2. Click **Add rule** for branch `main`
3. Enable **Require status checks to pass before merging**
4. Add these required checks:
   - `code-scanning` (CodeQL)
   - `build-and-test` (CI)

**GH-CLI quick setup:**

```bash
gh api \
  -X PUT \
  -H "Accept: application/vnd.github+json" \
  /repos/<OWNER>/FullSaas_FeedPlatform/branches/main/protection \
  -f required_status_checks[strict]=true \
  -f 'required_status_checks[contexts][]=code-scanning' \
  -f 'required_status_checks[contexts][]=build-and-test' \
  -f enforce_admins=true \
  -f restrictions=
```

### Org-Wide Reusable Workflow

A reusable CodeQL workflow is provided in [`org/reusable-codeql.yml`](org/reusable-codeql.yml). To use it across all repos:

1. Copy `org/reusable-codeql.yml` to your org's `.github` repo at `.github/workflows/reusable-codeql.yml`
2. In each repo, create a caller workflow:

```yaml
name: org-ci
on: [pull_request]
jobs:
  security:
    uses: <OWNER>/.github/.github/workflows/reusable-codeql.yml@main
    secrets: inherit
```

See [`org/_org_checklist.md`](org/_org_checklist.md) for the full org-level setup checklist.

---

## Deployment (Vercel)

1. Connect your GitHub repo in the [Vercel Dashboard](https://vercel.com)
2. Set environment variables: `DATABASE_URL` (with `?sslmode=require`), `JWT_SECRET`
3. Deploy — Vercel auto-detects Next.js and builds

### Production Database

For serverless PostgreSQL, use [Neon](https://neon.tech) or [Supabase](https://supabase.com). The Knex config automatically enables SSL in production with `rejectUnauthorized: false` for managed databases.

## License

MIT