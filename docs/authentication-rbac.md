# Authentication and RBAC Design

## Purpose and Scope

This document defines the authentication and role-based access control (RBAC) design for the TORQUE MVP. It guides later FastAPI and React implementation work; it does not introduce application behavior, database models, API routes, or frontend screens.

TORQUE is a modular monolith with a FastAPI backend, a React frontend, and MySQL persistence. The backend API is versioned under `/api/v1`.

## Authentication and Authorization

Authentication establishes who a user is. A user authenticates with credentials, and the backend returns proof of that identity in the form of a signed access token.

Authorization establishes what an authenticated user may do. TORQUE uses the user's assigned role and, where necessary, the requested resource to decide whether an operation is allowed.

These concerns must remain separate:

- A valid access token proves identity but does not grant unrestricted access.
- Every protected backend operation must perform authorization after authentication.
- Frontend route guards and hidden controls improve the user experience but are not security boundaries.

## Supported Roles

Each MVP user has exactly one role. Role identifiers used by the backend should be stable machine-readable values, while the frontend displays their human-readable names.

| Role identifier | Display name | Primary responsibility |
| --- | --- | --- |
| `workshop_manager` | Workshop Manager | Oversees workshop operations, staff access, assignments, billing, inventory, and reporting. |
| `service_advisor` | Service Advisor | Manages customer intake, vehicles, job cards, estimates, customer communication, and service completion. |
| `mechanic` | Mechanic | Performs assigned work and records diagnostics, work progress, labor, and parts usage. |

## Permission Boundaries

The following matrix defines the MVP role boundaries. A future implementation may express these rules as named permissions, but it must preserve the behavior described here.

| Capability | Workshop Manager | Service Advisor | Mechanic |
| --- | --- | --- | --- |
| View workshop dashboard | Full workshop view | Service and customer workflow view | Own assigned-work view |
| Manage staff users and role assignments | Allowed | Not allowed | Not allowed |
| View customers and vehicles | Allowed | Allowed | Limited to information required for assigned job cards |
| Create or update customers and vehicles | Allowed | Allowed | Not allowed |
| Create job cards | Allowed | Allowed | Not allowed |
| Assign or reassign job cards | Allowed | Allowed | Not allowed |
| View job cards | All job cards | All service job cards | Assigned job cards only |
| Update diagnosis, work progress, labor, and parts usage | Allowed | May update service-facing status, not mechanic work records | Assigned job cards only |
| Approve overrides or exceptional workflow changes | Allowed | Not allowed | Not allowed |
| View inventory availability | Allowed | Allowed | Allowed when recording work on an assigned job card |
| Manage inventory records and adjustments | Allowed | Not allowed | Not allowed |
| Prepare estimates and invoices | Allowed | Allowed | Not allowed |
| Approve billing overrides or discounts | Allowed | Not allowed | Not allowed |
| View operational and financial reports | Allowed | Limited to service operations | Not allowed |

Role checks alone are insufficient for resource-scoped rules. For example, a mechanic has permission to update work records, but only for a job card currently assigned to that mechanic. The backend must verify both the role-level permission and resource relationship.

Permission decisions follow a default-deny policy. An action is denied unless the role and resource rules explicitly allow it.

## MVP Authentication Flow

The planned authentication flow is:

1. The user submits a username and password from the React login form over HTTPS to the planned `/api/v1/auth/login` endpoint.
2. FastAPI normalizes the username, loads the corresponding active user, and verifies the submitted password against the stored password hash.
3. Invalid credentials and inactive accounts receive the same generic authentication failure response so that account existence is not disclosed.
4. After successful verification, the backend issues a signed, short-lived JWT access token.
5. The frontend keeps the access token in application memory and sends it to protected API endpoints as `Authorization: Bearer <token>`.
6. For each protected request, the backend validates the token and resolves the current user before applying role and resource authorization rules.
7. Logout removes the access token from frontend memory. Because the MVP has no refresh token or persistent session, an expired token requires the user to authenticate again.

The frontend must never send a role, user ID, or permission value that the backend treats as authoritative. Identity comes from the validated token, and current account state and authorization data come from backend-controlled data.

## JWT Access Token Strategy

The MVP uses a single JWT bearer access token with these rules:

- Tokens are signed with `HS256`, suitable for the single TORQUE backend that both issues and validates tokens.
- The signing secret must contain at least 256 bits of cryptographically secure random data, be supplied through backend environment configuration, and never be committed or exposed to the frontend.
- Access tokens expire after 30 minutes. The lifetime should be configurable by backend environment settings without being controlled by the client.
- Required claims are `sub` for the immutable user identifier, `iat` for issue time, `exp` for expiry, and `jti` for a unique token identifier.
- The token may include the user's role for frontend presentation, but the backend must use backend-controlled current user data for authorization decisions.
- Tokens are accepted only after signature, algorithm, required-claim, and expiry validation succeeds.
- Access tokens are held in React application memory. They are not stored in `localStorage` or browser-readable cookies.
- The MVP does not issue refresh tokens. Reloading the application, closing the tab, logging out, or reaching token expiry requires a new login.

This strategy intentionally favors a small, auditable MVP security surface. Persistent login and token refresh are deferred until their revocation and cookie security requirements can be designed together.

