# Backend

This directory contains the FastAPI backend for TORQUE.

## Current Scope

Sprint 0 initializes the backend application structure and exposes a versioned health-check endpoint.

## Environment Configuration

The backend uses environment variables for application configuration.

Create a local `.env` file from the example:

```bash
cp .env.example .env
```

For local frontend development, `CORS_ORIGINS` should include the Vite dev server origins:

```env
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

## Database Setup

TORQUE uses SQLAlchemy 2.x with asynchronous sessions for database access.
The selected MySQL driver is `aiomysql`, using the `mysql+aiomysql` SQLAlchemy URL scheme.

For local development, install and start MySQL 8 on your machine, then create the development database and user:

```sql
CREATE DATABASE torque_db;
CREATE USER 'torque_user'@'localhost' IDENTIFIED BY 'change_me';
GRANT ALL PRIVILEGES ON torque_db.* TO 'torque_user'@'localhost';
FLUSH PRIVILEGES;
```

The application builds the database URL from these environment variables:

- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`

The reusable FastAPI database session dependency is defined in `app/db/session.py`.
Database connectivity logic is kept outside route handlers in `app/db/health.py`.

To verify connectivity:

1. Start the local MySQL 8 service.
2. Start FastAPI with `uvicorn app.main:app --reload`.
3. Open `http://localhost:8000/api/v1/health/database`.
4. Confirm the response is `{"status":"ok","service":"torque-database"}`.
5. Stop the local MySQL service.
6. Open the database health endpoint again and confirm it returns HTTP 503 with a controlled error message.

## Database Migrations

TORQUE uses Alembic for controlled database schema changes.
FastAPI startup does not create or recreate database tables automatically.

Run migration commands from the `backend` directory:

```bash
alembic current
alembic revision --autogenerate -m "describe schema change"
alembic upgrade head
alembic downgrade -1
```

The Alembic environment reads the same database settings as the application from `.env`.
SQLAlchemy metadata is provided by `app/db/base.py` and model imports under `app/db/models`.

Migration workflow:

1. Update SQLAlchemy models.
2. Generate a migration with `alembic revision --autogenerate`.
3. Review the generated file in `migrations/versions`.
4. Apply it with `alembic upgrade head`.
5. Confirm the database change.
6. Roll it back with `alembic downgrade -1`.
7. Confirm the rollback.
8. Apply it again before committing if the schema should remain at the new head.

## Code Quality

Ruff is configured as the backend linter and formatter in `pyproject.toml`.
Generated Alembic migration version files are excluded from Ruff checks.

Run backend quality commands from the `backend` directory:

```bash
python -m ruff check .
python -m ruff format .
python -m ruff format --check .
python -m pytest
```

## Password Hashing

TORQUE hashes user passwords with Argon2id through `pwdlib`. The shared
`app/core/security.py` utility creates salted password hashes and verifies
submitted passwords against stored hashes.

Plain-text passwords and password hashes must not be logged or returned in API
responses. Password-policy validation, user creation, and login behavior are
handled separately from the hashing utility.

## Login Configuration

The login endpoint is available at `POST /api/v1/auth/login`. Successful login
returns a short-lived JWT access token and sets the persistent refresh token in
an HttpOnly cookie. The raw refresh token is never returned in JSON, and only
its hash is stored in `user_sessions`.

Configure authentication through `backend/.env`:

```env
JWT_SECRET_KEY=replace_with_at_least_32_random_characters
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_SESSION_EXPIRE_DAYS=10
REFRESH_COOKIE_NAME=torque_refresh_token
```

The access-token lifetime must remain between 15 and 30 minutes. Refresh
sessions have a fixed 10-day lifetime. The refresh cookie is marked `Secure`
outside local development.

## Setup

Create and activate a virtual environment:

```bash
python -m venv .venv
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API Endpoints can be accessed at `http://localhost:8000/`.
Health check endpoint can be accessed at `http://localhost:8000/api/v1/health`.
Swagger documentation can be accessed at `http://localhost:8000/docs`.

Planned responsibilities:

- Authentication and authorization
- Customer and vehicle management
- Job card workflow
- Inventory management
- Billing and invoice operations
- Dashboard APIs
- Predictive maintenance API endpoint
- Database access through SQLAlchemy
- Schema migrations through Alembic
