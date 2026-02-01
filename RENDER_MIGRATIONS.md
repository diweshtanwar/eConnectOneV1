# Render Deployment Configuration - Auto-Migrations

## Option 1: Via Render Dashboard (Quick)

1. Go to Render Dashboard → eConnectOne-API Service
2. Click **Settings**
3. Scroll to **Build Command**
4. Replace with:
   ```bash
   bash render-build.sh
   ```
5. Click **Save**
6. Trigger a new deployment (redeploy or push to main)

## Option 2: Via render.yaml (Already configured)

The `render.yaml` file in the root directory now includes the build command that:
- Builds the backend in Release mode
- Applies pending EF Core migrations
- Handles migration errors gracefully (won't fail deployment if migrations fail)
- Starts the application

## How It Works

When you push to GitHub:
1. Render detects the changes
2. Runs `bash render-build.sh`:
   - Compiles the backend (`dotnet build -c Release`)
   - Applies migrations (`dotnet ef database update`)
   - Continues even if migrations have warnings
3. Starts the application with `dotnet eConnectOne.API.dll`

## What Gets Applied

On next deployment, these 8 performance indexes will be created on Supabase:
- `idx_users_roleid` - Fast user lookups by role
- `idx_wallets_userid` - Fast wallet lookups by user
- `idx_generaluserdetails_userid` - Fast general user details lookups
- `idx_userdocuments_code` - Fast document code lookups
- `idx_tickets_statusid_isdeleted` - Fast ticket status and soft-delete filtering
- `idx_users_email_isdeleted` - Fast login queries
- `idx_commissions_cspuserid_year_month` - Fast commission reporting
- `idx_userdetails_userid` - Fast CSP user details lookups

## Testing Locally

To test migrations locally before pushing:
```bash
cd backend/eConnectOne.API
dotnet ef database update --context ApplicationDbContext
```

## Rollback

If needed, rollback to previous migration:
```bash
dotnet ef database update [previous-migration-name] --context ApplicationDbContext
```
