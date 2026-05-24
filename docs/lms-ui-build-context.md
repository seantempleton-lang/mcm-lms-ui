# Build Context

This file captures the critical context for the McMillan LMS UI build. It is intended as a fast handoff note for future development, deployment, and debugging.

## Product Shape

- This repository is the frontend for the McMillan Drilling LMS.
- The UI is a React single page app built with Vite and served as static assets.
- The backend LMS core is the system of record for authentication, roles, modules, competencies, training assignments, sessions, learner progress, resources, and uploaded media.
- Existing architecture references live in:
  - `docs/lms-functional-hierarchy.md`
  - `docs/lms-software-architecture.md`

## Tech Stack

- React 18
- React Router 6
- Vite 5
- Nginx for containerized static delivery
- No client-side state library; pages use local React state and direct API calls.
- No test runner is currently configured in `package.json`.

## Runtime And Build Commands

```sh
npm install
npm run dev
npm run build
npm run preview
```

The Vite dev server is configured for port `5173` in `vite.config.js`.

The Docker build uses Node 20 Alpine to compile the app, then serves `dist/` from Nginx on port `8080`.

## Environment

The frontend requires:

```sh
VITE_API_URL=http://lms-core.mcm
```

This is defined in `.env.example` and also used as the Docker build argument default. The value is compiled into the Vite bundle at build time, so changing it requires rebuilding the frontend image unless runtime config is added later.

## Authentication

- Login calls `POST /auth/login`.
- The returned token is stored in `localStorage` under `token`.
- `src/api.js` attaches the token as `Authorization: Bearer <token>` on API requests.
- `src/auth.js` loads the current user with `GET /auth/me`.
- `401` and `403` responses clear the stored token.
- The app treats the backend as unavailable when `/auth/me` fails for non-auth reasons.

## Role Model

The UI currently recognizes these roles:

- `LEARNER`
- `SUPERVISOR`
- `ADMIN`

Route access is enforced in `src/components/RequireRole.jsx`. This is a frontend guard only; backend authorization must remain authoritative.

## Primary Routes

- `/login`: unauthenticated login screen.
- `/`: role-specific dashboard.
- `/my-learning`: learner training workflow.
- `/supervisor/training`: supervisor required-training queue, assignment, review, and learner reports.
- `/supervisor/modules`: supervisor module reference view.
- `/supervisor/competencies`: supervisor competency catalogue.
- `/supervisor/matrix`: competency matrix and evidence view.
- `/supervisor/sessions`: session list and creation.
- `/supervisor/sessions/:id`: attendance, assessment, and award workflow for a session.
- `/admin/users`: user management.
- `/admin/modules`: module builder, competency mapping, media upload, quiz editing, and preview.
- `/admin/resources`: stored document/media management.

Navigation and role-specific menu visibility are centralized in `src/components/Layout.jsx`.

## Backend API Surface Used By The UI

The API helper in `src/api.js` prefixes normal requests with `VITE_API_URL`. Media/resource URLs are normalized through `resolveApiUrl`.

Known endpoint groups consumed by this UI:

- Auth: `/auth/login`, `/auth/me`
- Users: `/users`, `/admin/users`, `/admin/users/:id`, `/admin/users/:id/reset-password`
- Modules: `/modules`, `/modules/:id`, `/modules/:id/competencies`
- Competencies: `/competencies`
- Training: `/training`, `/training/:id/:action`, `/training/:id/review`, `/training/my`, `/training/my/report`, `/training/report/:learnerId`
- Sessions: `/sessions`, `/sessions/:id`, `/sessions/:id/attendance`, `/sessions/:id/assessments`, `/sessions/:id/awards`
- Matrix: `/matrix`
- Resources and media: `/admin/resources`, `/admin/resources/:filename`, `/documents/upload`

`AdminModules.jsx` uses direct `fetch` for document uploads so it can send `FormData`; most other calls use `api()`.

## Module And Learning Model

Modules can include:

- Metadata: title, category, mode, overview, objectives, duration, and resource URL.
- Competency mappings with evidence types.
- Builder content for slides.
- Images, videos, documents, and links.
- Quiz questions, answer choices, correct answers, and explanations.

`src/components/ModulePlayer.jsx` renders the learner-facing module experience. Keep module content changes compatible with both admin preview and learner playback.

## Deployment Context

- `Dockerfile` builds the Vite app and serves it with Nginx.
- `nginx.conf` serves the SPA with `try_files $uri $uri/ /index.html`.
- Static assets are cached for 30 days with immutable cache headers.
- `/health` returns `{"ok":true}` on port `8080`.

## Important Implementation Notes

- `VITE_API_URL` is currently assumed to be present. If it is missing, API requests will be malformed.
- Tokens are stored in `localStorage`, so logout is handled by removing the token and redirecting to `/login`.
- The app currently has no generated TypeScript types or schema validation for backend responses.
- Most pages assume backend response shapes directly. API contract changes should be coordinated carefully.
- Uploaded content and module media can be absolute URLs or API-relative paths; use `resolveApiUrl` before rendering links/media.
- The UI is intentionally role-driven. When adding features, decide whether they belong to learner, supervisor, admin, or shared workspace flows before adding routes.

## Current Documentation Map

- `docs/lms-ui-build-context.md`: critical build handoff context.
- `docs/lms-functional-hierarchy.md`: user-facing LMS workflow hierarchy.
- `docs/lms-software-architecture.md`: frontend/backend architecture and request flows.
- `docs/*.svg`: visual exports for the existing diagrams.
