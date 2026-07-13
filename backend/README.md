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
