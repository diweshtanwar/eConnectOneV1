# Azure Deployment Implementation Guide

## 📋 Overview

This guide walks you through deploying eConnectOne to Azure with GitHub Actions automation.

**What we've prepared:**
- ✅ Updated docker-compose files to use environment variables for passwords
- ✅ Created GitHub Actions workflow (`azure-deploy.yml`)
- ✅ Created setup script (`setup-azure.ps1`) to provision Azure resources
- ✅ Configured automatic database initialization

---

## 🔧 Step-by-Step Implementation

### **Phase 1: Set Up Azure Resources** (15-30 minutes)

#### 1.1 Install Azure CLI
If you haven't already:
```powershell
# Download and install from: https://learn.microsoft.com/en-us/cli/azure/install-azure-cli
# Or via winget (Windows):
winget install Microsoft.AzureCLI
```

#### 1.2 Login to Azure
```powershell
az login
```
This opens a browser to authenticate with your Azure account.

#### 1.3 Run Setup Script
```powershell
cd e:\Projects\Source\eConnectOneV1
.\scripts\setup-azure.ps1
```

This script will:
- Create Resource Group
- Create Azure Container Registry (ACR)
- Create PostgreSQL Database (with secure auto-generated password)
- Create App Service Plan
- Create App Services (Backend & Frontend)
- Display credentials for GitHub Secrets

**⏱️ Note:** PostgreSQL creation takes 5-10 minutes. Be patient.

#### 1.4 Save the Output
The script displays critical information at the end:
```
AZURE_SUBSCRIPTION_ID: xxxxx
AZURE_RESOURCE_GROUP: rg-eConnectOne
ACR_NAME: econnectone
ACR_USERNAME: econnectone
ACR_PASSWORD: xxxxx
BACKEND_APP_NAME: econnectone-backend
FRONTEND_APP_NAME: econnectone-frontend
POSTGRES_PASSWORD: <your secure password>
PostgreSQL Connection: postgresql://postgres:PASSWORD@econnectone-postgres.postgres.database.azure.com:5432/eConnectOne?sslmode=require
```

**Save this information securely** — you'll need it next.

---

### **Phase 2: Create Azure Service Principal for GitHub Actions** (5 minutes)

GitHub Actions needs permission to deploy to Azure. Create a Service Principal:

```powershell
# Replace with your actual subscription ID from Phase 1
$subscriptionId = "<your-subscription-id>"

az ad sp create-for-rbac `
  --name econnectone-github-action `
  --role Contributor `
  --scopes /subscriptions/$subscriptionId
```

This outputs JSON like:
```json
{
  "clientId": "xxxxx",
  "clientSecret": "xxxxx",
  "subscriptionId": "xxxxx",
  "tenantId": "xxxxx"
}
```

**Copy this entire JSON block** — you'll add it as a GitHub Secret.

---

### **Phase 3: Add GitHub Secrets** (10 minutes)

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

Click **New repository secret** and add these secrets one by one:

| Secret Name | Value |
|-------------|-------|
| `AZURE_SUBSCRIPTION_ID` | From Phase 1 output |
| `AZURE_RESOURCE_GROUP` | `rg-eConnectOne` |
| `ACR_NAME` | `econnectone` |
| `ACR_USERNAME` | From Phase 1 output |
| `ACR_PASSWORD` | From Phase 1 output |
| `BACKEND_APP_NAME` | `econnectone-backend` |
| `FRONTEND_APP_NAME` | `econnectone-frontend` |
| `POSTGRES_PASSWORD` | From Phase 1 output (secure DB password) |
| `AZURE_CREDENTIALS` | Entire JSON from Phase 2 |

**Example for `AZURE_CREDENTIALS`:**
```json
{
  "clientId": "xxxxx",
  "clientSecret": "xxxxx",
  "subscriptionId": "xxxxx",
  "tenantId": "xxxxx"
}
```

---

### **Phase 4: Configure App Service Environment Variables** (5 minutes)

This tells your deployed app how to connect to the database and configure CORS.

#### 4.1 Configure Backend App Service

Go to **Azure Portal** → **App Services** → **econnectone-backend** → **Configuration** → **Application settings**

Add these settings:

| Setting | Value |
|---------|-------|
| `DATABASE_URL` | `postgresql://postgres:YOURPASSWORD@econnectone-postgres.postgres.database.azure.com:5432/eConnectOne?sslmode=require` |
| `ASPNETCORE_URLS` | `http://+:80` |
| `DOTNET_ENVIRONMENT` | `Production` |

(Replace `YOURPASSWORD` with the PostgreSQL password from Phase 1)

Click **Save**.

#### 4.2 Configure Frontend App Service

Go to **Azure Portal** → **App Services** → **econnectone-frontend** → **Configuration** → **Application settings**

Add this setting:

| Setting | Value |
|---------|-------|
| `VITE_API_BASE_URL` | `https://econnectone-backend.azurewebsites.net/api` |

Click **Save**.

---

### **Phase 5: Test Locally Before Pushing to GitHub** (10 minutes)

Before triggering GitHub Actions, test your setup locally to catch any issues:

#### 5.1 Create `.env` file locally
```powershell
# From your project root
$env:POSTGRES_PASSWORD = "<password from Phase 1>"
```

#### 5.2 Run production stack locally
```powershell
# Test with production docker-compose
docker compose -f docker-compose.prod.yml up --build
```

#### 5.3 Verify it works
```powershell
# In a new PowerShell window
curl http://localhost/
curl http://localhost:10000/health
```

**Expected results:**
- ✅ Frontend loads at `http://localhost/` (Nginx returns HTML)
- ✅ Backend health endpoint at `http://localhost:10000/health` returns 200 status

