 # eConnectOne Fully Automated Azure Deployment — Production Technical Manual

## Executive Summary

This document describes the production-grade, fully automated CI/CD and Infrastructure-as-Code (IaC) strategy for eConnectOne on Microsoft Azure. The pipeline is designed for **zero-touch deployment** after initial credential configuration. It replaces manual Azure CLI commands with declarative Bicep templates, implements GitHub Actions with OIDC authentication, enforces security hardening via Managed Identities and Azure Key Vault, and provides encrypted lift-and-shift backup/restore capabilities between environments.

**Key Characteristics:**
- **Minimal User Input**: Run one PowerShell script, copy three GitHub secrets, push code.
- **Maximum Reliability**: IaC state tracking, idempotent deployments, automated smoke tests, encrypted backups.
- **Security First**: No long-lived secrets, OIDC authentication, Managed Identities, Key Vault with purge protection, AES-256 backup encryption.
- **Containerized**: Docker multi-stage builds for both backend (.NET 9) and frontend (Node 20 + Nginx).

---

## System Architecture

### Azure Resource Topology

```
[GitHub Repository]
    │  (OIDC federation)
    ▼
[GitHub Actions Runner]
    │
    ├──> [Azure Key Vault]          ← Secrets & Certificates (RBAC, no plaintext)
    │
    ├──> [Azure Container Registry] ← Docker images (Managed Identity pull, admin disabled)
    │
    ├──> [App Service Plan]         ← Linux B1 (dev/staging) / S1 (prod)
    │       ├── Backend App Service ← Managed Identity + Key Vault references
    │       └── Frontend App Service← Managed Identity + static Nginx
    │
    ├──> [Azure Database for PostgreSQL Flexible Server]
    │       ├── VNet Integration    ← Private endpoint / delegated subnet
    │       └── Automated Backups   ← Encrypted, geo-redundant (prod)
    │
    ├──> [Log Analytics Workspace]  ← Centralized logging & monitoring
    │
    └──> [Virtual Network]          ← NSG rules, service endpoints
```

### Resource Naming Convention

| Resource | Pattern | Dev Example | Prod Example |
|----------|---------|-------------|--------------|
| Resource Group | `rg-{project}-{env}` | `rg-econnectone-dev` | `rg-econnectone-prod` |
| Container Registry | `cr{project}{env}` | `creconnectonedev` | `creconnectoneprod` |
| PostgreSQL Server | `psql-{project}-{env}` | `psql-econnectone-dev` | `psql-econnectone-prod` |
| App Service Plan | `plan-{project}-{env}` | `plan-econnectone-dev` | `plan-econnectone-prod` |
| Backend App | `app-{project}-api-{env}` | `app-econnectone-api-dev` | `app-econnectone-api-prod` |
| Frontend App | `app-{project}-web-{env}` | `app-econnectone-web-dev` | `app-econnectone-web-prod` |
| Key Vault | `kv-{project}-{env}` | `kv-econnectone-dev` | `kv-econnectone-prod` |
| Log Analytics | `log-{project}-{env}` | `log-econnectone-dev` | `log-econnectone-prod` |

---

## Prerequisites

### Required Tools

| Tool | Minimum Version | Purpose | Install Command |
|------|----------------|---------|-----------------|
| Azure CLI | `>= 2.50.0` | Cloud authentication & resource management | `winget install Microsoft.AzureCLI` |
| Bicep CLI | `>= 0.26.0` | IaC compilation | `az bicep install` |
| PowerShell | `>= 7.2` (Core) | Master orchestration scripts | Built-in on Windows 11 / `winget install Microsoft.PowerShell` |
| Docker Desktop | `>= 24.0` | Local container builds | `winget install Docker.DockerDesktop` |
| .NET SDK | `9.0.x` | Backend build & migrations | `winget install Microsoft.DotNet.SDK.9` |
| Node.js | `20.x` | Frontend build | `winget install OpenJS.NodeJS` |
| Git | `>= 2.40` | Source control | Built-in or `winget install Git.Git` |
| Azure PowerShell | `>= 11.0` | Advanced Azure automation | `Install-Module -Name Az -Scope CurrentUser -Repository PSGallery -Force` |
| pg_dump / psql | `>= 16` | Database backup/restore | Part of PostgreSQL client tools |

