# CareConnect Maharashtra

Rural healthcare **referral tracking and continuity of care** for Palghar district (Jawhar, Mokhada, Dahanu, Palghar).

This is not a hospital-booking app. The product follows a patient from first contact until the referral is closed.

Patient → AI-assisted triage (priority only) → nearby public facility → referral → appointment/queue → consultation → diagnostics → follow-up → closed.

## Demo (synthetic data)

All records are marked **SYNTHETIC DEMO DATA**.

Password for every demo user: `CareConnect@2026`

| Username | Role | What to open |
| --- | --- | --- |
| `aasha.jawhar` | ASHA / health worker | Start a new referral, village follow-up |
| `patient.savitri` | Patient | Closed journey of Savitri Bhoye, Sakhare |
| `staff.rhjawhar` | RH Jawhar staff | Facility queue, advance status |
| `admin.palghar` | District coordinator | Continuity dashboard + audit log |

Closed demo referral ID: `MH-PLG-260820-SAVI`  
Savitri Bhoye: first contact at Sub-Centre Sakhare → triage URGENT (no diagnosis) → Rural Hospital Jawhar → appointment → consultation → follow-up → **CLOSED**.

## Stack

Next.js 15, TypeScript, Tailwind CSS, Prisma, SQLite, Leaflet / OpenStreetMap, Recharts.

## Run

```bash
npm install
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```

Languages: Marathi, Hindi, English. Offline actions are stored in a local sync queue.
