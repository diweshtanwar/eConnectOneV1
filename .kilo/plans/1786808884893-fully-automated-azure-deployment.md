# eConnectOne Fully Automated Azure Deployment Plan

## Goal
Deliver a zero-touch, production-grade Azure deployment pipeline for eConnectOne using Bicep IaC + GitHub Actions OIDC + containerization, with encrypted lift-and-shift backup/restore between environments. The user provides only Azure subscription access and GitHub repo ownership; everything else is automated.

---

## Current State Assessment

| Component | Current State | Gap |
|-----------|--------------|-----|
| Azure Provisioning | Manual `setup-azure.ps1` (Azure CLI) | No IaC, no repeatability, no state tracking |
| CI/CD | Referenced in docs but **no workflow files exist** | Missing `.github/workflows/*.yml` |
| Secrets | Long-lived Service Principal JSON + ACR admin credentials | Should use OIDC + Managed Identities + Key Vault |
| Database Migrations | `EnsureCreated()` at startup (no EF migrations applied) | Needs `dotnet ef database update` automation |
| Backup/Restore | None | Needs encrypted pg_dump/pg_restore with Azure Blob storage |
| Networking | Open firewall `0.0.0.0` on PostgreSQL | Needs VNet + private endpoint or restricted NSG |

---

## Implementation Plan

### Phase 1: IaC Foundation (Bicep)

**Deliverables:**
1. `infra/main.bicep` — Root orchestration with modules for networking, ACR, PostgreSQL Flexible Server, App Service Plan, 2x App Services (backend/frontend), Key Vault, Log Analytics.
2. `infra/modules/*.bicep` — One module per resource type with security defaults.
3. `infra/parameters/{dev,staging,prod}.bicepparam` — Environment parameter files.

**Key Design Decisions:**
- **Networking**: Single VNet with one subnet delegated to PostgreSQL. NSG allows 80/443 from internet. PostgreSQL uses `AllowAzureServices` firewall rule as fallback; production should use private endpoint.
- **ACR**: `adminUserEnabled: false` — GitHub Actions uses OIDC + Managed Identity (AcrPull role). App Services also use Managed Identity for image pull.
- **PostgreSQL**: Flexible Server, Burstable B_Gen5_1 (dev) / GP_Gen5_2 (prod). `sslmode=require` enforced. Backup retention 7 days (dev) / 14 days (prod).
- **App Services**: Linux containers, `acrUseManagedIdentityCreds: true`. System-assigned Managed Identity enabled.
- **Key Vault**: RBAC authorization, purge protection enabled, soft-delete 90 days. Secrets populated by deployment script.
- **Log Analytics**: Diagnostic settings pipe App Service logs + PostgreSQL logs to centralized workspace.

### Phase 2: Master Deployment Script

**Deliverable:** `scripts/Deploy-Infra.ps1`

**Responsibilities:**
1. Validate prerequisites (`az`, `bicep`, `pwsh`, Docker).
2. Create/resource group if absent.
3. Resolve `principalObjectId` from current `az ad signed-in-user show`.
4. Generate secure PostgreSQL password (24-char random).
5. Run `bicep build` then `az deployment group create` with `--what-if` support.
6. Capture all outputs (Key Vault URI, connection strings, hostnames).
7. Populate Key Vault secrets: `POSTGRES-PASSWORD`, `POSTGRES-CONNECTION-STRING`, `JWT-SECRET-KEY`.
8. Create GitHub OIDC Service Principal with federated credential (`repo:{owner}/{repo}:ref:refs/heads/main`).
9. Output minimum secret list the user must copy to GitHub.

**Idempotency:** Script checks existing resource group; Bicep handles resource drift.

### Phase 3: GitHub Actions Workflows

**Deliverables:**
1. `.github/workflows/backend.yml` — Build, test, push backend image to ACR.
2. `.github/workflows/frontend.yml` — Build, push frontend image to ACR.
3. `.github/workflows/deploy.yml` — Deploy images to App Services + run DB migrations.

