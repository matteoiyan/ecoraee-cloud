# EcoRAEE React + Vite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the vanilla frontend with a modular React + Vite SPA while preserving the existing local Express API and all user-visible workflows.

**Architecture:** Vite builds the React frontend into `dist/`; Express serves that build and continues to own the existing API. In development, Vite serves the UI and proxies `/api` to Express. React modules are organized by shared interface and the existing dashboard, metadata-driven CRUD, and traceability features.

**Tech Stack:** JavaScript, JSX, React, React DOM, Vite, `@vitejs/plugin-react`, Express 4, existing SQLite/SQL Server adapters, Playwright CLI.

**Spec:** `docs/superpowers/specs/2026-11-06-react-vite-dashboard-design.md`

## Global Constraints

- Node.js is `>=22.13`.
- Keep the interface and product copy in Spanish.
- Keep the existing teal/copper identity and local-first operation.
- Preserve all twelve views, hash routes, API endpoints, database drivers, business rules, validations, and errors.
- Do not add a charting, routing, form, or animation dependency unless the implementation demonstrates it is needed.
- Keep evidence upload out of scope.
- Use Playwright CLI for browser verification; remove any temporary QA records before ending and preserve the seeded data.

## Review Focus

- `meta` or a reference-options request failing must produce a visible error with a recovery path, not a blank view or endless skeleton.
- Empty resources and search with no matches must have distinct, useful empty states.
- Nullable references and missing labels must display safely in tables and edit forms.
- Server validation errors must remain associated with fields; a failed mutation must preserve entered values.
- Direct navigation to a valid hash route and an unknown route must resolve predictably without breaking `/api` error responses.

---

## File map

- `index.html`: Vite document shell, Spanish metadata, React mount, favicon.
- `vite.config.js`: React plugin, development proxy `/api` to Express.
- `package.json` / `package-lock.json`: React/Vite dependencies and build/dev scripts.
- `server/index.js`: serve `dist/`, retain `/api` routing and API 404 behavior, serve the SPA for non-API paths.
- `src/main.jsx`: React entry point.
- `src/app/App.jsx`, `src/app/routes.js`: application shell, metadata loading, hash route selection, route title and active navigation.
- `src/services/api.js`: request helper, `ApiError`, JSON handling, network/HTTP errors.
- `src/components/`: navigation, page header, buttons, fields, dialogs/drawer, toast, status chip, skeletons, and generic table primitives.
- `src/features/dashboard/`: dashboard view and its metric, lifecycle, category, route-capacity, and activity sections.
- `src/features/resources/`: metadata-driven list/search, field rendering, client validation, create/edit form, delete confirmation.
- `src/features/traceability/`: device history, lifecycle rail, allowed state transitions, movement form.
- `src/styles/tokens.css`, `src/styles/global.css`, `src/styles/layout.css`, `src/styles/components.css`: tokens and scoped global/layout/component rules.
- `README.md`: updated commands for one-time install, development, production build, local start, and database configuration.
- `.impeccable/review/`: desktop and mobile Playwright captures used for visual signoff.

## Tasks

### Task 1: Install the React/Vite shell and keep Express serving the local app

**Files:** Create `index.html`, `vite.config.js`, `src/main.jsx`; modify `package.json`, `package-lock.json`, `server/index.js`; remove `public/index.html`, `public/app.js`, `public/app.css` after the React replacement reaches parity.

**Interfaces:** Vite dev server proxies `/api` to Express port 3000. Production Express serves `dist/index.html` for non-API routes and keeps `/api` errors as JSON.

- [x] Add `react`, `react-dom`, Vite, and the React plugin; add `dev`, `dev:api`, `build`, and a `prestart` build while retaining the `start` command.
- [x] Add `vite.config.js` with React plugin, strict dev port, and `/api` proxy to `http://127.0.0.1:3000`.
- [x] Create the Spanish Vite document shell and mount placeholder React content.
- [x] Update Express static serving and SPA fallback without changing API handlers.
- [x] Run `npm run build`; expect a Vite production build in `dist/`.
- [x] Run `npm start`; verify the React shell renders, 11 API resources are exposed, and unknown API paths remain JSON 404s.

### Task 2: Extract API access, formats, and shared design primitives

**Files:** Create `src/services/api.js`, `src/app/` utilities, `src/components/`, and initial files under `src/styles/`.

**Interfaces:** `api(path, { method = 'GET', body, signal } = {})` returns parsed JSON (or `null` for 204) and throws `ApiError(message, fields)`; format helpers expose `pretty(value)`, `formatDate(value)`, `formatNumber(value)`, and `statusClass(value)`.

