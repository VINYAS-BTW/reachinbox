# ReachInbox Scalable Email Job Scheduler

This project is built using a modern **pnpm/npm Workspace Monorepo Architecture**, identical to the standard seen in large-scale enterprise applications and advanced 48-hour hackathon builds.

## Architecture & Monorepo Structure
We have decoupled the backend into specialized microservices and shared libraries:# ReachInbox Clone – AI-Powered Email Scheduling Platform

A full-stack email outreach platform inspired by modern cold-email engagement tools. The application enables users to schedule email campaigns, manage recipients, monitor delivery status, and process email jobs asynchronously using Redis-backed queues.

## Features

- Email campaign scheduling
- Bulk email processing
- Delayed email delivery
- Queue-based job execution using BullMQ
- Redis-backed rate limiting
- Google Authentication (NextAuth)
- Campaign status tracking
- Sent / Scheduled email dashboards
- PostgreSQL database integration
- Responsive modern UI
- Cloud deployment using Railway

---

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Axios
- NextAuth

### Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- BullMQ
- Redis
- Nodemailer / Email Service Provider

### Infrastructure

- Railway
- PostgreSQL
- Redis

---

## System Architecture

```text
Frontend (Next.js)
        |
        v
Backend API (Express)
        |
        v
 PostgreSQL
        |
        v
  BullMQ Queue
        |
        v
 Redis Queue Storage
        |
        v
 Worker Service
        |
        v
 Email Provider
```

---

## Project Structure

```text
reachinbox/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── api/
│   │   ├── worker/
│   │   ├── queue/
│   │   └── database/
│   │
│   ├── prisma/
│   └── package.json
│
└── README.md
```

---

## Database Schema

### EmailJob

| Field | Type |
|---------|---------|
| id | UUID |
| recipient | String |
| senderEmail | String |
| subject | String |
| body | String |
| status | Enum |
| scheduledAt | DateTime |
| sentAt | DateTime |
| failedReason | String |

---

## Workflow

### Scheduling Emails

1. User creates campaign
2. API validates request
3. Email jobs are stored in PostgreSQL
4. Jobs are added to BullMQ queue
5. Queue delays execution until scheduled time

### Email Processing

1. Worker consumes queued jobs
2. Rate limit checks are performed
3. Email provider sends email
4. Database status updated
5. Dashboard reflects latest state

---

## Environment Variables

### Frontend

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### Backend

```env
DATABASE_URL=

REDIS_HOST=
REDIS_PORT=
REDIS_USER=
REDIS_PASSWORD=

PORT=4000

MAX_EMAILS_PER_HOUR=200
CONCURRENCY=5
DELAY_BETWEEN_EMAILS_MS=2000
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/VINYAS-BTW/reachinbox.git

cd reachinbox
```

---

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Runs on:

```text
http://localhost:3000
```

---

### Backend Setup

```bash
cd backend

npm install
```

Generate Prisma Client:

```bash
npx prisma generate
```

Run Migrations:

```bash
npx prisma migrate dev
```

Start API:

```bash
npm run dev:api
```

Start Worker:

```bash
npm run dev:worker
```

Runs on:

```text
http://localhost:4000
```

---

## Deployment

### Frontend

Deploy using Railway:

```bash
NEXT_PUBLIC_API_URL=https://your-api-url/api
NEXTAUTH_URL=https://your-frontend-url
```

### Backend

Deploy API and Worker as separate services.

Required services:

- PostgreSQL
- Redis
- Backend API
- Worker Service

---

## Key Engineering Concepts

- Asynchronous Job Processing
- Event-Driven Architecture
- Queue Management
- Rate Limiting
- REST API Design
- Authentication & Authorization
- Cloud Deployment
- Database Optimization
- Distributed Workers

---

## Future Enhancements

- Campaign Analytics
- Email Open Tracking
- Click Tracking
- Multi-Tenant Support
- Email Templates
- CSV Import
- Webhooks
- Retry Mechanisms
- Team Workspaces

---

## Author

**Sai Vinyas**

 Background Workers.
