# Azure Deployment Setup Guide

## One-Time Setup: GitHub Secrets

Go to your GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**

Add these 4 secrets:

| Secret Name | How to get it |
|---|---|
| `AZURE_CREDENTIALS` | See step below |
| `AZURE_RESOURCE_GROUP` | Name you want, e.g. `rg-econnectone-prod` |
| `POSTGRES_ADMIN_PASSWORD` | Strong password, e.g. `MyP@ss2025!` (min 8 chars, must have uppercase, number, symbol) |
| `JWT_SECRET_KEY` | Any long random string, e.g. 64+ chars |

### Get AZURE_CREDENTIALS

Run this in Azure CLI (install from https://aka.ms/installazurecliwindows):

```bash
# Login
az login

# Get your subscription ID
az account show --query id -o tsv

# Create service principal (replace YOUR_SUBSCRIPTION_ID and YOUR_RESOURCE_GROUP)
az ad sp create-for-rbac \
  --name "econnectone-github-deploy" \
  --role Contributor \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID \
  --sdk-auth
```

Copy the entire JSON output as the value of `AZURE_CREDENTIALS`.

---

## How It Works After Setup

Every push to `main` automatically:

1. **Provisions** Azure resources (ACR + PostgreSQL + Container App) via Bicep — idempotent, safe to run repeatedly
2. **Builds** a single combined frontend+backend Docker image, pushes to your ACR
3. **Migrates** the database:
   - First deploy: creates all tables, seeds admin user (`admin` / `admin123`)
   - Subsequent deploys: only applies new migrations, **never touches existing data**
4. **Deploys** the new container image to Azure Container Apps
5. **Health checks** and posts the URL to the workflow summary

---

## Lift & Shift to Another Azure Account

To move to a different Azure subscription/account:

1. Create a new service principal in the new account (same command above)
2. Update `AZURE_CREDENTIALS` secret in GitHub with the new SP JSON
3. Update `AZURE_RESOURCE_GROUP` if desired
4. Push any commit (or use "Run workflow" manually)

Everything is re-provisioned automatically. The database will be fresh in the new account — if you need to migrate data, use `pg_dump` / `pg_restore` before switching.

---

## One-Time Data Migration (Local → Azure)

If you need to move your existing local Docker PostgreSQL data into Azure for the first deployment, use:

```powershell
pwsh -NoProfile -File .\scripts\Migrate-LocalToAzure.ps1 -Environment prod
```

- Defaults to the local Docker connection string: `Host=localhost;Port=5432;Database=eConnectOne;Username=postgres;Password=postgres@123`
- Run `-WhatIf` first for a dry run, and add `-SkipConfirmation` only if you explicitly want to bypass the safety prompt
- The script looks up the Azure PostgreSQL server and Key Vault by the naming pattern from `infra/main.bicep`; if no password secret is available, set `AZURE_POSTGRES_PASSWORD` before running
- Use this only for the initial lift-and-shift of real data; ongoing schema changes are already handled automatically by EF Core migrations in `.github/workflows/azure-deploy.yml`

---

## Cleaning Up Old Two-Container Resources

If you previously deployed the old split architecture (`app-econnectone-api-*` + `app-econnectone-web-*`), you can manually clean up leftover Azure resources with:

```powershell
pwsh -NoProfile -File .\scripts\Cleanup-OldAzureResources.ps1 -Environment prod
```

- Checks for the old Container Apps and legacy ACR repositories (`econnectone-backend`, `econnectone-frontend`)
- Prompts before deleting anything; run `-WhatIf` first if you want to review what would be removed
- Manual one-time cleanup only — this is intentionally not part of the CI/CD pipeline

---

## Resource Names Created

All resources are named with the environment suffix (`prod` by default):

| Resource | Name |
|---|---|
| Container Registry | `acreconnprodec1` |
| PostgreSQL Server | `pg-econn-prod-ec1` |
| Key Vault | `kv-econn-prod-ec1` |
| App Container App (frontend + backend) | `app-econnectone-prod` |

To change environment, update `ENVIRONMENT: prod` in `.github/workflows/azure-deploy.yml`.

---

## Costs (approximate, Southeast Asia region)

| Resource | Tier | ~Monthly Cost |
|---|---|---|
| Container Registry | Basic | ~$5 |
| PostgreSQL Flexible Server | Standard_B1ms | ~$15 |
| Container App (frontend + backend) | Scale-to-zero | ~$0–5 |
| **Total** | | **~$20–25/month** |