- [x] Move request/error behavior from `public/app.js` into `api.js`, including network failures, 204 responses, JSON parse failure, and field errors.
- [x] Define CSS variables from the existing palette and typography; preserve focus-visible and reduced-motion behavior.
- [x] Build shared button, status chip, dialog, trace dialog, notice, and toast components with semantic labels and keyboard behavior.
- [x] Build `DashboardSkeleton`, `ListSkeleton`, and `TraceSkeleton` matching the final content geometry, marked with `aria-busy` and a screen-reader loading label.
- [x] Build the app layout and metadata-driven navigation from `/api/meta`; preserve the current groups and `#/panel` / `#/<resource>` URLs.
- [x] Build and verify navigation, hash routing, and zero console errors in the normal online state.

### Task 3: Build the approved dashboard composition

**Files:** Create `src/features/dashboard/DashboardPage.jsx` and focused dashboard components/styles.

**Interfaces:** `DashboardPage` requests `GET /api/dashboard`; data sections receive the endpoint response as props and render loading, success, empty, and error states.

- [x] Add the four KPI values from `tot` and the lifecycle rail computed from `porEstado` and the existing stage groups.
- [x] Add category-weight bars, route-capacity bars, and recent movements using only API data and existing Spanish formatters.
- [x] Match the chosen sketch `.impeccable/mocks/decision/cycle-overview.html` at 1440px: navigation, KPI strip, lifecycle rail, then category, routes, and recent movement cards.
- [x] Use the dashboard skeleton while loading and an explicit error/empty state when the request fails or a data collection is empty.
- [x] Add one brief page-entry animation, short targeted transitions, and a reduced-motion override.
- [x] Build and inspect desktop and 390px mobile renders; mobile rails expose a scroll cue.

### Task 4: Restore metadata-driven list, search, and CRUD forms

**Files:** Create `src/features/resources/ResourcePage.jsx`, table and field components, and form validation helpers.

**Interfaces:** `ResourcePage({ name, resourceMeta })` obtains rows from `/api/<name>` and reference options from `/api/<ref>/options`; create uses POST, edit uses PUT, delete uses DELETE.

- [x] Render columns from `resourceMeta.cols` and field metadata; handle refs, selects/status chips, booleans, dates, numbers, nullable values, and long text.
- [x] Implement client-side case-insensitive search, visible-result count, loading rows, no-records state, and no-match state.
- [x] Render required/default/readonly field behavior and reference options; keep client validation aligned with the existing metadata.
- [x] Preserve errors returned in `fields`, field focus, entered values after server error, disabled submit state, and transient success/error notices.
- [x] Preserve edit and delete confirmation; invalidate option labels after successful mutations.
- [x] Verify all 11 routes, create/delete cleanup, edit prefill/cancel, required validation, search/no-match, and delete-confirm cancel in Playwright CLI.

### Task 5: Restore device traceability and state transitions

**Files:** Create `src/features/traceability/TraceabilityDrawer.jsx` and focused timeline/transition components.

**Interfaces:** `TraceabilityDrawer({ deviceId, onClose, onChanged })` requests `/api/dispositivo/:id/historial`; transition submission posts the existing fields to `/api/dispositivo/:id/estado`.

- [x] Render device identity, lifecycle rail, chronological history, responsible person, timestamps, and optional descriptions.
- [x] Offer only `siguientes` states returned by the API, require a responsible user, and preserve server validation/errors.
- [x] On successful transition, close the dialog, show a transient confirmation, and refresh the source view.
- [x] Handle loading, missing-device/API errors, no events, and the terminal state with no further transitions.
- [x] Open traceability from the device list and dashboard; verify the history and movement form without changing seeded device state.

### Task 6: Complete responsive behavior, documentation, and browser signoff

**Files:** Update relevant `src/styles/`, `README.md`; save captures under `.impeccable/review/`.

- [x] Check the dashboard, representative list, form, and traceability dialog at desktop and mobile sizes.
- [x] Verify network/API error and recovery, required-field feedback, search/no-match, delete confirmation cancel, reduced motion, and visible focus ring through Playwright CLI.
- [x] Confirm all twelve views render, API errors stay JSON, backend rules remain the authority, and the database returns to its six seeded categories after a temporary create/delete check.
- [x] Run `npm run build` and `npm start`; capture and inspect desktop and mobile screenshots with motion reduced.
- [x] Run the Impeccable detector once on changed UI files and resolve its mechanical finding; the finish reviewer issued `ship` after one mobile cue fix.
- [x] Update README commands and local setup steps; note SQL Server remains unverified.

## Execution note

The working directory has no `.git` directory, so branch creation and commits are unavailable here. Preserve changes in place and report that limitation; do not create a new repository implicitly.
