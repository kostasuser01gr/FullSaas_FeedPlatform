# Security & Code Scanning

This repository uses **GitHub Code Scanning (CodeQL)** on every pull request
and on a weekly schedule (Monday 03:00 UTC).

## How it works

- CodeQL analyses JavaScript/TypeScript source on every PR and push to `main`.
- Security alerts appear in **Security → Code scanning alerts** and as PR
  annotations.
- **Copilot Autofix** may suggest patches directly on certain alerts.
  Always review the suggestion and run tests before merging — do not rely
  solely on automated fixes for high-risk changes.

## Scope

| Language              | Directories |
| --------------------- | ----------- |
| JavaScript/TypeScript | `backend/`, `frontend/` |

## Reporting vulnerabilities

If you discover a security vulnerability, please email
**security@your-domain.com** or open a private advisory via
GitHub's Security tab. Do not file a public issue.
