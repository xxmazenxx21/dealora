# Dealora

Multi-tenant Arabic CRM for small sales teams (2–30 reps) in the Gulf and Egypt. This repo is the backend: a NestJS REST API on PostgreSQL.

## Prerequisites

- Node 22 (`nvm use` picks it up from `.nvmrc`)
- Docker with Compose

## Quick start

```bash
git clone <repo-url> dealora
cd dealora
cp .env.example .env
npm install
npm run db:up
npx prisma migrate dev
npm run start:dev
```

The API runs on http://localhost:3000, and `GET /` works as a health check. Postgres runs in Docker on host port 5433.

Before sharing an environment, replace `JWT_SECRET` and `POSTGRES_PASSWORD` in `.env`. Postgres only reads the password when its volume is first created, so to change it later, run `docker compose down -v` (this deletes the data) and `npm run db:up`.

## Product docs

The PRD is not in git. Ask the team lead for `docs/PRD.pdf`.

## Full-stack Docker mode

```bash
docker compose up --build
```

This runs Postgres and the API in Docker, and applies migrations before the API starts. Inside the Docker network the API reaches the database at `db:5432`, so it ignores the `DATABASE_URL` in `.env`.

## Scripts

| Script | What it does |
|---|---|
| `npm run start:dev` | Run the API locally with hot reload |
| `npm run build` | Generate the Prisma client and compile |
| `npm run start:prod` | Run the compiled API |
| `npm run lint` | Run ESLint with autofix |
| `npm run format` | Run Prettier |
| `npm run db:up` | Start Postgres in Docker |
| `npm run db:down` | Stop the Docker containers (data is kept) |
| `npm run db:migrate:dev` | Create and apply a migration in development |
| `npm run db:migrate` | Apply existing migrations (`prisma migrate deploy`) |
| `npm run db:studio` | Open Prisma Studio |
| `npm run prisma:generate` | Regenerate the Prisma client |

## Folder structure

```
prisma/              schema.prisma (generator + datasource), models/, migrations/
generated/prisma/    generated Prisma client (gitignored)
src/
  common/types/      shared types (JWT payload, authenticated request)
  database/          PrismaModule and PrismaService
  decorators/        @Public() and @Roles()
  guards/            global AuthGuard and RolesGuard
  interceptors/      wraps every response as { message, data }
  utils/security/    password hashing
```

## Adding a Prisma model

1. Create `prisma/models/<model>.prisma` with one model. Use `@default(uuid())` for IDs, and add `workspace_id` to every business table.
2. Run `npx prisma migrate dev --name <name>`. This applies the migration and regenerates the client.
3. Import types from `generated/prisma/client.js` using a relative path, never from `@prisma/client`.
