# XAMPP MySQL Setup Guide
## HR Management System

**Date:** December 4, 2025

---

## 📋 Quick Setup for XAMPP

### Step 1: Start XAMPP MySQL

1. Open **XAMPP Control Panel**
2. Click **Start** next to **Apache** (optional, for phpMyAdmin)
3. Click **Start** next to **MySQL** (required)
4. Wait for MySQL to show "Running" status

---

### Step 2: Update Backend Configuration

Your backend `.env` file is already configured for XAMPP defaults:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=           # Empty (no password) - XAMPP default
DB_NAME=hrms_db
```

**✅ No changes needed!** XAMPP uses these defaults.

---

### Step 3: Create Database

#### Option A: Using phpMyAdmin (Easiest)

1. Open browser and go to: **http://localhost/phpmyadmin**
2. Click **"New"** in the left sidebar
3. Database name: `hrms_db`
4. Collation: `utf8mb4_unicode_ci`
5. Click **"Create"**

#### Option B: Using MySQL Command Line

1. Open **XAMPP Control Panel**
2. Click **"Shell"** button
3. Run these commands:

```bash
# Login to MySQL (no password needed)
mysql -u root

# Create database
CREATE DATABASE hrms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Verify database was created
SHOW DATABASES;

# Exit
exit
```

---

### Step 4: Import Database Schema

#### Option A: Using phpMyAdmin (Recommended)

1. Go to **http://localhost/phpmyadmin**
2. Click on **hrms_db** database in left sidebar
3. Click **"Import"** tab at the top
4. Click **"Choose File"**
5. Navigate to: `E:\HR\.agent\planning\database-schema.sql`
6. Click **"Import"** button at bottom
7. Wait for success message

#### Option B: Using Command Line

```bash
# In XAMPP Shell
mysql -u root hrms_db < "E:\HR\.agent\planning\database-schema.sql"

# Verify tables were created
mysql -u root hrms_db -e "SHOW TABLES;"
```

You should see 25+ tables created!

---

### Step 5: Verify Database Setup

#### Using phpMyAdmin:

1. Go to **http://localhost/phpmyadmin**
2. Click **hrms_db** database
3. You should see tables like:
   - organizations
   - users
   - employees
   - attendance
   - timesheets
   - payroll
   - etc.

#### Using MySQL Command:

```bash
# In XAMPP Shell
mysql -u root hrms_db -e "SHOW TABLES;"
```

Expected output:
```
+------------------------+
| Tables_in_hrms_db      |
+------------------------+
| announcements          |
| attendance             |
| attendance_policies    |
| attendance_regularization |
| audit_logs             |
| departments            |
| documents              |
| employees              |
| holidays               |
| leave_applications     |
| leave_balances         |
| leave_types            |
| notification_preferences |
| notification_templates |
| notifications          |
| organizations          |
| payroll                |
| payslips               |
| projects               |
| roles                  |
| salary_structures      |
| tasks                  |
| teams                  |
| timesheets             |
| users                  |
+------------------------+
```

---

### Step 6: Test Backend Connection

Once the backend npm installation completes:

```bash
cd E:\HR\backend
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:5000
📝 Environment: development
🔗 API Base: http://localhost:5000/api/v1
```

If you see database connection errors, check:
1. ✅ XAMPP MySQL is running
2. ✅ Database `hrms_db` exists
3. ✅ Tables are imported
4. ✅ `.env` file has correct settings

---

### Step 7: Test the Setup

#### Test 1: Health Check
Open browser: **http://localhost:5000/health**

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-12-04T...",
  "environment": "development"
}
```

#### Test 2: API Info
Open browser: **http://localhost:5000/api/v1**

Expected response:
```json
{
  "success": true,
  "message": "HR Management System API",
  "version": "v1",
  "documentation": "http://localhost:5000/api-docs"
}
```

---

## 🔧 XAMPP Configuration Details

### Default XAMPP MySQL Settings

| Setting | Value |
|---------|-------|
| Host | localhost |
| Port | 3306 |
| Username | root |
| Password | (empty) |
| phpMyAdmin | http://localhost/phpmyadmin |

### XAMPP MySQL Data Location