## Password Handling Requirements

- Passwords must be hashed with Argon2id using a maintained password-hashing library.
- Each hash must use a unique salt generated by the library. Passwords must never be stored with reversible encryption or as plain text.
- Hash parameters must be centrally configured and reviewed for the deployment environment. Successful login should rehash a password when stored parameters are outdated.
- Password verification must use the hashing library's verification function rather than direct string comparison.
- New passwords must be at least 12 characters. A reasonable maximum input length must be enforced to prevent excessive resource use.
- Passwords, access tokens, hashes, and signing secrets must never appear in logs, exception messages, analytics, source control, or frontend environment variables.
- Login errors must not reveal whether a username exists or whether the password was incorrect.
- Authentication endpoints must be served over HTTPS outside local development.
- Rate limiting and monitoring must protect login attempts before production use.

## Backend Enforcement

FastAPI is the authoritative security boundary. Protected routes under `/api/v1` must use shared authentication and authorization dependencies instead of implementing token or role checks independently in route handlers.

Backend enforcement must follow these principles:

- Public routes are explicitly identified; all other business routes require authentication.
- Authentication validates the JWT and resolves an active user from the token subject.
- Role checks use server-controlled role data. Request bodies, query parameters, headers other than the bearer token, and frontend state cannot grant permissions.
- Route-level checks enforce broad capabilities, such as manager-only staff administration.
- Service or repository-level checks enforce resource relationships, such as a mechanic being assigned to a job card.
- Sensitive multi-step operations recheck authorization at the point where protected state is read or changed.
- Authorization rules are centralized and reusable so equivalent operations receive equivalent decisions.
- A missing rule results in denial.
- OpenAPI documentation should identify bearer-authenticated endpoints when authentication is implemented.

Module boundaries do not bypass authorization. Internal calls within the modular monolith must preserve the same permission rules as API-triggered operations.

## Frontend Protected Routes

The React application will maintain authentication state in a central auth provider and apply route metadata for allowed roles.

- While authentication state is being established, protected content is not rendered.
- An unauthenticated user who opens a protected route is redirected to the login page. The intended path may be retained for navigation after successful login.
- An authenticated user who opens a route outside the user's role is shown a controlled forbidden page and remains signed in.
- Navigation items and action controls unavailable to the current role are hidden or disabled to avoid dead-end workflows.
- Direct URL entry must pass through the same route guard as in-app navigation.
- The API client attaches the in-memory bearer token to protected requests.
- A `401` API response clears authentication state and redirects the user to login.
- A `403` API response keeps the user authenticated and shows a forbidden message for the attempted action.

Frontend role checks are an interface aid only. Every protected API request remains subject to backend authorization, including requests made outside the TORQUE frontend.

## Access-Control Failure Behavior

| Situation | HTTP status | Required behavior |
| --- | --- | --- |
| Login credentials are invalid or the account is inactive | `401 Unauthorized` | Return a generic login failure without identifying which condition failed. |
| Bearer token is missing, malformed, expired, or invalid | `401 Unauthorized` | Return a controlled error and the `WWW-Authenticate: Bearer` header; do not expose token validation details. |
| Authenticated user lacks the required role permission | `403 Forbidden` | Deny the operation without changing state. |
| Authenticated user has a role capability but lacks access to the specific resource | `403 Forbidden` | Deny the operation without disclosing sensitive resource content. |

Authentication and authorization failures must use the API's standard error format, must not include stack traces or secrets, and should be logged without credentials or tokens. Repeated login failures and forbidden access attempts should be available for security monitoring.

For the MVP, TORQUE uses `403` consistently for known resource authorization failures. Returning `404` to conceal selected resource existence is deferred until resource visibility rules are defined consistently.

## Deferred Decisions

The following items are deliberately outside the MVP access-token design and require separate stories or security review:

- Refresh tokens, persistent login, server-side session revocation, and secure cookie/CSRF behavior
- Password reset, temporary passwords, account recovery, and email verification
- Multi-factor authentication and external identity providers or single sign-on
- Login lockout thresholds and the production rate-limiting implementation
- Signing-key rotation and migration from symmetric to asymmetric JWT signing
- Multiple roles per user and custom permission sets
- Multi-workshop tenancy and workshop-scoped data isolation
- Detailed security audit-event schema, retention, and alerting
- Resource-specific use of `404` instead of `403` to conceal existence
- Bootstrap procedure for the first Workshop Manager account

Deferred items must not be approximated with frontend-only checks or long-lived access tokens. They should be implemented only after their complete security behavior is specified.

## Implementation Review Checklist

Future authentication and RBAC implementation stories should be reviewed against this checklist:

- Authentication and authorization are implemented as separate concerns.
- Workshop Manager, Service Advisor, and Mechanic workflows match the permission matrix.
- Every protected backend route enforces authentication and authorization.
- Resource-level rules are enforced by the backend, especially mechanic job-card assignments.
- The frontend handles unauthenticated and forbidden navigation without acting as the security boundary.
- JWT validation, expiry, secret handling, and password hashing follow this document.
- `401` and `403` responses match the documented failure behavior.
- No credentials, password hashes, tokens, or signing secrets are exposed or logged.