**Best Practices:**
- **OIDC Auth**: `azure/login@v2` with `client-id`, `tenant-id`, `subscription-id`. No `AZURE_CREDENTIALS` JSON secret.
- **Caching**: Cache NuGet (`~/.nuget/packages`) and npm (`~/.npm`) based on lockfile hashes.
- **Container Registry**: `docker/login-action` with OIDC-acquired ACR token.
- **Database Migrations**: After deployment, run `dotnet ef database update` against the production PostgreSQL using the connection string from Key Vault (fetched via Azure CLI with managed identity).
- **Environments**: Use `environment: dev|staging|prod` in workflows for protection rules.

### Phase 4: App Service Configuration

**Changes Required:**
1. Backend `Program.cs` currently uses `EnsureCreated()` — replace with EF Core migrations (`context.Database.Migrate()`). Seed admin user only if missing.
2. Backend `appsettings.Production.json`: Remove hardcoded JWT key; read from Key Vault reference or `JWT-SECRET-KEY` env var.
3. Frontend `nginx.conf`: Add `/api` proxy to backend hostname (dynamic via env var or hardcoded to Azure hostname).
4. Dockerfile backend: Expose port 80 (Azure App Service expects 80 by default). Keep 10000 as secondary for local dev.

### Phase 5: Lift-and-Shift Backup/Restore Automation

**Deliverable:** `scripts/Backup-Restore.ps1`

**Capabilities:**
1. **Backup**: `pg_dump` from source PostgreSQL → gzip → AES-256 encrypt with user-provided passphrase → upload to Azure Blob Storage (new or existing storage account).
2. **Restore**: Download blob → decrypt → `psql` into target PostgreSQL Flexible Server.
3. **RBAC**: Uses Managed Identity or stored SAS token. Principle of least privilege: Storage Blob Data Contributor on specific container only.
4. **Verification**: Post-restore table count + schema version check.

**Minimum User Input for Restore:**
- Target environment name
- Encryption passphrase
- Backup blob URL

### Phase 6: Documentation

**Deliverable:** `docs/AZURE_DEPLOYMENT_PRODUCTION.md`

**Sections:**
1. Executive Summary (automated pipeline, zero manual Azure Portal steps after initial auth)
2. System Architecture diagram (text-based)
3. Prerequisites (tools table with install commands)
4. **One-Command Deployment**: `.\scripts\Deploy-Infra.ps1 -Environment dev`
5. **Credential Configuration**: 3 GitHub Secrets only (`AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`) — all set by the script automatically via OIDC federated credential.
6. Lift-and-Shift procedure (source env → target env)
7. Disaster Recovery restore runbook
8. Troubleshooting matrix (Bicep deployment failure, ACR pull failure, DB migration failure, OIDC auth failure)

---

## Minimum User Steps (After Plan Execution)

| Step | Action | Frequency |
|------|--------|-----------|
| 1 | Run `.\scripts\Deploy-Infra.ps1 -Environment dev` | Once per environment |
| 2 | Copy 3 secrets to GitHub repo (`AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`) | Once per environment |
| 3 | Push code to `main` | Every deployment |
| 4 | For lift-and-shift: `.\scripts\Backup-Restore.ps1 -Action Backup -SourceEnv prod -TargetEnv staging` | As needed |

**No Azure Portal configuration required after Step 1.** All App Service settings, Key Vault secrets, and diagnostic settings are provisioned by IaC.

---

## Security Hardening Summary

| Control | Implementation |
|---------|----------------|
| Authentication | GitHub OIDC → Azure (no client secrets) |
| Container Pull | App Service Managed Identity (ACR admin disabled) |
| Secrets | Azure Key Vault (RBAC, soft-delete, purge protection) |
| Database | SSL required, admin password in Key Vault, firewall restricted to Azure services |
| Backups | AES-256 encrypted at rest, SAS-scoped to single container |
| Networking | NSG + VNet, HTTPS-only App Services |

---

## Validation Plan

1. **IaC Validation**: `bicep build` + `az deployment group what-if` against dev RG.
2. **Smoke Test**: After deployment, workflow curls `/health` on backend and `/` on frontend.
3. **Migration Test**: Workflow runs `dotnet ef database update` and verifies `__EFMigrationsHistory` table exists.
4. **Lift-and-Shift Test**: Backup prod → restore staging → run API smoke tests against staging.
5. **Security Test**: Verify ACR admin disabled, Managed Identity used, no plaintext secrets in App Service.

