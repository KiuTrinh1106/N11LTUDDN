# Final Submission: Runnable Auth and Release Slice

The application uses a PostgreSQL-backed FastAPI backend and a Vite/React frontend. The protected example is the Review approval workflow. Authorization is decided by the API for every request.

## Run Locally

Prerequisites: Python 3.10+, Node.js 20.6+, npm 10+, and PostgreSQL 15+.

1. Install the existing dependencies and create a local environment file:

   ```powershell
   npm ci
   Copy-Item .env.example .env
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   npm run api:install
   ```

2. Set a local PostgreSQL `DATABASE_URL`, generate a unique `AUTH_SECRET` of at least 32 characters, and set a local `DEMO_PASSWORD` of at least 12 characters. The seed command stops if `DEMO_PASSWORD` is missing or still a placeholder. The same locally configured demo password is used for all four seeded roles.

3. Apply the migration, generate Prisma Client, and seed demo data:

   ```powershell
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

4. Start the FastAPI backend:

   ```powershell
   npm run dev:api
   ```

   For the main application, start Vite in a second terminal with `npm run dev` and open `http://localhost:5173/`. The API health check is `http://127.0.0.1:3000/api/health`. The backend also serves the standalone auth demo at `http://127.0.0.1:3000/`. Sign in as Reader and press **Thử Approve request mẫu** to see the API return `403 FORBIDDEN`. Sign in as Reviewer or Admin and use the same action; the API changes the pending request to `APPROVED` and writes an audit event in one database transaction. Reseed to restore the pending sample.

## API and Security

- `POST /api/auth/login`, `GET /api/auth/me`, and `POST /api/auth/logout` provide credentials login, session lookup, and revocable signed bearer sessions.
- `GET /api/reviews` and `POST /api/reviews/:id/approve|reject` require Reviewer/Admin permissions enforced in the backend.
- Passwords are stored as salted scrypt hashes. Session secrets are supplied through environment configuration; the browser receives no database or provider secrets.
- Denied review actions are recorded as `DENIED`; successful decisions and their `SUCCESS` audit events commit atomically.
- Demo users and the shared password are for local evaluation only. Replace/remove them and use the deployment secret manager before exposing any public environment.

## Verification

Run the Python backend tests and existing repository gates:

```powershell
python -m pytest backend/tests
npm test
npm run lint
npm run typecheck
npm run build
```

The API tests cover successful Reviewer approval, Reader denial with an audit record, and session revocation. Migration/seed execution requires a reachable PostgreSQL database.

## Deploy to Render

The root `render.yaml` Blueprint deploys branch `Thơ` as a single FastAPI web service with the built Vite frontend and a PostgreSQL database. In Render, create a new Blueprint from this GitHub repository and select branch `Thơ`. Provide a unique `DEMO_PASSWORD` of at least 12 characters when prompted; Render generates `AUTH_SECRET` and supplies the database connection string. The first service start applies migrations and seeds the demo users only when the demo author account does not exist.

The free web service may spin down when idle, and the free PostgreSQL database is temporary and expires after its trial period. Do not use this setup for production data. After deployment, open the service URL and sign in with `author@demo.local` (or another `*@demo.local` account) and the configured `DEMO_PASSWORD`. The backend dashboard remains available at `/backend-dashboard`.

## Repository, Contribution, and Release Evidence

Repository: [github.com/KiuTrinh1106/N11LTUDDN](https://github.com/KiuTrinh1106/N11LTUDDN).

Do not invent contribution evidence. Each student should create a branch, make their own changes, and open a PR under their own account. In the final submission record, link each person to the PR and commit SHA they authored, summarize their changed files, and retain review/merge status. For example:

| Student | Owned work | PR | Commit SHA | Review status |
| --- | --- | --- | --- | --- |
| Tho | Product/QA/release evidence actually completed | Add real URL | Add real SHA | Add actual status |
| Trinh | Vault/AI/core implementation actually completed | Add real URL | Add real SHA | Add actual status |

Only tag a validated, deployed commit after the team verifies the production URL and smoke tests:

```bash
git tag -a v1.0.0-final -m "Final course release"
git push origin v1.0.0-final
```

The repository URL is now recorded above. The final hand-in still needs real merged PR/commit evidence for each student, a deployed demo URL, and the pushed `v1.0.0-final` tag. Do not fill these with placeholders or claim work that was not actually done.