#### 5.4 Check database initialization
```powershell
# Logs should show:
# "✅ Database configuration added successfully"
# "✅ Seeded default admin user: admin / admin123"
```

If there are errors, check logs:
```powershell
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs postgres
```

#### 5.5 Cleanup after testing
```powershell
docker compose -f docker-compose.prod.yml down
```

---

### **Phase 6: Push to GitHub and Deploy** (5 minutes)

Once local testing passes:

```powershell
cd e:\Projects\Source\eConnectOneV1

# Stage all changes
git add .

# Commit
git commit -m "feat: setup Azure deployment with GitHub Actions"

# Push to main branch
git push origin main
```

This triggers the GitHub Actions workflow automatically.

---

### **Phase 7: Monitor Deployment** (5-10 minutes)

Go to your GitHub repository → **Actions** tab

You should see a new workflow run called "Build & Deploy to Azure"

#### 7.1 What to expect:

**Build & Push Phase:**
- ✅ Checkouts code
- ✅ Logins to Azure Container Registry
- ✅ Builds backend Docker image
- ✅ Pushes backend to ACR
- ✅ Builds frontend Docker image
- ✅ Pushes frontend to ACR

**Deploy Phase:**
- ✅ Logins to Azure
- ✅ Deploys backend to App Service
- ✅ Deploys frontend to App Service
- ✅ Verifies deployments are running
- ✅ Displays deployment URLs

#### 7.2 If workflow fails:

Click on the failed step to see detailed logs. Common issues:

| Error | Solution |
|-------|----------|
| `Invalid Docker credentials` | Check ACR_USERNAME and ACR_PASSWORD secrets |
| `Service Principal auth failed` | Verify AZURE_CREDENTIALS secret contains valid JSON |
| `App Service deployment timeout` | Check App Service logs: Azure Portal → App Service → Log Stream |
| `Database connection error` | Verify DATABASE_URL in App Service settings |

---

### **Phase 8: Verify Deployment in Azure** (5 minutes)

#### 8.1 Check App Service Status
Go to **Azure Portal** → **App Services**

Both apps should show:
- ✅ Status: **Running**
- ✅ Runtime: **Docker Container**

#### 8.2 Test Backend API
```powershell
# Replace with your actual URL
curl https://econnectone-backend.azurewebsites.net/health

# Or visit in browser:
https://econnectone-backend.azurewebsites.net/swagger
```

Expected: Returns JSON or Swagger UI

#### 8.3 Test Frontend
```powershell
curl https://econnectone-frontend.azurewebsites.net/
```

Expected: Returns HTML (homepage)

#### 8.4 Check Logs if Issues
Go to **Azure Portal** → **App Service** → **Log Stream**

This shows real-time logs from the running container. Look for:
- ✅ `✅ Database configuration added successfully`
- ✅ `✅ Seeded default admin user`
- ❌ Any connection errors

---

## 🎯 Success Criteria

✅ All checks passed:
- [ ] GitHub Actions workflow completes successfully
- [ ] Both App Services show "Running" status in Azure Portal
- [ ] Backend health endpoint returns 200 status
- [ ] Frontend homepage loads
- [ ] Frontend can reach backend API (no CORS errors in browser console)
- [ ] Database is initialized with default admin user

---

## 📊 Current Costs (Azure Free Tier)

| Resource | Cost | Duration |
|----------|------|----------|
| **Container Registry (ACR)** | ~$5/month | Always |
| **App Service Plan (B1)** | ~$10/month | Always |
| **PostgreSQL Database** | FREE | 12 months (trial) |
| **Data egress (egress)** | FREE | 100 GB/month |

**Total:** ~$15/month after free trial expires

---

## 🔄 Future Deployments

After the initial setup, deployments are automatic:

```powershell
# Just commit and push code to main
git commit -m "your changes"
git push origin main

# GitHub Actions automatically:
# 1. Builds Docker images
# 2. Pushes to Azure Container Registry
# 3. Deploys to App Services
# 4. No manual steps needed!
```

Monitor in GitHub → Actions tab

---

## 🚨 Troubleshooting

### Common Issues

**Q: "Container failed to start"**
A: Check App Service logs: Azure Portal → Log Stream
- Verify DATABASE_URL environment variable is set correctly
- Verify POSTGRES_PASSWORD is correct
- Check if PostgreSQL server is accepting connections

**Q: "Frontend can't reach backend API"**
A: 
- Verify VITE_API_BASE_URL in frontend App Service settings
- Check browser console for CORS errors
- Verify backend CORS configuration in Program.cs (currently allows only specific origins)

**Q: "PostgreSQL connection timeout"**
A:
- Verify firewall rule allows App Service IP
- Check PostgreSQL "Connection security" → firewall rules (should be 0.0.0.0 to 255.255.255.255 for testing)

**Q: "Docker image build fails"**
A:
- Check GitHub Actions logs for build errors
- Verify Dockerfile and frontend/Dockerfile are correct
- Test locally: `docker build -t test .`

---

## 📚 Next Steps (After Validation)

1. **Custom Domain:** Set up custom domain via Azure DNS
2. **SSL/TLS:** Enable HTTPS with custom certificate
3. **Database Backup:** Implement automated PostgreSQL backups
4. **Monitoring:** Set up Application Insights for performance monitoring
5. **Scaling:** Configure auto-scaling for high traffic
6. **Lift-and-Shift:** Document infrastructure migration procedure

---

## 📞 Support

If you encounter issues:
1. Check GitHub Actions workflow logs for specific error messages
2. Check Azure App Service Log Stream for runtime errors
3. Test locally with `docker-compose -f docker-compose.prod.yml`
4. Verify all environment variables are set correctly in App Service Configuration
