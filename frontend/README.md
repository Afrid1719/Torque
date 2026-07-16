# Frontend

This directory contains the React, TypeScript, and Vite frontend for TORQUE.

## Setup

Install dependencies:

```bash
npm install
```

Create local frontend environment configuration:

```bash
cp .env.example .env
```

On Windows Command Prompt:

```cmd
copy .env.example .env
```

Configure the backend API origin:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Start the development server:

```bash
npm run dev
```

Vite prints the local development URL in the terminal, usually `http://localhost:5173/`.

The app restores an existing cookie-backed session before resolving protected
routes. Unauthenticated users are redirected to `/login`; authenticated users
can access the Dashboard entry point at `/`. Successful login loads the current
user and role before redirecting to the Dashboard. Frontend role guards improve
navigation and messaging, but backend authorization remains authoritative for
every protected API operation.

Authenticated pages use a shared application shell with the responsive TORQUE
sidebar and header. The shell provides routes for Dashboard (`/`), Customers,
Vehicles, Job Cards, Inventory, Billing, Reports, and Settings. Until those
feature pages are implemented, each route intentionally renders only its page
title.

Selecting Logout asks the backend to revoke the active refresh session, then
clears the access token and user state from memory and redirects to `/login`.
The local authentication state is still cleared when the backend request fails,
so a network problem cannot leave protected frontend content visible.

## Available Scripts

```bash
npm run dev
npm run build
npm run format
npm run format:check
npm run lint
npm run preview
npm test
npm run typecheck
```

## Notes

- Material UI is the selected component library for the MVP frontend.
- TailwindCSS is not used in the MVP frontend.
- `VITE_API_BASE_URL` must contain only the backend origin. Do not store backend secrets in frontend environment variables.
- The full local development setup is documented in the repository root `README.md`.