Your database files are stored in:
```
C:\xampp\mysql\data\hrms_db\
```

### XAMPP MySQL Configuration File

```
C:\xampp\mysql\bin\my.ini
```

---

## 🐛 Troubleshooting

### Issue 1: MySQL Won't Start in XAMPP

**Possible Causes:**
- Port 3306 is already in use
- Another MySQL service is running

**Solutions:**

1. **Check if MySQL is already running:**
   - Open Task Manager (Ctrl+Shift+Esc)
   - Look for "mysqld.exe"
   - End task if found

2. **Change MySQL port:**
   - Edit `C:\xampp\mysql\bin\my.ini`
   - Find `port=3306`
   - Change to `port=3307`
   - Update `backend\.env`: `DB_PORT=3307`
   - Restart XAMPP MySQL

3. **Check Windows Services:**
   - Press Win+R, type `services.msc`
   - Look for "MySQL" service
   - Stop it if running

### Issue 2: Can't Access phpMyAdmin

**Solution:**
- Make sure Apache is also running in XAMPP
- Go to http://localhost/phpmyadmin
- If still not working, try http://127.0.0.1/phpmyadmin

### Issue 3: Database Import Fails

**Solutions:**

1. **File too large:**
   - Edit `C:\xampp\php\php.ini`
   - Find and increase:
     ```ini
     upload_max_filesize = 50M
     post_max_size = 50M
     max_execution_time = 300
     ```
   - Restart Apache in XAMPP

2. **Use command line instead:**
   ```bash
   mysql -u root hrms_db < "E:\HR\.agent\planning\database-schema.sql"
   ```

### Issue 4: Backend Can't Connect to Database

**Check these:**

1. ✅ XAMPP MySQL is running (green in control panel)
2. ✅ Database exists: `SHOW DATABASES;`
3. ✅ `.env` file settings are correct
4. ✅ No firewall blocking port 3306

**Test connection manually:**
```bash
# In XAMPP Shell
mysql -u root -e "SELECT 1;"
```

Should return: `1`

### Issue 5: "Access Denied" Error

**Solution:**
- XAMPP default has no password for root
- Make sure `DB_PASSWORD=` is empty in `.env`
- If you set a password, update `.env` accordingly

---

## ✅ Setup Checklist

- [ ] XAMPP installed
- [ ] MySQL started in XAMPP Control Panel
- [ ] Database `hrms_db` created
- [ ] Schema imported (25+ tables)
- [ ] Tables verified in phpMyAdmin
- [ ] Backend `.env` configured for XAMPP
- [ ] Backend server starts without errors
- [ ] Health check endpoint works
- [ ] API endpoint responds

---

## 🎯 Quick Commands Reference

### Start XAMPP MySQL
```
Open XAMPP Control Panel → Click "Start" next to MySQL
```

### Create Database (Shell)
```bash
mysql -u root -e "CREATE DATABASE hrms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Import Schema (Shell)
```bash
mysql -u root hrms_db < "E:\HR\.agent\planning\database-schema.sql"
```

### Show Tables (Shell)
```bash
mysql -u root hrms_db -e "SHOW TABLES;"
```

### Start Backend Server
```bash
cd E:\HR\backend
npm run dev
```

### Start Frontend Server
```bash
cd E:\HR\frontend
npm run dev
```

---

## 📊 Expected Database Structure

After import, you should have:

- **25+ tables** for the HR system
- **Sample data** in organizations and roles tables
- **Proper indexes** on all foreign keys
- **Constraints** for data integrity

---

## 🚀 Next Steps After Setup

1. ✅ Verify all tables are created
2. ✅ Test backend server connection
3. ✅ Start frontend development server
4. 🔜 Build authentication module (Week 2)
5. 🔜 Create login/registration UI

---

## 📞 Need Help?

If you encounter any issues:

1. Check XAMPP error logs: `C:\xampp\mysql\data\mysql_error.log`
2. Check backend logs: `E:\HR\backend\logs\`
3. Review this guide's troubleshooting section
4. Verify all prerequisites are met

---

**Setup Guide Version:** 1.0  
**Last Updated:** December 4, 2025  
**For:** XAMPP MySQL Configuration
