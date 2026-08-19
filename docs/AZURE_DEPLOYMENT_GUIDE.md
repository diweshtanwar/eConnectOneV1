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

1. **Provisions** Azure resources (ACR + PostgreSQL + Container Apps) via Bicep — idempotent, safe to run repeatedly
2. **Builds** backend and frontend Docker images, pushes to your ACR
3. **Migrates** the database:
   - First deploy: creates all tables, seeds admin user (`admin` / `admin123`)
   - Subsequent deploys: only applies new migrations, **never touches existing data**
4. **Deploys** new container images to Azure Container Apps
5. **Health checks** and posts URLs to the workflow summary

---

## Lift & Shift to Another Azure Account

To move to a different Azure subscription/account:

1. Create a new service principal in the new account (same command above)
2. Update `AZURE_CREDENTIALS` secret in GitHub with the new SP JSON
3. Update `AZURE_RESOURCE_GROUP` if desired
4. Push any commit (or use "Run workflow" manually)

Everything is re-provisioned automatically. The database will be fresh in the new account — if you need to migrate data, use `pg_dump` / `pg_restore` before switching.

---

## Resource Names Created

All resources are named with the environment suffix (`prod` by default):

| Resource | Name |
|---|---|
| Container Registry | `creconnectoneeprod` |
| PostgreSQL Server | `pg-econnectone-prod` |
| Backend Container App | `app-econnectone-api-prod` |
| Frontend Container App | `app-econnectone-web-prod` |

To change environment, update `ENVIRONMENT: prod` in `.github/workflows/azure-deploy.yml`.

---

## Costs (approximate, Southeast Asia region)

| Resource | Tier | ~Monthly Cost |
|---|---|---|
| Container Registry | Basic | ~$5 |
| PostgreSQL Flexible Server | Standard_B1ms | ~$15 |
| Container Apps (backend) | Scale-to-zero | ~$0–5 |
| Container Apps (frontend) | Scale-to-zero | ~$0–3 |
| **Total** | | **~$20–28/month** |