### Azure Permissions

The deploying identity must have:
- **Owner** or **Contributor** role on the target subscription/resource group
- Ability to create **Azure AD applications** (for managed identity RBAC and OIDC federated credentials)
- **Key Vault Administrator** role on the target Key Vault (for secret population during deployment)

---

## Implementation Guide

### Phase 1: Infrastructure Provisioning (IaC)

#### 1.1 Bicep File Structure

```
infra/
├── main.bicep                    # Root deployment orchestration
├── modules/
│   ├── networking.bicep           # VNet, Subnet, NSG
│   ├── keyvault.bicep             # Key Vault with RBAC & purge protection
│   ├── containerregistry.bicep    # ACR with managed identity & content trust
│   ├── postgres.bicep             # PostgreSQL Flexible Server + backup policy
│   ├── appservice-plan.bicep      # App Service Plan (Linux)
│   ├── appservice-web.bicep       # Generic web app (backend/frontend)
│   └── log-analytics.bicep        # Log Analytics workspace
├── parameters/
│   ├── dev.bicepparam
│   ├── staging.bicepparam
│   └── prod.bicepparam
└── scripts/
    └── Deploy-Infra.ps1           # Master deployment script
```

#### 1.2 One-Command Deployment

```powershell
# From project root
.\scripts\Deploy-Infra.ps1 -Environment dev -Location southeastasia
```

The script performs the following automatically:
1. Validates prerequisites (Azure CLI, Bicep, PowerShell)
2. Creates the resource group if absent
3. Resolves the current Azure AD principal object ID
4. Generates a secure 24-character PostgreSQL password
5. Compiles and deploys Bicep templates with `--what-if` support
6. Populates Key Vault with `POSTGRES-PASSWORD`, `POSTGRES-CONNECTION-STRING`, and `JWT-SECRET-KEY`
7. Configures App Service environment variables (DATABASE_URL, ASPNETCORE_URLS, DOTNET_ENVIRONMENT, JWT-SECRET-KEY via Key Vault reference)
8. Creates a GitHub OIDC Service Principal with federated credential (`repo:diweshtanwar/eConnectOneV1:ref:refs/heads/main`)
9. Outputs deployment URLs and the three GitHub secrets required for CI/CD

---

### Phase 2: CI/CD Pipeline Configuration (GitHub Actions)

#### 2.1 Required GitHub Secrets

After running `Deploy-Infra.ps1`, add exactly **three** secrets to your GitHub repository (`Settings` → `Secrets and variables` → `Actions`):

| Secret Name | Value | Source |
|-------------|-------|--------|
| `AZURE_CLIENT_ID` | Service Principal App ID | Output by Deploy-Infra.ps1 |
| `AZURE_TENANT_ID` | Azure AD Tenant ID | Output by Deploy-Infra.ps1 |
| `AZURE_SUBSCRIPTION_ID` | Azure Subscription ID | Output by Deploy-Infra.ps1 |

**No `AZURE_CREDENTIALS` JSON secret is required.** OIDC federation eliminates the need for long-lived client secrets.

#### 2.2 Workflow Overview

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| Backend Build | `.github/workflows/backend.yml` | Push to main/develop (backend changes) | Build .NET Docker image, push to ACR |
| Frontend Build | `.github/workflows/frontend.yml` | Push to main/develop (frontend changes) | Build Node/Vite Docker image, push to ACR |
| Deploy | `.github/workflows/deploy.yml` | Push to main or manual dispatch | Deploy images to App Services, run DB migrations, smoke test |

#### 2.3 Backend Workflow (`backend.yml`)

**Triggers:** Push/PR to `main` or `develop` when `backend/**`, `Dockerfile`, or `*.csproj` changes.

**Key Features:**
- **OIDC Auth**: `azure/login@v2` with `client-id`, `tenant-id`, `subscription-id`
- **Docker Buildx**: Multi-platform builds with GitHub Actions cache
- **ACR Push**: Tags with both commit SHA and `latest`

