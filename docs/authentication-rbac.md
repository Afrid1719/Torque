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
4. After successful verification, the backend creates a persistent refresh session with a fixed 10-day expiry. Only a hash of its opaque refresh token or session identifier is stored server-side.
5. The backend returns a signed, short-lived JWT access token and sets the raw refresh token in a 10-day HttpOnly cookie.
6. The frontend keeps the access token in application memory and sends it to protected API endpoints as `Authorization: Bearer <token>`.
7. For each protected request, the backend validates the access token, resolves the current active user, and loads the user's current role from backend-controlled data before applying role and resource authorization rules.
8. When the application starts without an in-memory access token, the frontend calls `/api/v1/auth/refresh`. A valid, unexpired, and unrevoked refresh session produces a new access token and restores the authenticated user context.
9. Logout revokes the server-side refresh session, clears the refresh cookie, and removes the access token and user state from frontend memory.

The frontend must never send a role, user ID, or permission value that the backend treats as authoritative. Identity comes from the validated token, and current account state and authorization data come from backend-controlled data.

## Authentication Endpoints

These endpoints describe the planned contract under the `/api/v1` prefix. They are design requirements and are not implemented by this document.

| Method and path | Authentication | Planned behavior |
| --- | --- | --- |
| `POST /api/v1/auth/login` | Username and password | Verifies credentials and active status, creates a 10-day refresh session, returns an access token, and sets the HttpOnly refresh cookie. |
| `POST /api/v1/auth/refresh` | HttpOnly refresh cookie | Validates the cookie and server-side session, then returns a new short-lived access token. |
| `POST /api/v1/auth/logout` | HttpOnly refresh cookie | Revokes the active refresh session and clears the refresh cookie. The operation should be idempotent. |
| `GET /api/v1/auth/me` | Bearer access token | Returns the current authenticated user's frontend-safe identity and role data. It never returns password or session secrets. |

TORQUE has no public self-registration endpoint in the MVP. Development-only user seeding may create local or demonstration users for the three supported roles, but it must not run automatically in production or contain real credentials.

## Token and Session Strategy

The access token and refresh session have different responsibilities and lifetimes. The access token authorizes normal API requests for a short period. The persistent refresh session restores the login without giving a browser a 10-day access token.

### Access Token

The MVP uses a short-lived JWT bearer access token with these rules:

- Tokens are signed with `HS256`, suitable for the single TORQUE backend that both issues and validates tokens.
- The signing secret must contain at least 256 bits of cryptographically secure random data, be supplied through backend environment configuration, and never be committed or exposed to the frontend.
- Access tokens expire after 30 minutes by default. The backend setting may be configured between 15 and 30 minutes and must never use the 10-day refresh-session lifetime.
- Required claims are `sub` for the immutable user identifier, `iat` for issue time, `exp` for expiry, and `jti` for a unique token identifier.
- The token may include the user's role for frontend presentation, but the backend must use backend-controlled current user data for authorization decisions.
- Tokens are accepted only after signature, algorithm, required-claim, and expiry validation succeeds.
- Access tokens are held in React application memory. They are not stored in `localStorage` or browser-readable cookies.
- Access tokens are sent only in the `Authorization: Bearer <token>` header for normal protected API requests.

### Persistent Refresh Session

Successful login creates a server-side refresh session with a fixed expiry 10 days after login. This is a 10-day persistent refresh session, not a 10-day access token.

- The backend generates a cryptographically secure opaque refresh token or session identifier.
- The raw value is returned only as an HttpOnly cookie and is never included in a JSON response.
- The cookie expires after 10 days and persists across browser and tab closure.
- The cookie uses `Secure` outside local development, `SameSite=Lax`, and a path limited to `/api/v1/auth`. A host-only cookie is preferred unless a deployment requires a broader domain.
- JavaScript cannot read the cookie. Requests to login, refresh, and logout must include credentials so the browser can receive or send it.
- The refresh cookie is used only by `/api/v1/auth/refresh` and `/api/v1/auth/logout`; it is not an authentication credential for normal business endpoints.
- The database stores only a cryptographic hash of the refresh token or session identifier. The backend hashes the presented value before locating or comparing the session record.
- Refresh succeeds only when the hash matches an existing session, the session is unexpired and unrevoked, and the related user is still active.
- A successful refresh updates `last_used_at` and issues a new access token without extending the session beyond its original 10-day expiry.
- Logout sets `revoked_at`, clears the cookie with matching cookie attributes, and prevents subsequent refresh from that session.
- Invalid, expired, or revoked refresh sessions return a controlled `401 Unauthorized` response and clear the unusable cookie.

