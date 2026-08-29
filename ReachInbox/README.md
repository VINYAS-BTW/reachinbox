# ReachInbox Scalable Email Job Scheduler

This project is built using a modern **pnpm/npm Workspace Monorepo Architecture**, identical to the standard seen in large-scale enterprise applications and advanced 48-hour hackathon builds.

## Architecture & Monorepo Structure
We have decoupled the backend into specialized microservices and shared libraries:

```text
📦 reachinbox-monorepo
 ┣ 📂 apps
 ┃ ┣ 📂 web        # Next.js Frontend Dashboard
 ┃ ┣ 📂 mediatr    # Express API Gateway (Receives schedules)
 ┃ ┗ 📂 mail       # BullMQ Worker (Processes jobs & rate limits)
 ┣ 📂 packages
 ┃ ┣ 📂 database   # Shared Prisma Schema & Client
 ┃ ┗ 📂 bullmq     # Shared Redis & Queue Configuration
 ┗ 📜 package.json # Root workspace config
```

### Why this architecture?
- **Separation of Concerns**: The API (`mediatr`) doesn't get bogged down doing heavy email processing. The `mail` worker runs in its own process, maximizing throughput.
- **Shared Code**: Both `mediatr` and `mail` rely on the `@reachinbox/database` and `@reachinbox/bullmq` packages. No duplicate models or queue names.
- **Scalability**: You can independently scale `mail` workers across multiple servers without scaling the `web` or `mediatr` apps.

## Setup Instructions

### 1. Database and Redis Setup
Start the required infrastructure using Docker Compose:
```bash
docker-compose up -d
```

### 2. Install Dependencies
At the root of the repository, install all workspace packages:
```bash
npm install
```

### 3. Generate Prisma Client
Generate the shared database client:
```bash
npm run generate --workspace=@reachinbox/database
```

### 4. Build Shared Packages
```bash
npm run build --workspace=@reachinbox/bullmq
```

### 5. Setup Environment Variables
Ensure `.env` files are present in:
- `apps/mediatr/.env` (Database & Redis URL)
- `apps/mail/.env` (Database, Redis, Ethereal credentials, Concurrency Limits)
- `apps/web/.env.local` (NextAuth Google Client ID/Secret)

### 6. Run Everything
Start all applications (`web`, `mediatr`, `mail`) simultaneously from the root:
```bash
npm run dev
```

## Features Implemented
- **No Cron**: 100% powered by BullMQ delayed jobs.
- **Persistence**: PostgreSQL state tracking + Redis job persistence.
- **Rate Limiting**: Custom Redis-backed per-sender rate limiter, dynamically delaying jobs via `moveToDelayed` to prevent failures.
- **Microservice Scalability**: True decoupling between UI, API, and Background Workers.