```yaml
# See .github/workflows/backend.yml for full implementation
```

#### 2.4 Frontend Workflow (`frontend.yml`)

**Triggers:** Push/PR to `main` or `develop` when `frontend/**`, `frontend/Dockerfile`, or `frontend/package*.json` changes.

**Key Features:**
- **OIDC Auth**: Same as backend
- **npm ci**: Clean install based on lockfile hash
- **Docker Buildx**: Builds `nginx:alpine` multi-stage image

```yaml
# See .github/workflows/frontend.yml for full implementation
```

#### 2.5 Deploy Workflow (`deploy.yml`)

**Triggers:** Push to `main` or manual dispatch with environment selection (`prod`, `staging`, `dev`).

**Steps:**
1. Log in to Azure via OIDC
2. Determine target environment and corresponding ACR/resource group/app names
3. Deploy backend image to App Service (`az webapp config container set`)
4. Deploy frontend image to App Service
5. Wait for backend to reach `Running` state
6. Retrieve PostgreSQL connection string from Key Vault
7. Run `dotnet ef database update` against production database
8. Execute smoke tests (HTTP 200 on `/health` and `/`)
9. Post deployment summary to GitHub Actions UI

---

### Phase 3: Environment Configuration

#### 3.1 App Service Settings (Automated)

The `Deploy-Infra.ps1` script configures the following automatically:

**Backend App Service:**
| Setting | Value |
|---------|-------|
| `DATABASE_URL` | `postgresql://postgres:...@psql-...:5432/eConnectOne?sslmode=require` |
| `ASPNETCORE_URLS` | `http://+:80` |
| `DOTNET_ENVIRONMENT` | `Production` |
| `JWT-SECRET-KEY` | Key Vault reference (`@Microsoft.KeyVault(...)`) |
| `WEBSITES_PORT` | `80` |

**Frontend App Service:**
| Setting | Value |
|---------|-------|
| `VITE_API_BASE_URL` | `https://app-econnectone-api-{env}.azurewebsites.net/api` |

#### 3.2 Application Code Changes

**Backend (`Program.cs`):**
- JWT key now reads from `JWT-SECRET-KEY` environment variable if present (falls back to `appsettings.json`)
- Database initialization uses `Migrate()` in production (applies EF Core migrations) and `EnsureCreated()` in development
- Admin user seeding remains idempotent (checks existence before creating)

**Frontend (`nginx.conf`):**
- SPA fallback: `try_files $uri $uri/ /index.html`
- Health check endpoint: `/health` returns 200
- Removed hardcoded `proxy_pass` to backend (SPA calls API directly via `VITE_API_BASE_URL`)

---

## Operational Procedures

### One-Command Deployment

```powershell
# New environment (dev/staging/prod)
.\scripts\Deploy-Infra.ps1 -Environment prod -Location southeastasia

# Subsequent deployments (CI/CD handles this)
git commit -m "release: v1.2.3"
git push origin main
```

### Automated Backup & Migration (Lift-and-Shift)

```powershell
# Backup from production to Azure Blob Storage (AES-256 encrypted)
.\scripts\Backup-Restore.ps1 -Action Backup -SourceEnv prod -StorageAccountName econnectonebackups

# Restore to staging from a specific blob
.\scripts\Backup-Restore.ps1 -Action Restore -TargetEnv staging -BlobUrl https://econnectonebackups.blob.core.windows.net/backups/econnectone-prod-20250815.sql.aes -Passphrase "YourSecurePassphrase"
```

**Minimum Input for Restore:**
- Target environment name
- Encryption passphrase (used during backup)
- Backup blob URL (or local file path)

### Disaster Recovery (Restore)

1. Identify last known good backup blob in Azure Blob Storage
2. Confirm target environment (e.g., `prod`)
3. Run restore command with passphrase
4. Verify table count via `psql` or application smoke tests
5. Update DNS/custom domain if applicable

---

## Troubleshooting & Maintenance

