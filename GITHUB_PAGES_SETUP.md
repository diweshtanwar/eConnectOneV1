# GitHub Pages Configuration Guide

## Problem
GitHub Pages is not yet enabled for automatic deployments from GitHub Actions.

## Solution

### Method 1: Web UI (Easiest - Recommended)

1. Go to: **https://github.com/diweshtanwar/eConnectOneV1/settings/pages**

2. Under **Build and deployment**:
   - **Source**: Select **"Deploy from a branch"** OR **"GitHub Actions"**
   - If you see **"Deploy from a branch"**: Select it
   - If it shows workflow options: Select **deploy-frontend-github-pages.yml**

3. Click **Save**

4. GitHub will show:
   ```
   ✅ Your site is live at: https://diweshtanwar.github.io/eConnectOneV1/
   ```

5. Wait 2-3 minutes for the first deployment to complete

6. Access your site: https://diweshtanwar.github.io/eConnectOneV1/

### Method 2: Using GitHub CLI

```powershell
# Install GitHub CLI
choco install gh -y

# Authenticate with GitHub
gh auth login

# Enable Pages with workflow deployment
gh repo edit diweshtanwar/eConnectOneV1 `
  --enable-pages `
  --pages-source-branch=main `
  --pages-source-path=/
```

### Method 3: Manual Repository Settings Edit

1. Go to: https://github.com/diweshtanwar/eConnectOneV1/settings
2. Scroll down to **Pages** section
3. Change **Source** to match your workflow
4. Save

---

## Verify Deployment

After enabling Pages:

1. Go to: https://github.com/diweshtanwar/eConnectOneV1/actions
2. Find **"Deploy Frontend to GitHub Pages"** workflow
3. Wait for it to complete (green ✅)
4. Check your site: https://diweshtanwar.github.io/eConnectOneV1/

---

## Common Issues

### Site still shows 404?
- Wait 5 minutes
- Hard refresh: `Ctrl+Shift+R` (Windows)
- Check Actions tab for build errors

### Workflow says "permission denied"?
- Go to Settings → Actions → General
- Set **Workflow permissions** to: **"Read and write permissions"**
- Save

### Can't find Pages section in Settings?
- Ensure repository is public (or Pages enabled for private repos)
- Check: https://github.com/diweshtanwar/eConnectOneV1/settings/pages directly

---

## Next Steps

After GitHub Pages is live:

1. ✅ Your React app will be at: https://diweshtanwar.github.io/eConnectOneV1/
2. 🔄 Every push to `main` → Auto-deploys
3. 🚀 Deploy backend to Railway (5 min)
4. ⚙️ Configure API endpoint in `.env.production`

---

Done! Your frontend is now continuously deployed! 🎉
