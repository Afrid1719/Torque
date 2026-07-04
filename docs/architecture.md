## Request and Response Flow

A request moves through the following layers:

User
→ React Frontend
→ API Client
→ FastAPI Router
→ Authentication and RBAC
→ Pydantic Validation
→ Service Layer
→ Repository Layer
→ SQLAlchemy Session
→ MySQL

The response returns through the repository and service layers, is serialized through a Pydantic response schema, and is returned to the frontend as JSON.

Errors from authentication, validation, business rules, or database operations are handled centrally and converted into controlled API responses.