### Common Failure Points

| Failure Point | Symptom | Diagnosis | Resolution |
|---------------|---------|-----------|------------|
| **Bicep deployment** | `az deployment group create` returns 400/409 | Check parameter names, resource name conflicts | Run with `-WhatIf`; verify global uniqueness of ACR/PostgreSQL names |
| **OIDC auth failure** | GitHub Actions fails at `azure/login` | Check `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID` secrets; verify federated credential subject matches repo/branch | Re-run `Deploy-Infra.ps1` or manually create federated credential in Azure Portal |
| **ACR pull failure** | App Service container fails to start | Verify ACR name, tag, and Managed Identity has `AcrPull` role | Check App Service logs: `az webapp log tail` |
| **Database migration failure** | `dotnet ef database update` exits non-zero | Check connection string, firewall rules, Key Vault access | Verify PostgreSQL firewall allows GitHub Actions IPs (or use VNet integration) |
| **Backup encryption failure** | `Backup-Restore.ps1` throws on decrypt | Wrong passphrase or corrupted file | Re-run backup with known passphrase; verify blob integrity |
| **Frontend 404 on refresh** | Nginx returns 404 for SPA routes | Missing `try_files` directive in nginx.conf | Ensure `frontend/nginx.conf` has SPA fallback |

### Maintenance Commands

```powershell
# View Bicep deployment history
az deployment group list --resource-group rg-econnectone-prod --query "[].{name:name, time:timestamp}" -o table

# Tail App Service logs
az webapp log tail --resource-group rg-econnectone-prod --name app-econnectone-api-prod

# Rotate PostgreSQL password (update Key Vault + App Service)
az keyvault secret set --vault-name kv-econnectone-prod --name POSTGRES-PASSWORD --value "NewSecurePassword123!"
az webapp config appsettings set --resource-group rg-econnectone-prod --name app-econnectone-api-prod --settings DATABASE_URL="postgresql://postgres:NewSecurePassword123!@psql-econnectone-prod.postgres.database.azure.com:5432/eConnectOne?sslmode=require"

# Manual database migration
cd backend/eConnectOne.API
dotnet ef database update --connection "$(az keyvault secret show --vault-name kv-econnectone-prod --name POSTGRES-CONNECTION-STRING --query value -o tsv)"

# List backups in storage
az storage blob list --account-name econnectonebackups --container-name backups --output table
```

---

## Security Hardening Summary

| Control | Implementation |
|---------|----------------|
| **Authentication** | GitHub OIDC → Azure (no client secrets stored in GitHub) |
| **Container Pull** | App Service Managed Identity (ACR admin user disabled) |
| **Secrets** | Azure Key Vault with RBAC, soft-delete (90 days), purge protection |
| **Database** | SSL required (`sslmode=require`), admin password in Key Vault, firewall restricted to Azure services |
| **Backups** | AES-256 encrypted at rest, SAS-scoped to single container |
| **Networking** | NSG + VNet, HTTPS-only App Services, private DNS zone for PostgreSQL |

---

## Appendix

### A. EF Core Migrations

The project includes an initial migration (`20250916082204_InitialCleanMigration`). To add new migrations:

```bash
cd backend/eConnectOne.API
dotnet ef migrations add AddNewFeature
dotnet ef database update
```

### B. Cost Estimate (Production)

| Resource | SKU | Approx. Monthly Cost |
|----------|-----|----------------------|
| Container Registry | Basic | ~$5 |
| App Service Plan | S1 (Standard) | ~$70 |
| PostgreSQL Flexible Server | GP_Gen5_2 | ~$150 |
| Log Analytics | Pay-as-you-go | ~$5-20 |
| Backup Storage | Standard LRS | ~$2-5 |
| **Total** | | **~$230-250/month** |

### C. Support

For issues:
1. Check GitHub Actions workflow logs for CI/CD failures
2. Check Azure App Service Log Stream for runtime errors
3. Check Log Analytics workspace for centralized diagnostics
4. Run `.\scripts\Deploy-Infra.ps1 -WhatIf` to validate IaC changes