Because refresh and logout rely on a credential-bearing cookie, the backend must accept only `POST`, validate the request `Origin` against explicitly allowed frontend origins, and must not combine credentialed CORS with a wildcard origin. `SameSite=Lax` provides an additional cross-site request protection; stricter `SameSite=Strict` may be used when deployment and navigation behavior permit it.

### Server-Side Session Record

A future SQLAlchemy model and Alembic migration will introduce a table such as `user_sessions`. The conceptual design is:

| Field | Purpose |
| --- | --- |
| `id` | Internal immutable session identifier. |
| `user_id` | Foreign key to the authenticated user. |
| `refresh_token_hash` or `session_token_hash` | One-way hash used to validate the cookie value; never the raw token. |
| `expires_at` | Fixed expiry timestamp 10 days after login. |
| `revoked_at` | Nullable timestamp set when the session is revoked. |
| `created_at` | Session creation timestamp. |
| `last_used_at` | Timestamp of the latest successful refresh. |
| `user_agent` | Optional client metadata for security review and future session management. |
| `ip_address` | Optional network metadata stored according to privacy and retention requirements. |

Indexes should support lookup by the hashed token value and cleanup by expiry. Raw refresh tokens must never be recoverable from the database, logs, telemetry, or API responses.

## Password Handling Requirements

- Passwords must be hashed with Argon2id using a maintained password-hashing library.
- Each hash must use a unique salt generated by the library. Passwords must never be stored with reversible encryption or as plain text.
- Hash parameters must be centrally configured and reviewed for the deployment environment. Successful login should rehash a password when stored parameters are outdated.
- Password verification must use the hashing library's verification function rather than direct string comparison.
- New passwords must be at least 12 characters. A reasonable maximum input length must be enforced to prevent excessive resource use.
- Passwords, access tokens, raw refresh tokens, password or session hashes, and signing secrets must never appear in logs, exception messages, analytics, source control, or frontend environment variables.
- Login errors must not reveal whether a username exists or whether the password was incorrect.
- Authentication endpoints must be served over HTTPS outside local development.
- Rate limiting and monitoring must protect login attempts before production use.

## Backend Enforcement

FastAPI is the authoritative security boundary. Protected routes under `/api/v1` must use shared authentication and authorization dependencies instead of implementing token or role checks independently in route handlers.

Backend enforcement must follow these principles:

- Public routes are explicitly identified; all other business routes require authentication.
- Authentication validates the JWT and resolves an active user from the token subject on every protected request.
- The backend loads the user's current role from the database and never authorizes a sensitive operation solely from role claims in an access token.
- Role checks use server-controlled role data. Request bodies, query parameters, headers other than the bearer token, and frontend state cannot grant permissions.
- Route-level checks enforce broad capabilities, such as manager-only staff administration.
- Service or repository-level checks enforce resource relationships, such as a mechanic being assigned to a job card.
- Sensitive multi-step operations recheck authorization at the point where protected state is read or changed.
- Authorization rules are centralized and reusable so equivalent operations receive equivalent decisions.
- A missing rule results in denial.
- OpenAPI documentation should identify bearer-authenticated endpoints when authentication is implemented.
- Login creates a hashed server-side refresh-session record with a fixed 10-day expiry.
- Refresh verifies the session hash, expiry, revocation status, and current user active status before issuing a new access token.
- Logout revokes the matching server-side session and clears the refresh cookie.
- Raw refresh tokens, access tokens, password hashes, session hashes, and signing secrets are excluded from API responses and logs.

Module boundaries do not bypass authorization. Internal calls within the modular monolith must preserve the same permission rules as API-triggered operations.

## Frontend Protected Routes

The React application will maintain authentication state in a central auth provider and apply route metadata for allowed roles.

