# Backend

This directory contains the FastAPI backend for TORQUE.

## Current Scope

Sprint 0 initializes the backend application structure and exposes a versioned health-check endpoint.

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
