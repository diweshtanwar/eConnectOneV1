# GitHub Actions CI/CD Setup Guide

## Overview

Your eConnectOne project is now configured with GitHub Actions for automated building and testing.

## Workflows Created

### 1. **Backend Workflow** (`backend.yml`)
- **Trigger**: Push/PR to `main` or `develop` branches (backend changes)
- **Runs on**: Windows Latest
- **Steps**:
  - Checkout code
  - Setup .NET 6.0
  - Restore dependencies
  - Build in Release mode
  - Run tests (if available)
  - Publish backend application
  - Upload artifact

**Status**: ✅ Active

### 2. **Frontend Workflow** (`frontend.yml`)
- **Trigger**: Push/PR to `main` or `develop` branches (frontend changes)
- **Runs on**: Ubuntu Latest
- **Steps**:
  - Checkout code
  - Setup Node.js 18
  - Install dependencies
  - Lint code
  - Build React app (Vite)
  - Upload dist artifact

**Status**: ✅ Active

### 3. **Deploy Workflow** (`deploy.yml`)
- **Trigger**: Push to `main` branch or manual trigger
- **Runs on**: Windows Latest
- **Jobs**:
  - `build-backend`: Builds and publishes backend
  - `build-frontend`: Builds and publishes frontend
  - `deploy`: Downloads artifacts and prepares for deployment

**Status**: ✅ Active (Ready for Azure/hosting configuration)

---

## Monitoring Workflows

1. Go to: **https://github.com/diweshtanwar/eConnectOneV1/actions**
2. View all workflow runs and their status
3. Click on any run to see detailed logs

---

## Next Steps

### Option A: Deploy to Azure App Service (Recommended)

1. **Create Azure Resources**:
   - Create Azure App Service for backend (.NET)
   - Create Storage Account or Static Web Apps for frontend (React)

2. **Add GitHub Secrets**:
   - Go to: `Settings` → `Secrets and variables` → `Actions`
   - Click `New repository secret`
   - Add `AZURE_PUBLISHPROFILE`:
     - Get from Azure Portal → App Service → Download publish profile
     - Paste the entire XML content

3. **Update `deploy.yml`**:
   - Replace `your-app-service-name` with your actual Azure App Service name
   - Uncomment and configure deployment steps

### Option B: Deploy to Other Platforms

- **AWS**: Use AWS credentials and CodeDeploy
- **Heroku**: Use Heroku token
- **Docker Registry**: Build and push Docker images
- **Self-hosted**: Use self-hosted runners

---

## Making Commits That Trigger Workflows

### Trigger Backend Build:
```bash
git add backend/
git commit -m "Update backend code"
git push origin main
```

### Trigger Frontend Build:
```bash
git add frontend/
git commit -m "Update frontend code"
git push origin main
```

### Trigger Deploy Workflow:
```bash
git add .
git commit -m "Release v1.0.0"
git push origin main
```

---

## Viewing Build Artifacts

After a successful build:

1. Go to **GitHub Actions** tab
2. Click the completed workflow run
3. Scroll to **Artifacts** section
4. Download `backend-artifact` or `frontend-artifact`

---

## Troubleshooting Workflows

### If a workflow fails:

1. Click the failed run in **Actions** tab
2. Click the failed job
3. View the logs to see what went wrong
4. Common issues:
   - Missing `package-lock.json` (frontend)
   - .NET version mismatch
   - Node version issues
   - PostgreSQL not configured

### Common Fixes:

**Frontend build fails**:
```bash
cd frontend
npm install
npm run build
```

**Backend build fails**:
```bash
cd backend/eConnectOne.API
dotnet restore
dotnet build --configuration Release
```

---

## Summary

✅ **Automated Testing**: Every push runs tests automatically
✅ **Artifacts Generated**: Built artifacts ready for deployment
✅ **Scalable**: Add more workflows as your project grows
✅ **Fast Feedback**: See build results immediately on GitHub

---

## Useful Links

- **GitHub Actions Documentation**: https://docs.github.com/en/actions
- **Your Repository Actions**: https://github.com/diweshtanwar/eConnectOneV1/actions
- **Workflow Syntax**: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions

---

For questions or issues, refer to GitHub documentation or contact your development team.
