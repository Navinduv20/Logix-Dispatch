# Logix Dispatch — Logistics Management Platform

Logix Dispatch is a web-based logistics management platform built for COMP70006 Assessment 02. It replaces spreadsheets, phone calls, and printed route sheets with a real-time interface that serves four roles: dispatchers, drivers, customers, and managers.

## Features

| Role | Capability |
|---|---|
| Customer | Track a shipment by number, see live delivery progress on a map, reschedule, read the status timeline, and receive email or SMS notifications. |
| Dispatcher | Monitor every driver on a live map, filter the queue by status, and reassign shipments in one click. |
| Driver | Mobile-first route list ordered by priority and ETA, with one-tap status updates that trigger customer notifications. |
| Manager | Dashboard with on-time trends, status mix, driver performance, fuel spend, and a sortable KPI table. |

## Tech stack

- React 18 with TypeScript
- Vite for development and production builds
- Tailwind CSS for styling
- Zustand for client state
- React Router v6 for routing
- React-Leaflet and Leaflet for map rendering
- Recharts for the manager dashboard
- Vitest, React Testing Library, and Playwright for tests

## Getting started

```bash
npm install
npm run dev:all
```

The app runs at http://localhost:5173 and the notification API at http://localhost:3001 (proxied through Vite at `/api`). `npm run dev` starts the web app alone; emails are then recorded as failed since the API is down.

## Email notifications (Resend)

Shipment updates (status changes, reschedules, issue alerts) send real emails through [Resend](https://resend.com) via a small Express server in `server/`. The SMS channel is simulated for the demo.

1. Copy `.env.example` to `.env` and set `RESEND_API_KEY` (create one at resend.com/api-keys).
2. Set `DEMO_EMAIL_TO` to the address you signed up to Resend with. The free tier only delivers to the account owner's address until a custom domain is verified, so every notification is redirected there regardless of the mock customer's email.
3. Run `npm run dev:all`.

Without an API key the server still runs and reports each email as `simulated`, so the demo works fully offline. Every notification (sent, simulated, or failed) appears in the navbar notification center and on the shipment's tracking page, with a preview of the exact email HTML that is sent.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server. |
| `npm run server` | Start the notification API server. |
| `npm run dev:all` | Start both together. |
| `npm run build` | Typecheck and build for production. |
| `npm run preview` | Serve the production build locally. |
| `npm test` | Run unit and component tests once. |
| `npm run test:watch` | Watch mode for unit tests. |
| `npm run test:e2e` | Run the Playwright end-to-end suite. |
| `npm run lint` | Run ESLint. |

## Project structure

```
src/
  components/    Shared UI (map, timeline, cards, modals, toasts, notification center)
  pages/         One component per route
  services/      Notification service: email template + send via /api
  store/         Zustand store for shipments, drivers, customers, notifications
  data/          Seeded mock data around Colombo, Sri Lanka
  types/         Shared TypeScript types
  __tests__/     Vitest unit and component tests
server/          Express notification API relaying emails through Resend
tests/e2e/       Playwright end-to-end tests
.github/         CI workflow for typecheck, unit, build, and E2E
```

## Demo data

The app ships with eight shipments across six customers and three drivers, seeded to exercise every status in the shipment lifecycle. Tracking numbers range from `LGX-100001` through `LGX-100008`. Every customer, driver, and shipment is purely fictional and exists only for the demo.

## Deployment

The production build (`dist/`) is a static bundle that deploys cleanly to Vercel, Netlify, or any static host. For multi-page routing, ensure the host rewrites unknown paths to `index.html`.

## Way forward

Directions documented in the accompanying slide deck:

- Wire the mocked store to a real backend (Node or Supabase) with authentication.
- Add genuine route optimisation via OSRM or Google Directions.
- Replace templated notifications with Twilio for SMS and Resend for email.
- Add a background worker for SLA breach detection and escalations.
- Expand the manager dashboard with cohort analysis and per-customer SLA views.
