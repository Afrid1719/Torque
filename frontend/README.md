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
