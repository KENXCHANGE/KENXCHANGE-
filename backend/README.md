# Backend prototype for KENXCHANGE

This backend is a small Node.js + Express prototype intended to run with Postgres.
It provides a minimal API for authentication and managing operations (demo only).

Quick start (local, requires Docker):

1. Copy .env.example to .env and set values.
2. Start services: `docker-compose up -d`
3. Initialize DB (once):
   - Connect to the postgres container and run migrations: `docker-compose exec db psql -U postgres -d kenxchange -f /migrations/init.sql`
   - Or run the SQL file locally against your DB.
4. Seed demo data and create admin:
   - `docker-compose exec api node seed.js` or `npm run seed`
5. Start API: `npm run dev` (inside backend)

Notes:
- This is a prototype. Never use seed endpoints or demo passwords in production.
- Configure environment variables (DATABASE_URL, JWT_SECRET, SEED_TOKEN) before deploying.