- The access token is stored only in application memory.
- On application load, if no access token exists in memory, the auth provider calls `POST /api/v1/auth/refresh` with credentials included.
- If refresh succeeds, the frontend stores the new access token in memory and calls `GET /api/v1/auth/me` to load the current user.
- If initial refresh fails, the frontend clears authentication state and redirects to login.
- Refreshing or closing the browser removes the in-memory access token, but the HttpOnly refresh cookie restores the session until its fixed 10-day expiry or server-side revocation.
- While initial refresh and current-user loading are in progress, protected content is not rendered.
- An unauthenticated user who opens a protected route is redirected to the login page. The intended path may be retained for navigation after successful login.
- An authenticated user who opens a route outside the user's role is shown a controlled forbidden page and remains signed in.
- Navigation items and action controls unavailable to the current role are hidden or disabled to avoid dead-end workflows.
- Direct URL entry must pass through the same route guard as in-app navigation.
- The API client attaches the in-memory bearer token to protected requests.
- An appropriate `401` from a protected API request triggers one refresh attempt. Concurrent failures should share one refresh operation, and a retried request must not enter a refresh loop.
- A failed refresh clears authentication state and redirects the user to login. A `401` from login, refresh, or logout does not trigger another refresh attempt.
- A `403` API response keeps the user authenticated and shows a forbidden message for the attempted action.
- Logout calls `POST /api/v1/auth/logout`, clears the access token and user state from memory, and redirects to login. Local state is cleared even when the logout request cannot complete.

Frontend role checks are an interface aid only. Every protected API request remains subject to backend authorization, including requests made outside the TORQUE frontend.

## Access-Control Failure Behavior

| Situation | HTTP status | Required behavior |
| --- | --- | --- |
| Login credentials are invalid or the account is inactive | `401 Unauthorized` | Return a generic login failure without identifying which condition failed. |
| Bearer token is missing, malformed, expired, or invalid | `401 Unauthorized` | Return a controlled error and the `WWW-Authenticate: Bearer` header; do not expose token validation details. |
| Refresh cookie or server-side session is missing, invalid, expired, or revoked | `401 Unauthorized` | Deny refresh, clear the unusable cookie, and do not disclose which validation failed. |
| Authenticated user lacks the required role permission | `403 Forbidden` | Deny the operation without changing state. |
| Authenticated user has a role capability but lacks access to the specific resource | `403 Forbidden` | Deny the operation without disclosing sensitive resource content. |

Authentication and authorization failures must use the API's standard error format, must not include stack traces or secrets, and should be logged without credentials, raw tokens, token hashes, or signing secrets. Repeated login failures and forbidden access attempts should be available for security monitoring.

For the MVP, TORQUE uses `403` consistently for known resource authorization failures. Returning `404` to conceal selected resource existence is deferred until resource visibility rules are defined consistently.

## Deferred Decisions

The following items are deliberately outside the MVP token and session design and require separate stories or security review:

- Advanced refresh-token rotation policy
- Multi-device session management UI
- Detailed session audit reporting
- Signing-key rotation and migration from symmetric to asymmetric JWT signing
- Password reset, temporary passwords, account recovery, and email verification
- Multi-factor authentication
- External identity providers or single sign-on
- Production rate-limiting and monitoring details
- Multiple roles per user and custom permission sets
- Multi-workshop tenancy and workshop-scoped data isolation
- Resource-specific use of `404` instead of `403` to conceal existence
- Bootstrap procedure for the first Workshop Manager account

Deferred items must not be approximated with frontend-only checks, raw server-side session tokens, or long-lived access tokens. They should be implemented only after their complete security behavior is specified.

## Implementation Review Checklist

Future authentication and RBAC implementation stories should be reviewed against this checklist:

- Authentication and authorization are implemented as separate concerns.
- Workshop Manager, Service Advisor, and Mechanic workflows match the permission matrix.
- Every protected backend route enforces authentication and authorization.
- Resource-level rules are enforced by the backend, especially mechanic job-card assignments.
- The frontend handles unauthenticated and forbidden navigation without acting as the security boundary.
- Access JWT validation, 15-to-30-minute expiry, secret handling, and password hashing follow this document.
- The 10-day persistent refresh session uses an HttpOnly cookie and a hashed server-side token or identifier.
- Application startup can restore the session through refresh without storing the access token in persistent browser storage.
- Logout revokes the server-side session and clears both cookie and in-memory authentication state.
- `401` and `403` responses match the documented failure behavior.
- No credentials, password hashes, raw tokens, session hashes, or signing secrets are exposed or logged.