---

## Implementation Plan (Free Tier — $0/month)

### Phase 1: IaC Foundation (Bicep)

**Deliverables:**
1. `infra/main.bicep` — Root orchestration with modules for ACR, Container Apps (backend), Static Web Apps (frontend).
2. `infra/modules/containerregistry.bicep` — ACR F1 (free) with `adminUserEnabled: false`.
3. `infra/modules/container-app.bicep` — Azure Container Apps with managed identity, scale-to-zero, ingress.
4. `infra/modules/static-web-app.bicep` — Azure Static Web Apps Free tier with GitHub integration.
5. `infra/parameters/{dev,staging,prod}.bicepparam` — Environment parameter files with Neon connection string and JWT key.

**Key Design Decisions:**
- **No networking modules**: No VNet, NSG, or Key Vault. Neon is external; Azure resources use public endpoints with OIDC auth.
- **ACR**: F1 (free) SKU, `adminUserEnabled: false`. Container Apps uses managed identity for image pull.
- **Backend**: Azure Container Apps, 0.5 CPU / 1 GB memory, minReplicas=0 (scale-to-zero), maxReplicas=1. Ingress on port 10000.
- **Frontend**: Azure Static Web Apps Free, GitHub-connected, SPA routing enabled.
- **Secrets**: Passed as Bicep `@secure()` parameters (Neon connection string, JWT key). Stored in Container Apps secrets + GitHub Actions secrets.

### Phase 2: Master Deployment Script

**Deliverable:** `scripts/Deploy-Infra.ps1`

**Responsibilities:**
1. Validate prerequisites (`az`, `bicep`, `pwsh`).
2. Create/resource group if absent.
3. Resolve `principalObjectId` from current `az ad signed-in-user show`.
4. Generate secure JWT secret key (64-char random).
5. Run `bicep build` then `az deployment group create`.
6. Capture all outputs (ACR login server, Container App hostname, Static Web App hostname).
7. Create GitHub OIDC Service Principal with federated credential (`repo:diweshtanwar/eConnectOneV1:ref:refs/heads/main`).
8. Output the 5 GitHub secrets the user must copy.

**Required Script Parameters:**
- `-Environment` (dev/staging/prod)
- `-NeonConnectionString` (mandatory, `postgresql://...?sslmode=require`)

### Phase 3: GitHub Actions Workflows

**Deliverables:**
1. `.github/workflows/backend.yml` — Build .NET Docker image, push to ACR F1.
2. `.github/workflows/frontend.yml` — Build Node/Vite Docker image, push to ACR F1.
3. `.github/workflows/deploy.yml` — Deploy images to Container Apps + Static Web Apps, run DB migrations, smoke test.

**Best Practices:**
- **OIDC Auth**: `azure/login@v2` with `client-id`, `tenant-id`, `subscription-id`.
- **Caching**: Cache NuGet (`~/.nuget/packages`) and npm (`~/.npm`) based on lockfile hashes.
- **ACR Push**: Tags with commit SHA. Container Apps and Static Web Apps pull from ACR.
- **Database Migrations**: After deployment, run `dotnet ef database update` using `NEON_CONNECTION_STRING` secret.
- **Static Web Apps**: Deploy via Azure CLI (`az staticwebapp create` or update GitHub workflow).

### Phase 4: Application Updates

**Changes Required:**
1. Backend `Program.cs`: Already uses `Migrate()` in production and reads `JWT-SECRET-KEY` from environment. Ensure `DATABASE_URL` is read from env (it already is).
2. Backend `Dockerfile`: Expose port 10000, set `ASPNETCORE_URLS=http://+:10000` (already done).
3. Frontend `nginx.conf`: SPA fallback + `/health` endpoint (already done).
4. Frontend `Dockerfile`: Build with Vite, serve with Nginx (already done).

### Phase 5: Lift-and-Shift Backup/Restore

**Deliverable:** `scripts/Backup-Restore.ps1`

