# Local Development — Docker Desktop

Get the full stack running locally in ~5 minutes.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- That's it. No .NET SDK or Node.js needed locally.

## Steps

```bash
# 1. Clone the repo
git clone https://github.com/diweshtanwar/eConnectOneV1.git
cd eConnectOneV1

# 2. Create your local env file
cp .env.example .env

# 3. Start everything
docker compose up --build
```

Wait ~60 seconds for first build. Then open:

| What | URL |
|------|-----|
| Frontend app | http://localhost:5173 |
| Backend API | http://localhost:10000 |
| Swagger UI | http://localhost:10000/swagger |

Default login: `admin` / `admin123`

## What happens on first start

- PostgreSQL starts, creates the `eConnectOne` database
- Backend runs EF migrations (creates all tables)
- Backend seeds a default admin user
- Frontend dev server starts with hot reload

## Subsequent starts (no rebuild needed)

```bash
docker compose up
```

## Stop everything

```bash
docker compose down
```

To also wipe the database volume (fresh start):
```bash
docker compose down -v
```

## Making code changes

- **Frontend** — changes hot-reload instantly, no restart needed
- **Backend** — restart the backend container after changes:
  ```bash
  docker compose restart backend
  ```
- **Database schema** — add an EF migration locally:
  ```bash
  # Requires .NET SDK installed locally, or run inside the container:
  docker compose exec backend dotnet ef migrations add YourMigrationName \
    --project /src/backend/eConnectOne.API
  ```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Port already in use | Change ports in `docker-compose.yml` |
| Backend can't connect to DB | Wait 10s, DB starts slower than backend |
| Frontend shows blank page | Check `VITE_API_BASE_URL` in `.env` |
| Want fresh DB | `docker compose down -v && docker compose up --build` |

## Environment files

| File | Purpose | In git? |
|------|---------|---------|
| `.env.example` | Template — safe to commit | ✅ Yes |
| `.env` | Your local values | ❌ No (gitignored) |
| `appsettings.Development.json` | Local backend config | ❌ No (gitignored) |
| `appsettings.json` | Base config (no real secrets) | ✅ Yes |
