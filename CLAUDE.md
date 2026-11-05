# Dealora

## Product

Dealora is a multi-tenant Arabic CRM for small sales teams (2–30 reps) in the Gulf and Egypt. Backend only for now (NestJS REST API). A web frontend will consume it later.

- **Name:** the PRD calls the product "تابِع". The real name is Dealora; use it everywhere.
- **Roles:** three fixed roles: owner, manager, rep. No custom permissions editor in the MVP.
- **PRD:** `docs/PRD.pdf` is not in git; ask the team lead for it. Business features are built in later sessions.

**The 9 MVP modules:**

1. Sign-up and company setup
2. Customers
3. Deals and sales stages
4. Communication log
5. Follow-ups and tasks
6. Payments and installments
7. Team and lead assignment
8. Performance dashboard and targets
9. Settings and ready-made WhatsApp messages

## Stack

NestJS 11, TypeScript (nodenext), Prisma 7 with the `prisma-client` generator + `@prisma/adapter-pg`, PostgreSQL, @nestjs/jwt, bcrypt, class-validator.

## Layout

```
prisma/                 # schema.prisma holds the generator + datasource only
prisma/models/          # one .prisma file per model
prisma/migrations/      # created by `prisma migrate dev`
generated/prisma/       # generated Prisma client (gitignored)
prisma.config.ts        # Prisma CLI config: schema folder, migrations path, datasource URL
docs/                   # private product docs, gitignored except docs/README.md
.github/workflows/      # CI: lint and build
src/                    # application code; main.ts bootstraps, app.module.ts is the root module
src/common/types/       # shared types: JwtPayload, AuthenticatedRequest
src/database/           # PrismaModule and PrismaService
src/guards/             # global AuthGuard (JWT) and RolesGuard
src/decorators/         # @Public() and @Roles(...)
src/interceptors/       # ResponseInterceptor: wraps every response as { message, data }
src/utils/security/     # password hashing helpers (bcrypt)
```

Because `src/` imports from `generated/`, the build output is `dist/src/main.js`, not `dist/main.js`.

## Prisma rules

- Split schema: one file per model in `prisma/models/`. `prisma/schema.prisma` holds only the generator and datasource.
- The database URL comes from `prisma.config.ts`, not from `schema.prisma`.
- Import Prisma types and the client from `generated/prisma/client.js` (relative path) only, never from `@prisma/client`.
- All IDs are UUIDs (`@default(uuid())`), never autoincrement.
- New migrations: `npx prisma migrate dev --name <name>`.
- `npm run build` regenerates the client.

## Auth rules

- `AuthGuard` and `RolesGuard` are global, so every route needs a JWT unless it has `@Public()`.
- Add `@Roles(...)` to restrict a route.
- `request.user` holds the JWT payload (`JwtPayload` in `src/common/types/jwt-payload.ts`).

## Multi-tenancy (critical)

- Every business table has a `workspace_id`.
- Every query in every service MUST filter by the current user's `workspace_id` from the JWT. Data must never leak between companies.
- Controllers read the tenant from `req.user.workspace_id`, never from the body or query.
- Money is stored as integers in the smallest currency unit (KWD/BHD/OMR use 3 decimals).

## Module pattern

- `<feature>/<feature>.module.ts|controller.ts|service.ts|dto/`
- Services inject `PrismaService` and throw standard Nest HTTP exceptions.
- Map Prisma `P2002` errors to `ConflictException`.

## Docker & local setup

- **Daily dev:** `npm run db:up` runs only Postgres in Docker, and `npm run start:dev` runs the API locally with hot reload. `.env` points at `localhost:5433`.
- **Full stack:** `docker compose up --build` runs both. The API uses `db:5432` inside the network, and runs `prisma migrate deploy` before starting.
- Containers are `dealora-db` and `dealora-api`; the volume is `dealora-pgdata`. The default host port for Postgres is 5433, because 5432 may already be in use.
- The API refuses to start if the database is unreachable (`SELECT 1` in `PrismaService.onModuleInit`) or if `JWT_SECRET` is missing.
- `prisma` is a production dependency because the runtime image runs `prisma migrate deploy`.
- CORS origins come from `CORS_ORIGINS` (comma-separated). If it's empty, cross-origin requests get no CORS headers.

## Security notes

- Before adding any file upload route (payment receipts are coming), resolve GHSA-q7qp-rjg7-q26m (multer, via `@nestjs/platform-express`) with an override or a NestJS upgrade.
- Private docs never go in git: `/docs/*` and root-level `/*.pdf` are gitignored.

## Commands

```
npm install                            # install dependencies
npm run db:up                          # start Postgres in Docker
npm run db:down                        # stop containers (data is kept)
npm run start:dev                      # dev server with watch
npm run build                          # prisma generate + nest build
npm run start:prod                     # run dist/src/main.js
npm run prisma:generate                # regenerate the Prisma client
npx prisma migrate dev --name <name>   # create and apply a migration (dev)
npm run db:migrate                     # apply migrations (prisma migrate deploy)
npm run db:studio                      # browse the database
npm run lint                           # eslint --fix
npm run format                         # prettier
```

## Definition of done

`npm run build` and `npm run lint` pass with no errors.
