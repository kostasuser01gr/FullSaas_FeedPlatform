# Org-wide Checklist — Enabling Code Scanning & Quality Gates

Use this checklist every time you on-board a new repo.

## Pre-requisites

- [ ] GitHub Advanced Security licence enabled on the org (required for
      private repos; free for public).
- [ ] `gh` CLI authenticated with `repo` + `admin:repo_hook` scopes.

## Per-repo steps

### 1. Enable CodeQL Code Scanning

**Option A — Default Setup (recommended for most repos)**

1. Go to **Settings → Security → Code security and analysis**.
2. Under **Code scanning**, click **Set up → Default**.
3. Review the detected languages and click **Enable CodeQL**.

**Option B — Advanced Setup**

1. Copy `.github/workflows/codeql.yml` from this repo (or use the
   reusable workflow below).
2. Adjust the `matrix.language` list for the repo's languages.
3. Open a PR and merge.

### 2. Install Sentry Copilot Extension

1. Install **Sentry for VS Code / Codespaces** from the Marketplace.
2. Link to your Sentry project (`sentry.io → Settings → Integrations → GitHub`).
3. In any PR, use Copilot Chat:
   - `@sentry What errors hit production from this PR?`
   - `@sentry Suggest a fix for the latest unhandled TypeError`
   - `@sentry Generate tests for the fix in commit abc1234`

### 3. Install Docker Copilot Extension (if Docker in use)

1. Install **Docker for GitHub Copilot** extension.
2. Example prompts:
   - `@docker Optimise this Dockerfile with multi-stage build`
   - `@docker Add healthcheck to my Compose service`
   - `@docker Scan this image for vulnerabilities`

### 4. Branch Protection — Required Status Checks

Apply via UI:

1. **Settings → Branches → Branch protection rules → Add rule** for `main`.
2. Enable **Require status checks to pass before merging**.
3. Search and add: `code-scanning`, `backend`, `frontend`, `docker`.
4. Enable **Require branches to be up to date before merging**.
5. Enable **Enforce for administrators**.

Or apply via CLI:

```bash
gh api \
  -X PUT \
  -H "Accept: application/vnd.github+json" \
  /repos/<OWNER>/<REPO>/branches/main/protection \
  -f required_status_checks='{"strict":true,"contexts":["code-scanning","backend","frontend"]}' \
  -f enforce_admins=true \
  -f 'restrictions=null' \
  -f 'required_pull_request_reviews=null'
```

### 5. Reusable CodeQL Workflow

Place `org/reusable-codeql.yml` in `<OWNER>/.github/.github/workflows/`
so all repos can call it:

```yaml
jobs:
  security:
    uses: <OWNER>/.github/.github/workflows/reusable-codeql.yml@main
    secrets: inherit
```

---

**Once all boxes are checked, the repo is fully on-boarded.**
