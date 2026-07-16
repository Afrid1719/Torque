# TORQUE

TORQUE is an intelligent automobile workshop and service management system with predictive maintenance support.

The project is developed as a modular full-stack application using React, FastAPI, MySQL, SQLAlchemy, Alembic, and Scikit-Learn.

## Repository Structure

```text
torque/
|-- frontend/   # React single-page application
|-- backend/    # FastAPI backend API
|-- ml/         # Machine learning notebooks, datasets, and model artifacts
|-- docs/       # Architecture notes, diagrams, and project documentation
|-- .github/    # GitHub templates and repository workflow files
`-- README.md   # Project overview and local development setup
```

## Prerequisites

Install these tools before running the project locally:

- Git
- Python 3.12 or newer
- Node.js 20 or newer
- npm
- MySQL 8

On Windows, MySQL may be installed as a service named `MySQL80`.

## Clone the Repository

```bash
git clone https://github.com/Afrid1719/Torque.git
cd Torque
```

## Backend Setup

Create and activate a virtual environment:

```bash
cd backend
python -m venv .venv
```

Windows Command Prompt:

```cmd
.venv\Scripts\activate
```

PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

macOS or Linux:

```bash
source .venv/bin/activate
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

Create local environment configuration:

```bash
cp .env.example .env
```

On Windows Command Prompt:

```cmd
copy .env.example .env
```

Update `backend/.env` if your local MySQL username, password, host, port, or database name differ from the example values.

Windows Command Prompt quick start from the repository root:

```cmd
cd /d path\to\Torque\backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

## MySQL Setup

Start MySQL 8 locally, then create the development database and user.

Connect as a MySQL admin user:

```bash
mysql -u root -p
```

Run:

```sql
CREATE DATABASE IF NOT EXISTS torque_db;
CREATE USER IF NOT EXISTS 'torque_user'@'localhost' IDENTIFIED BY 'change_me';
GRANT ALL PRIVILEGES ON torque_db.* TO 'torque_user'@'localhost';
FLUSH PRIVILEGES;
```

If you use different credentials, update `backend/.env` to match.

## Database Migrations

Apply database migrations from the `backend` directory:

```bash
alembic upgrade head
```

Useful migration commands:

```bash
alembic current
alembic revision --autogenerate -m "describe schema change"
alembic upgrade head
alembic downgrade -1
```

FastAPI startup does not create or recreate tables automatically. Schema changes must go through Alembic migrations.

## Run the Backend

From the `backend` directory:

```bash
uvicorn app.main:app --reload
```

Windows Command Prompt:

```cmd
cd /d path\to\Torque\backend
.venv\Scripts\activate
uvicorn app.main:app --reload
```

Backend URLs:

- API root: `http://localhost:8000/`
- API docs: `http://localhost:8000/docs`
- API health: `http://localhost:8000/api/v1/health`
- Database health: `http://localhost:8000/api/v1/health/database`

## Frontend Setup

Open a second terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Windows Command Prompt:

```cmd
cd /d path\to\Torque\frontend
copy .env.example .env
npm install
npm run dev
```

The frontend reads the backend API origin from `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Do not store backend secrets in frontend environment variables. Values prefixed with `VITE_` are browser-visible.

Vite prints the local frontend URL in the terminal, usually:

```text
http://localhost:5173/
```

Unauthenticated users are redirected to `/login`. Successful login redirects to
the Dashboard entry point at `/`. The login page includes a server connection
indicator backed by the health endpoint.

To confirm the frontend development environment can reach the backend health endpoint, keep the backend running and run this from the `frontend` directory:

```bash
node -e "fetch('http://localhost:8000/api/v1/health').then(r => r.json()).then(console.log)"
```

Expected response:

```text
{ status: 'ok', service: 'torque-api' }
```

## Verification Checklist

Use this checklist after setting up a local environment:

- Backend dependencies install successfully.
- `backend/.env` exists and contains local MySQL settings.
- MySQL 8 is running.
- `alembic upgrade head` succeeds.
- `uvicorn app.main:app --reload` starts the backend.
- `http://localhost:8000/api/v1/health` returns `{"status":"ok","service":"torque-api"}`.
- `http://localhost:8000/api/v1/health/database` returns `{"status":"ok","service":"torque-database"}`.
- Frontend dependencies install successfully.
- `npm run dev` starts the Vite development server.
- The frontend health check command reaches `http://localhost:8000/api/v1/health`.

## Pull Request Checks

Pull requests targeting `develop` or `main` run GitHub Actions checks for the backend and frontend.

The backend check installs `backend/requirements.txt`, verifies the FastAPI app imports, runs Ruff lint and format checks, and runs `pytest` with coverage. Backend coverage must stay at or above 60%.

The frontend check installs dependencies with `npm ci`, runs ESLint, checks Prettier formatting, runs Vitest with coverage, and builds the production frontend. Frontend coverage must stay at or above 60%.

The CI workflow uses dummy testing environment variables and does not use production secrets or deployment steps.

## Code Quality Commands

Run backend quality checks from the `backend` directory:

```bash
python -m ruff check .
python -m ruff format --check .
python -m pytest
```

Format backend code with:

```bash
python -m ruff format .
```

Run frontend quality checks from the `frontend` directory:

```bash
npm run lint
npm run format:check
npm test
```

Format frontend code with:

```bash
npm run format
```

## Troubleshooting

If database health returns `unavailable`, confirm:

- MySQL 8 is running.
- `backend/.env` matches your local MySQL credentials.
- `torque_db` exists.
- Migrations have been applied with `alembic upgrade head`.
- FastAPI was restarted after changing `.env`.

If the login page reports `Server unavailable`, confirm:

- FastAPI is running at the origin configured by `VITE_API_BASE_URL`.
- `frontend/.env` contains only the backend origin, such as `http://localhost:8000`.
- `backend/.env` allows the Vite dev origin in `CORS_ORIGINS`.

If Alembic reports a migration failure, read the final error line. Common causes include invalid credentials, a missing database, or MySQL-specific schema issues such as `String` columns without a length.

If `mysql`, `python`, or `node` commands are not found, add the tool to your system `PATH` or run it by full installation path.
