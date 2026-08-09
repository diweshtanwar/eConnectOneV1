# 📊 Upload Local PostgreSQL Data to Railway

## 🎯 Goal
Copy your local PostgreSQL database (schema + data) to Railway

---

## ✅ Prerequisites

You need:
- [ ] PostgreSQL client tools installed (`psql`, `pg_dump`)
- [ ] Your **local database name** (default: usually `econnectone` or `eConnectOne`)
- [ ] Your **local database password** (if using one)
- [ ] Your **Railway PostgreSQL connection string**

---

## 🔍 Step 1: Find Your PostgreSQL Installation

**On Windows, PostgreSQL tools are usually in:**
```
C:\Program Files\PostgreSQL\16\bin\
```

**Check if installed:**
```powershell
# Option 1: Check if psql exists
Get-ChildItem "C:\Program Files\PostgreSQL"

# Option 2: Look for PostgreSQL in Program Files
dir "C:\Program Files" | grep -i postgres
```

---

## 🔑 Step 2: Get Your Connection Info

### **Local PostgreSQL:**

```powershell
# Connect to your local database and get info
psql -U postgres -c "\l"
```

This shows all databases. Find yours (likely named `econnectone` or similar).

### **Railway PostgreSQL:**

You already have this:
```
postgresql://postgres:SVVguBETVZGysxdjhZFjuTqccTUHgtvQ@postgres.railway.internal:5432/railway
```

---

## 📤 Step 3: Export Local Database

### **Option A: Export Everything (Schema + Data) - BEST**

```powershell
# Set PostgreSQL path
$pgPath = "C:\Program Files\PostgreSQL\16\bin"

# Export database (replace 'econnectone' with your local DB name)
& "$pgPath\pg_dump" -U postgres -h localhost econnectone > "E:\Backup\econnectone_backup.sql"
```

This creates a SQL file with everything.

### **Option B: Export Only Schema**

```powershell
$pgPath = "C:\Program Files\PostgreSQL\16\bin"
& "$pgPath\pg_dump" -U postgres -h localhost --schema-only econnectone > "E:\Backup\schema_only.sql"
```

### **Option C: Export Only Data**

```powershell
$pgPath = "C:\Program Files\PostgreSQL\16\bin"
& "$pgPath\pg_dump" -U postgres -h localhost --data-only econnectone > "E:\Backup\data_only.sql"
```

---

## 📥 Step 4: Import to Railway

### **Using psql (Easiest)**

```powershell
# Set PostgreSQL path
$pgPath = "C:\Program Files\PostgreSQL\16\bin"

# Import to Railway
& "$pgPath\psql" -h postgres.railway.internal `
  -U postgres `
  -d railway `
  -f "E:\Backup\econnectone_backup.sql" `
  -W
```

When prompted, enter Railway password: `SVVguBETVZGysxdjhZFjuTqccTUHgtvQ`

---

## 🔄 Step 5: Verify Upload

```powershell
$pgPath = "C:\Program Files\PostgreSQL\16\bin"

# List all tables in Railway database
& "$pgPath\psql" `
  -h postgres.railway.internal `
  -U postgres `
  -d railway `
  -c "\dt"
```

Should show all your tables! ✅

---

## 📋 Complete PowerShell Script (Copy & Paste)

```powershell
# ============================================
# 1. SET PATHS
# ============================================
$pgPath = "C:\Program Files\PostgreSQL\16\bin"
$backupDir = "E:\Backup"
$localDbName = "econnectone"  # CHANGE THIS to your local DB name
$backupFile = "$backupDir\econnectone_backup.sql"

# Create backup directory if it doesn't exist
if (!(Test-Path $backupDir)) {
    mkdir $backupDir
}

Write-Host "PostgreSQL Path: $pgPath" -ForegroundColor Cyan
Write-Host "Backup Directory: $backupDir" -ForegroundColor Cyan

# ============================================
# 2. EXPORT LOCAL DATABASE
# ============================================
Write-Host "`n[1/3] Exporting local database '$localDbName'..." -ForegroundColor Yellow
& "$pgPath\pg_dump" -U postgres -h localhost $localDbName > $backupFile

if ($?) {
    Write-Host "✅ Export successful!" -ForegroundColor Green
    Write-Host "File: $backupFile" -ForegroundColor Green
} else {
    Write-Host "❌ Export failed!" -ForegroundColor Red
    exit
}

# ============================================
# 3. IMPORT TO RAILWAY
# ============================================
Write-Host "`n[2/3] Importing to Railway..." -ForegroundColor Yellow
Write-Host "Password will be needed (SVVguBETVZGysxdjhZFjuTqccTUHgtvQ)" -ForegroundColor Cyan

# Note: psql doesn't allow password as parameter for security
# You'll need to enter it when prompted
$env:PGPASSWORD = "SVVguBETVZGysxdjhZFjuTqccTUHgtvQ"

& "$pgPath\psql" `
  -h postgres.railway.internal `
  -U postgres `
  -d railway `
  -f $backupFile

if ($?) {
    Write-Host "✅ Import successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Import failed!" -ForegroundColor Red
    exit
}

# ============================================
# 4. VERIFY
# ============================================
Write-Host "`n[3/3] Verifying tables in Railway..." -ForegroundColor Yellow

& "$pgPath\psql" `
  -h postgres.railway.internal `
  -U postgres `
  -d railway `
  -c "\dt"

Write-Host "`n✅ All done!" -ForegroundColor Green
```

---

## ⚠️ Important Notes

1. **Local Database Name**: Replace `econnectone` with your actual local DB name
2. **PostgreSQL Version**: Make sure version number matches (16 in example)
3. **Password**: Railway password is `SVVguBETVZGysxdjhZFjuTqccTUHgtvQ`
4. **Backup File Size**: Large databases may take time to export/import
5. **Constraints**: All foreign keys and constraints will be copied

---

## 🐛 Troubleshooting

### **"psql: command not found"**
- PostgreSQL not in PATH
- Install: https://www.postgresql.org/download/windows/
- Or use full path: `C:\Program Files\PostgreSQL\16\bin\psql`

### **"FATAL: password authentication failed"**
- Wrong local password, or wrong railway password
- Railway password: `SVVguBETVZGysxdjhZFjuTqccTUHgtvQ`
- Local: check your setup

### **"database does not exist"**
- Local: `econnectone` doesn't exist - check your DB name with `\l`
- Railway: should be `railway` (default)

### **Connection timeout**
- Make sure Railway PostgreSQL is running
- Check Railway dashboard

---

## ✅ Success Indicators

After running the script:
- ✅ Backup file created
- ✅ Data imported without errors
- ✅ `\dt` command shows your tables
- ✅ Your backend can read the data

---

## 🎯 Quick Steps Summary

1. **Export**: `pg_dump` local database to SQL file
2. **Import**: `psql` import SQL file to Railway
3. **Verify**: Check tables exist with `\dt`
4. **Test**: Your app now has all data!

---

**Ready? Let me know your:**
1. Local PostgreSQL database name
2. PostgreSQL version (check Program Files)
3. Any errors you get

I can then provide exact commands for your setup! 🚀
