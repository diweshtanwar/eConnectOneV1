# FREE Hosting Setup Guide for eConnectOne

## Current Status

✅ **Frontend Deployed**: https://diweshtanwar.github.io/eConnectOneV1/
🔄 **Backend**: Ready for Railway deployment
💾 **Database**: Ready for Railway PostgreSQL

---

## Part 1: Deploy Backend to Railway (FREE) ✅

### Step 1.1: Create Railway Account

```powershell
Start-Process "https://railway.app"
```

1. Go to https://railway.app
2. Click **Sign up**
3. Click **Sign up with GitHub**
4. Authorize Railway to access your GitHub
5. Complete account setup

### Step 1.2: Deploy Backend

In Railway Dashboard:

1. Click **+ New Project**
2. Select **Deploy from GitHub repo**
3. Find and select `eConnectOneV1`
4. Railway will detect it's a .NET project
5. Click **Deploy**

Wait for deployment to complete (5-10 minutes).

### Step 1.3: Add PostgreSQL Database

1. Click **+ Add Service**
2. Select **Database**
3. Choose **PostgreSQL**
4. Railway will create it automatically

### Step 1.4: Get Your Railway Backend URL

1. In Railway Dashboard, go to your deployment
2. Click on **Deployments** tab
3. Copy the public URL (looks like: `https://econnectone-api.railway.app/`)
4. **Save this URL** - you'll need it!

---

## Part 2: Configure Frontend to Use Railway Backend

### Step 2.1: Update Production Environment File

Edit `frontend/.env.production`:

```bash
# Replace with your actual Railway backend URL
VITE_API_BASE_URL=https://your-econnectone-api.railway.app/api
```

**Example**:
```bash
VITE_API_BASE_URL=https://econnectone-prod-api.railway.app/api
```

### Step 2.2: Verify API Configuration

The frontend now auto-detects the environment:

- **Development**: `http://localhost:5001/api`
- **Production (GitHub Pages)**: Uses `VITE_API_BASE_URL` from environment

### Step 2.3: Push Changes to GitHub

```powershell
cd e:\Projects\Source\eConnectOneV1

# Add changes
git add frontend/.env.production frontend/src/api/api.ts

# Commit
git commit -m "Configure production API endpoint for Railway backend"

# Push (triggers automatic frontend rebuild & deploy)
git push origin main
```

GitHub Actions will:
1. ✅ Rebuild React app with production config
2. ✅ Deploy to GitHub Pages with new config
3. ✅ Automatically available at: https://diweshtanwar.github.io/eConnectOneV1/

---

## Part 3: Configure Backend Database Connection

### Step 3.1: Get Database Connection String from Railway

In Railway Dashboard:

1. Click on **PostgreSQL** service
2. Go to **Variables** tab
3. Look for `DATABASE_URL` (looks like: `postgresql://user:password@host:port/dbname`)
4. Copy it

### Step 3.2: Add to Backend Configuration

In Railway Dashboard:

1. Click on **eConnectOne API** service
2. Go to **Variables** tab
3. Click **+ Add Variable**
4. **Name**: `ConnectionStrings__DefaultConnection`
5. **Value**: Paste the `DATABASE_URL` from PostgreSQL
6. Click **Save**

### Step 3.3: Update Backend appsettings

The backend needs to read this environment variable:

Edit `backend/eConnectOne.API/Program.cs`:

```csharp
// In ConfigureServices or Program.cs
var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection") 
    ?? builder.Configuration.GetConnectionString("DefaultConnection");

services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));
```

---

## Part 4: Initialize Database on Railway

### Option A: Automatic (Recommended)

Railway can run migrations automatically when you deploy.

Edit `backend/eConnectOne.API/Program.cs`:

```csharp
// In the Main/Program initialization
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.Migrate(); // Auto-run migrations on startup
}
```

### Option B: Manual via Railway CLI

```powershell
# Install Railway CLI
choco install railway -y

# Login
railway login

# Connect to your project
railway link

# Run migrations
railway run dotnet ef database update --project backend/eConnectOne.API
```

---

## Part 5: Test Your Full Stack

### Test 1: Frontend Access

Go to: **https://diweshtanwar.github.io/eConnectOneV1/**

You should see your React app loaded.

### Test 2: Backend API

Go to: **https://your-railway-api-url.railway.app/swagger/index.html**

You should see Swagger documentation (if enabled in backend).

### Test 3: Login

1. Open frontend URL
2. Try logging in with your test credentials
3. Check if API calls work (open browser DevTools → Network tab)

---

## Part 6: Enable CORS on Backend

Since frontend is hosted on GitHub Pages and backend is on Railway, you need CORS.

Edit `backend/eConnectOne.API/Program.cs`:

```csharp
// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowGitHubPages", policy =>
    {
        policy.WithOrigins("https://diweshtanwar.github.io")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// Use CORS (before MapControllers)
app.UseCors("AllowGitHubPages");
```

Then redeploy:

```powershell
cd backend/eConnectOne.API
git add Program.cs
git commit -m "Enable CORS for GitHub Pages frontend"
git push origin main
```

Railway will auto-redeploy.

---

## Monitoring & Logs

### Check Frontend Logs

GitHub Actions → Workflows → "Deploy Frontend to GitHub Pages" → Latest run

### Check Backend Logs

Railway Dashboard → Your API service → **Logs** tab

View real-time logs of any errors.

### Monitor Database

Railway Dashboard → PostgreSQL service → **Logs** tab

---

## Summary Table

| Component | Hosting | URL | Cost |
|-----------|---------|-----|------|
| **Frontend (React)** | GitHub Pages | https://diweshtanwar.github.io/eConnectOneV1/ | 🟢 FREE |
| **Backend (.NET)** | Railway | https://your-api.railway.app/ | 🟢 FREE |
| **Database (PostgreSQL)** | Railway | Included with Railway | 🟢 FREE |
| **SSL/HTTPS** | Both | Both included | 🟢 FREE |
| **Domain** | GitHub + Railway | Subdomains included | 🟢 FREE |

---

## Troubleshooting

### Frontend shows blank/errors

1. Open browser DevTools (F12)
2. Check **Console** tab for errors
3. Check **Network** tab - see if API calls are failing
4. If API errors: Check CORS configuration on backend

### Backend API not responding

1. Check Railway dashboard for errors
2. Go to Backend service → **Logs** tab
3. Look for stack traces
4. Common issues:
   - Database connection failing
   - CORS not configured
   - Environment variables not set

### Database not found

1. Check Railway PostgreSQL logs
2. Verify `DATABASE_URL` is set as environment variable
3. Ensure migrations have run

---

## Next Steps

1. ✅ Sign up for Railway
2. ✅ Deploy backend
3. ✅ Add PostgreSQL
4. ✅ Update `.env.production` with Railway URL
5. ✅ Push changes (frontend auto-deploys)
6. ✅ Test full stack

Your app will be **fully live and free**! 🎉

---

## Support

For issues:
- **GitHub Actions**: https://github.com/diweshtanwar/eConnectOneV1/actions
- **Railway Docs**: https://docs.railway.app
- **Railway Status**: https://status.railway.app