**Capabilities:**
1. **Backup**: `pg_dump` from Neon → AES-256 encrypt → upload to Azure Blob Storage (or local file).
2. **Restore**: Download blob → decrypt → `psql` into target Neon database.
3. **Verification**: Post-restore table count check.

**Minimum User Input for Restore:**
- Neon connection string for target environment
- Encryption passphrase
- Backup blob URL or local file path

### Phase 6: Documentation

**Deliverable:** `docs/AZURE_DEPLOYMENT_PRODUCTION.md`

**Sections:**
1. Executive Summary ($0/month architecture, zero-touch deployment)
2. System Architecture (text diagram)
3. Prerequisites (tools + Neon.tech account)
4. **One-Command Deployment**: `.\scripts\Deploy-Infra.ps1 -Environment dev -NeonConnectionString "postgresql://..."`
5. **Credential Configuration**: 5 GitHub Secrets (`AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`, `NEON_CONNECTION_STRING`, `JWT_SECRET_KEY`)
6. Lift-and-Shift procedure
7. Disaster Recovery restore runbook
8. Troubleshooting matrix

---

## Minimum User Steps (After Plan Execution)

| Step | Action | Frequency |
|------|--------|-----------|
| 1 | Create Neon.tech project, copy connection string | Once |
| 2 | Run `.\scripts\Deploy-Infra.ps1 -Environment dev -NeonConnectionString "postgresql://..."` | Once per environment |
| 3 | Copy 5 secrets to GitHub repo | Once per environment |
| 4 | Push code to `main` | Every deployment |
| 5 | For lift-and-shift: `.\scripts\Backup-Restore.ps1 -Action Backup -SourceEnv prod` | As needed |

**No Azure Portal configuration required after Step 2.** All Azure resources are provisioned by IaC.

---

## Security Hardening Summary (Free Tier)

| Control | Implementation |
|---------|----------------|
| **Authentication** | GitHub OIDC → Azure (no client secrets) |
| **Container Pull** | Container Apps Managed Identity (ACR admin disabled) |
| **Secrets** | GitHub Secrets for CI/CD; Container Apps secrets for runtime |
| **Database** | Neon SSL required (`sslmode=require`), password in GitHub Secrets |
| **Networking** | HTTPS-only Static Web Apps; Container Apps public ingress with CORS |

---

## Validation Plan

1. **IaC Validation**: `bicep build` + `az deployment group what-if` against dev RG.
2. **Smoke Test**: After deployment, workflow curls `/health` on backend and `/` on frontend.
3. **Migration Test**: Workflow runs `dotnet ef database update` and verifies `__EFMigrationsHistory` table exists in Neon.
4. **Security Test**: Verify ACR admin disabled, Managed Identity used, no plaintext secrets in Container Apps logs.
5. **Cost Test**: Verify all resources are on Free/F1 tiers; Azure bill shows $0 for compute.

---

## New Files to Create

| File | Purpose |
|------|---------|
| `infra/modules/containerregistry.bicep` | ACR F1 module |
| `infra/modules/container-app.bicep` | Container Apps backend module |
| `infra/modules/static-web-app.bicep` | Static Web Apps frontend module |
| `infra/main.bicep` | Free-tier root orchestration |
| `infra/parameters/{dev,staging,prod}.bicepparam` | Environment params with Neon connection string |
| `scripts/Deploy-Infra.ps1` | Free-tier master deployment script |
| `.github/workflows/backend.yml` | Build + push backend image |
| `.github/workflows/frontend.yml` | Build + push frontend image |
| `.github/workflows/deploy.yml` | Deploy to Container Apps + Static Web Apps, run migrations |
| `scripts/Backup-Restore.ps1` | Neon-compatible backup/restore |
| `docs/AZURE_DEPLOYMENT_PRODUCTION.md` | Updated production manual |

## Files to Modify

| File | Change |
|------|--------|
| `backend/eConnectOne.API/Program.cs` | Already supports `JWT-SECRET-KEY` env var + `Migrate()` |
| `Dockerfile` | Already exposes 10000, configurable port |
| `frontend/Dockerfile` | Already multi-stage with nginx |
| `frontend/nginx.conf` | Already has SPA fallback + `/health` |
| `docker-compose.prod.yml` | Update `ASPNETCORE_PORT` env var |
