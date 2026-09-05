# CareConnect Boilerplate Setup

This scaffold preserves the original project documentation and adds a runnable MERN implementation foundation for the hackathon golden path.

## 1. Install

From `CARECONNECT/`:

```bash
npm install
npm run install-all
```

If the root command does not install correctly on Windows, run:

```bash
cd server && npm install
cd ../client && npm install
```

## 2. Environment

Copy:

- `.env.example` → `.env` for the server
- `client/.env.example` → `client/.env`

Start MongoDB locally, or put your MongoDB connection string in `MONGODB_URI`.

## 3. Run

From the root:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000`

Health check: `http://localhost:5000/health`

## 4. What is already scaffolded

- Express + TypeScript backend
- MongoDB + Mongoose models
- JWT authentication
- RBAC middleware
- Helmet, CORS and rate limiting
- Patient API
- Facility API + deterministic ranking skeleton
- AI triage endpoint with deterministic fallback
- Referral creation
- Canonical referral state machine skeleton
- Referral event timeline persistence
- React + Vite + TypeScript frontend
- Tailwind CSS
- Auth context
- Patient → symptom → triage demo flow

## 5. What the team should implement next

Follow the project docs and hackathon-control documents. Priority:

1. Facility ranking UI and API contract completion
2. Referral creation/tracking UI
3. Facility accept/reject/reassign
4. Patient arrival
5. Consultation
6. Diagnostics
7. Medication plan/reminders
8. Follow-up
9. Referral closure
10. Dashboard closure rate / overdue
11. Production AI provider adapter
12. Tests and deployment

The boilerplate intentionally does not pretend those unfinished stages are complete.
