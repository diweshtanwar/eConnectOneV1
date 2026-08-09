# Railway Deployment Guide - Complete Instructions

## 🚀 Quick Start (5 minutes)

### **Step 1: Create Railway Account**

```powershell
Start-Process "https://railway.app"
```

1. Click **"Get Started"**
2. Click **"Sign up with GitHub"** ← Important!
3. Click **"Authorize railway-app"**
4. Complete verification

---

### **Step 2: Deploy Backend (3 minutes)**

In Railway Dashboard:

1. Click **"+ New Project"** or **"Start New"**
2. Select **"Deploy from GitHub repo"**
3. Search for and select: **`eConnectOneV1`**
4. Railway detects it's .NET → Click **"Deploy"**

**Railway will automatically:**
- Clone your repo from GitHub
- Detect .NET 6 project
- Build your backend
- Deploy live
- Generate a public URL

⏱️ **Takes 3-5 minutes**

---

### **Step 3: Add PostgreSQL Database (1 minute)**

While backend deploys:

1. In Railway Dashboard, click **"+ Add Service"**
2. Select **"Database"**
3. Choose **"PostgreSQL"**
4. Railway creates it automatically

---

### **Step 4: Get Your URLs (After deployment)**

#### **Backend URL**
1. Click your **API service**
2. Go to **"Deployments"** tab
3. Click the deployment
4. Copy the **public URL**
   - Example: `https://econnectone-api.railway.app/`

#### **Database Connection String**
1. Click **PostgreSQL** service
2. Go to **"Variables"** tab
3. Copy **`DATABASE_URL`** value
   - This is auto-provided to backend

---

### **Step 5: Configure Frontend to Use Backend**

Edit `frontend/.env.production`:

```bash
VITE_API_BASE_URL=https://[your-railway-api-url].railway.app/api
```

**Example:**
```bash
VITE_API_BASE_URL=https://econnectone-api.railway.app/api
```

Then push:
```powershell
cd e:\Projects\Source\eConnectOneV1
git add frontend/.env.production
git commit -m "Configure production API endpoint for Railway"
git push origin main
```

Frontend auto-rebuilds and deploys to GitHub Pages! ✅

---

## 📋 What Was Pre-configured

Your backend is pre-configured to:

✅ **Auto-migrate database on startup**
- Runs migrations automatically
- Creates all tables
- Applies all pending migrations

✅ **CORS enabled for GitHub Pages**
- Frontend can call API from `https://diweshtanwar.github.io/eConnectOneV1/`

✅ **Swagger API available**
- Test your API at: `https://[your-api].railway.app/swagger`

✅ **Environment variables**
- Reads `DATABASE_URL` from Railway PostgreSQL service

---

## 🔍 Verify Deployment

### **Check Backend is Running**

```powershell
Start-Process "https://[your-railway-api].railway.app/health"
```

Should return: `Healthy` or similar response

### **View Swagger Documentation**

```powershell
Start-Process "https://[your-railway-api].railway.app/swagger"
```

You should see all API endpoints

### **Check Database Connected**

In Swagger, try:
- GET `/users` - Should return user list (or empty array)
- GET `/Dashboard/stats` - Should return dashboard stats

If no errors → **Database is connected!** ✅

---

## 🆘 Troubleshooting

### **Backend shows error on Railway**

1. Go to Railway Dashboard
2. Click your API service
3. Go to **"Logs"** tab
4. See what error message shows
5. Common issues:
   - Database connection string wrong
   - Missing environment variables
   - Port conflicts

### **Frontend can't reach backend**

1. Check API URL in `.env.production`
2. Check CORS is enabled (we already did this)
3. Check backend is running (visit `/swagger`)
4. Open DevTools (F12) → Network tab → See API errors

### **Database won't initialize**

1. Check PostgreSQL service is running
2. Check `DATABASE_URL` is set in backend environment
3. Check migrations are in `backend/eConnectOne.API/Migrations/`

---

## 📊 Architecture After Deployment

```
GitHub Pages (Free)
└── https://diweshtanwar.github.io/eConnectOneV1/
    └── React Frontend
        └── Calls API
            
Railway (Free with $5/month credit)
├── API Service (.NET)
│   └── https://[api].railway.app/
│       ├── Connects to
│       │
│       └── PostgreSQL Database
│           └── Stores all data
```

---

## 💰 Cost Breakdown

| Service | Cost | Details |
|---------|------|---------|
| GitHub Pages | FREE ∞ | Unlimited bandwidth |
| Railway API | FREE | $5/month credit |
| Railway DB | FREE | Included |
| **Total** | **🟢 FREE** | $5 credit lasts ~3 months |

---

## 🔄 Deployment Flow

### **Every time you push to GitHub:**

```
1. You: git push origin main
   ↓
2. GitHub Actions: Builds frontend & backend
   ↓
3. Frontend → GitHub Pages (auto-deploys)
   ↓
4. Backend → Railway (if you set up automatic deploys)
   ↓
5. Your site updates live! 🚀
```

---

## 📝 Useful Links

| Resource | URL |
|----------|-----|
| Your Frontend | https://diweshtanwar.github.io/eConnectOneV1/ |
| Railway Dashboard | https://railway.app/dashboard |
| Your GitHub Repo | https://github.com/diweshtanwar/eConnectOneV1 |
| API Swagger | https://[api].railway.app/swagger |

---

## ✅ Checklist

After deployment:

- [ ] Railway account created
- [ ] Backend deployed to Railway
- [ ] PostgreSQL database created
- [ ] Got backend URL
- [ ] Updated `.env.production` with API URL
- [ ] Pushed frontend update
- [ ] Frontend rebuilds and deploys
- [ ] Visit frontend URL
- [ ] Try logging in
- [ ] Check DevTools for any errors
- [ ] Visit `/swagger` to see API
- [ ] Try API endpoints

---

## 🎉 You're Done!

Your full-stack app is now:
- ✅ Deployed on GitHub Pages (frontend)
- ✅ Deployed on Railway (backend)
- ✅ Connected to PostgreSQL database
- ✅ Fully functional
- ✅ Completely FREE

**Next Steps:**
1. Test your login flow
2. Add sample data
3. Create admin user
4. Share your site with others!

---

Questions? Check Railway docs: https://docs.railway.app
