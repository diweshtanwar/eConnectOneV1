# 🔍 How to Verify Your API is Running and Working

---

## ✅ Method 1: Check Swagger API Docs (Easiest!)

### **Step 1: Open Swagger UI**

```powershell
Start-Process "https://econnectonev1-production.up.railway.app/swagger"
```

### **Step 2: What You Should See**

- ✅ Swagger UI page loads
- ✅ Shows all API endpoints (Controllers)
- ✅ Green "Try it out" buttons available
- ✅ No 500 errors

### **Step 3: Test an Endpoint**

1. Click any endpoint (e.g., `GET /api/...`)
2. Click **"Try it out"**
3. Click **"Execute"**
4. Check Response:
   - ✅ 200 = Success
   - ✅ 401/403 = Auth required (still working!)
   - ❌ 500 = Error

---

## ✅ Method 2: Check Health Endpoint

Most .NET APIs have a `/health` or `/api/health` endpoint:

```powershell
# In PowerShell
$response = Invoke-WebRequest -Uri "https://econnectonev1-production.up.railway.app/health" -Method GET
$response.StatusCode  # Should be 200

# Or in terminal
curl "https://econnectonev1-production.up.railway.app/health"
```

**Expected Response:**
```json
{
  "status": "Healthy",
  "timestamp": "2025-11-15T..."
}
```

---

## ✅ Method 3: Test Authentication Endpoint

Your backend should have an auth endpoint:

```powershell
$url = "https://econnectonev1-production.up.railway.app/api/auth/login"
$body = @{
    username = "your_username"
    password = "your_password"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri $url -Method POST -Body $body -ContentType "application/json"
$response.StatusCode  # Should be 200 if credentials correct
```

**Expected:**
- ✅ 200 + JWT token = API works!
- ✅ 401 = Wrong credentials (API still works!)
- ❌ 500 = Error on server

---

## ✅ Method 4: Check Browser Network Tab

### **Step 1: Open Your App**
```powershell
Start-Process "https://diweshtanwar.github.io/eConnectOneV1/"
```

### **Step 2: Press F12** (Open DevTools)

### **Step 3: Go to "Network" Tab**

### **Step 4: Reload Page (Ctrl+R)**

### **Step 5: Look for API Calls**

You should see requests like:
- ✅ `GET https://econnectonev1-production.up.railway.app/api/...`
- ✅ Status: **200** (green checkmark)

**If you see:**
- ❌ Status: **0** or **Failed** = Backend not reachable
- ❌ Status: **500** = Backend error
- ✅ Any successful response = **API WORKING!**

---

## ✅ Method 5: Use cURL Commands

### **Test 1: Check if API is up**
```powershell
curl -v "https://econnectonev1-production.up.railway.app/api"
```

Should show: `HTTP/1.1 200` or similar

### **Test 2: List all endpoints**
```powershell
curl "https://econnectonev1-production.up.railway.app/swagger/v1/swagger.json"
```

Should return JSON with all API definitions

### **Test 3: Specific endpoint**
```powershell
# Example: Get users (may require token)
curl -H "Authorization: Bearer YOUR_TOKEN" `
  "https://econnectonev1-production.up.railway.app/api/users"
```

---

## ✅ Method 6: Check Railway Logs

### **Step 1: Go to Railway Dashboard**
```powershell
Start-Process "https://railway.app/dashboard"
```

### **Step 2: Click Your Project (eConnectOneV1)**

### **Step 3: Click API Service**

### **Step 4: Go to "Logs" Tab**

### **What to Look For:**

✅ **Good Signs:**
```
Application started
Now listening on: http://[::]:5000
Hosting environment: Production
```

❌ **Bad Signs:**
```
FATAL: password authentication failed
Failed to connect to database
System.Exception: ...
```

---

## 📋 Quick Verification Checklist

Run these commands to verify everything:

```powershell
# 1. Check if API endpoint responds
Write-Host "Testing API endpoint..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://econnectonev1-production.up.railway.app/swagger" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ API is UP and RUNNING!" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ API not reachable" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# 2. Check database connection in logs
Write-Host "`nCheck Railway logs for:" -ForegroundColor Cyan
Write-Host "- 'Application started'" -ForegroundColor Yellow
Write-Host "- 'Now listening on'" -ForegroundColor Yellow
Write-Host "- 'No connection errors'" -ForegroundColor Yellow

# 3. Check frontend is calling backend
Write-Host "`nOpen frontend and press F12:" -ForegroundColor Cyan
Write-Host "- Go to Network tab" -ForegroundColor Yellow
Write-Host "- Look for requests to econnectonev1-production.up.railway.app" -ForegroundColor Yellow
```

---

## 🎯 Verification Flow

```
1. Is API responding?
   ↓
2. Check Swagger (https://...../swagger)
   ↓
3. Check Network tab (F12)
   ↓
4. Try to login
   ↓
5. Check Database queries working
   ↓
✅ Everything verified!
```

---

## 🔧 Common Issues & Fixes

### **Issue: "Connection refused"**
- **Cause:** API not running or wrong URL
- **Fix:** Check Railway dashboard if backend is deployed

### **Issue: "500 Internal Server Error"**
- **Cause:** Database connection issue
- **Fix:** Check if DATABASE_URL is set in Railway Variables

### **Issue: "401 Unauthorized"**
- **Cause:** Need JWT token
- **Fix:** This is NORMAL - means API is working, just needs auth

### **Issue: "Cannot GET /api/..."**
- **Cause:** Endpoint doesn't exist
- **Fix:** Check Swagger for correct endpoint path

### **Issue: "No response from API"**
- **Cause:** CORS issue or backend down
- **Fix:** Check Frontend console (F12) for CORS errors

---

## ✨ Final Verification: Test Login Flow

```
1. Open: https://diweshtanwar.github.io/eConnectOneV1/
2. Press F12 (DevTools)
3. Go to Network tab
4. Enter login credentials
5. Click Login
6. Watch Network tab:
   ✅ POST to /api/auth/login
   ✅ Response 200 with token
   ✅ Page redirects to dashboard
   ✅ Subsequent API calls work
```

**If all these work = YOUR API IS FULLY WORKING!** 🚀

---

## 📊 Status Summary

Your API is running if you see:

| Check | Status | Meaning |
|-------|--------|---------|
| Swagger loads | ✅ | API is reachable |
| No 500 errors | ✅ | Backend is stable |
| Network calls in F12 | ✅ | Frontend→Backend connected |
| Login works | ✅ | Database connected |
| Data displays | ✅ | Everything working! |

---

**Go verify your API now!** Let me know what you find! 🔍
