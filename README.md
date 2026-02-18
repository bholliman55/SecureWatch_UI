# SecureWatch

A real-time security operations dashboard that displays vulnerability scans, monitoring checks, compliance audits, training modules, and incidents. Data is stored in Supabase and wired to the frontend via React hooks and services.

## Features

- **Dashboard** – Hero metrics, agent status, security posture chart, activity timeline
- **Scanner Agent** – Scans, vulnerabilities, assets (create new scans)
- **Monitoring Agent** – Health checks, response times, uptime
- **Compliance Agent** – Audits by framework (SOC 2, PCI-DSS, HIPAA)
- **Training Agent** – Modules, enrollment, completion rates
- **Incidents Agent** – Security incidents and resolution tracking
- **Settings** – Airtable credentials for n8n workflow integration

## Tech Stack

- React 18 + TypeScript + Vite
- Tailwind CSS
- Supabase (PostgreSQL + REST API)
- Recharts

## Prerequisites

- Node.js 18+
- Supabase project

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Get these from your [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API.

### 3. Run Migrations

Apply the migrations to your Supabase project:

```bash
npx supabase db push
```

Or run them manually in the Supabase SQL Editor in this order:

1. `20260119230000_create_airtable_credentials.sql`
2. `20260119230858_update_credentials_table_for_anonymous_use.sql`
3. `20260119231826_create_scanner_tables.sql`
4. `20260121134523_create_monitoring_compliance_training_incidents_tables.sql`
5. `20260214164534_add_anon_policies_scans_vulns_assets.sql`
6. `20260217120000_add_anon_insert_scans_and_seed_data.sql`

### 4. Start Dev Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Data Flow

| View        | Data Source          | Supabase Tables                     |
|-------------|----------------------|-------------------------------------|
| Dashboard   | `useDashboardData`   | Aggregates scanner, incidents, compliance, training |
| Scanner     | `useScannerData`     | `scans`, `vulnerabilities`, `assets` |
| Monitoring  | `useMonitoring`      | `monitoring_checks`                 |
| Compliance  | `useCompliance`      | `compliance_audits`                 |
| Training    | `useTraining`        | `training_modules`                  |
| Incidents   | `useIncidents`       | `incidents`                         |
| Settings    | `Settings` + Supabase | `airtable_credentials`             |

All services (`scannerService`, `monitoringService`, etc.) use the Supabase client and read/write to these tables. Row Level Security (RLS) allows anonymous SELECT and INSERT for scans.

## Scripts

- `npm run dev` – Start dev server
- `npm run build` – Production build
- `npm run preview` – Preview production build
- `npm run lint` – Run ESLint
- `npm run typecheck` – Run TypeScript check

## Project Structure

```
src/
├── components/     # UI components (Dashboard, Scanner, etc.)
├── contexts/       # Theme context
├── hooks/          # Data hooks (useDashboardData, useScannerData, etc.)
├── services/       # Supabase-backed services
├── utils/          # Formatters and helpers
└── data/           # Mock data (fallback/development)
```

## Airtable (Optional)

The Settings page configures Airtable credentials for n8n workflows. This is separate from the main Supabase-backed dashboard. Configure Base ID and API Key in Settings if you use Airtable tables for integration.
