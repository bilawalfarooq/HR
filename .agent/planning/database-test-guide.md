# 🧪 Database Connection Test Guide
## HR Management System - XAMPP Setup & Testing

**Date:** December 4, 2025

---

## 📋 Step-by-Step Setup & Testing

### **Step 1: Start XAMPP MySQL** ✅

1. Open **XAMPP Control Panel**
2. Click **"Start"** button next to **MySQL**
3. Wait for status to show **green "Running"**
4. (Optional) Start **Apache** too for phpMyAdmin access

**Verify:** MySQL should show green "Running" status in XAMPP Control Panel

---

### **Step 2: Create Database** 🗄️

Choose **ONE** of these methods:

#### **Method A: Using phpMyAdmin (Recommended - Visual)**

1. Open browser: **http://localhost/phpmyadmin**
2. Click **"New"** in the left sidebar
3. Enter database name: **`hrms_db`**
4. Select collation: **`utf8mb4_unicode_ci`**
5. Click **"Create"** button

**Verify:** You should see `hrms_db` appear in the left sidebar

#### **Method B: Using XAMPP Shell (Command Line)**

1. In XAMPP Control Panel, click **"Shell"** button
2. Run this command:

```bash
mysql -u root -e "CREATE DATABASE hrms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

3. Verify database was created:

```bash
mysql -u root -e "SHOW DATABASES;"
```

**Verify:** You should see `hrms_db` in the list

---

### **Step 3: Import Database Schema** 📥

This will create all 25+ tables needed for the HR system.

#### **Method A: Using phpMyAdmin (Easier)**

1. In phpMyAdmin, click **`hrms_db`** in the left sidebar
2. Click the **"Import"** tab at the top
3. Click **"Choose File"** button
4. Navigate to: **`E:\HR\.agent\planning\database-schema.sql`**
5. Click **"Import"** button at the bottom
6. Wait for the success message (should take 5-10 seconds)

**Verify:** You should see a green success message saying "Import has been successfully finished"

#### **Method B: Using XAMPP Shell**

1. In XAMPP Shell, run:

```bash
mysql -u root hrms_db < "E:\HR\.agent\planning\database-schema.sql"
```

2. If successful, there will be no error message

**Verify:** Check if tables were created:

```bash
mysql -u root hrms_db -e "SHOW TABLES;"
```

You should see **25+ tables** listed!

---

### **Step 4: Verify Tables Created** ✅

#### **Using phpMyAdmin:**

1. Click **`hrms_db`** in left sidebar
2. You should see **25+ tables** listed:
   - announcements
   - attendance
   - attendance_policies
   - attendance_regularization
   - audit_logs
   - departments
   - documents
   - employees
   - holidays
   - leave_applications
   - leave_balances
   - leave_types
   - notification_preferences
   - notification_templates
   - notifications
   - organizations
   - payroll
   - payslips
   - projects
   - roles
   - salary_structures
   - tasks
   - teams
   - timesheets
   - users

#### **Using Command Line:**

```bash
mysql -u root hrms_db -e "SHOW TABLES;"
```

**Expected Output:**
```
+------------------------+
| Tables_in_hrms_db      |
+------------------------+
| announcements          |
| attendance             |
| attendance_policies    |
...
| users                  |
+------------------------+
25 rows in set (0.00 sec)
```

---

### **Step 5: Test Database Connection from Backend** 🔌

Now let's test if the Node.js backend can connect to your XAMPP MySQL database.

#### **Run the Database Connection Test:**

```bash
cd E:\HR\backend
npm run test:db
```

#### **Expected Output (Success):**

```
==================================================
🔍 Testing Database Connection...
==================================================
[info]: ✅ Database connection established successfully

📊 Database Information:
   Database: hrms_db
   Host: localhost
   Port: 3306
   Dialect: mysql

✅ Found 25 tables in database

📋 Tables in database:
   1. announcements
   2. attendance
   3. attendance_policies
   ...
   25. users

==================================================
✅ Database connection test completed successfully!
==================================================
🔌 Database connection closed
```

#### **If You See This (Database Doesn't Exist):**

```
❌ Database connection test failed!

Please check:
1. XAMPP MySQL is running (green in control panel)
2. Database "hrms_db" exists
3. .env file has correct credentials
```

**Solution:** Go back to Step 2 and create the database

#### **If You See This (No Tables):**

```
✅ Database connection established successfully
⚠️  No tables found. Please import database schema.
   Run: mysql -u root hrms_db < .agent/planning/database-schema.sql
```

**Solution:** Go back to Step 3 and import the schema

---

### **Step 6: Start Backend Server** 🚀

Once the database connection test passes:

```bash
cd E:\HR\backend
npm run dev
```

#### **Expected Output:**

```
[info]: 🚀 Server running on http://localhost:5000
[info]: 📝 Environment: development
[info]: 🔗 API Base: http://localhost:5000/api/v1
```

**Server is now running!** Keep this terminal open.

---

### **Step 7: Test Backend API Endpoints** 🧪

Open a **new terminal** or use your browser:

#### **Test 1: Health Check**

**Browser:** http://localhost:5000/health

**Or using curl:**
```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-12-04T17:05:58.000Z",
  "environment": "development"
}
```

#### **Test 2: API Info**

**Browser:** http://localhost:5000/api/v1

**Or using curl:**
```bash
curl http://localhost:5000/api/v1
```

**Expected Response:**
```json
{
  "success": true,
  "message": "HR Management System API",
  "version": "v1",
  "documentation": "http://localhost:5000/api-docs"
}
```

---

### **Step 8: Start Frontend Server** 🎨

In a **new terminal:**

```bash
cd E:\HR\frontend
npm run dev
```

#### **Expected Output:**

```
VITE v7.2.6  ready in 735 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

**Frontend is now running!** Open http://localhost:5173 in your browser.

---

## ✅ Complete Setup Checklist

Mark each item as you complete it:

### **XAMPP Setup:**
- [ ] XAMPP installed
- [ ] MySQL started (green in control panel)
- [ ] Apache started (optional, for phpMyAdmin)
- [ ] phpMyAdmin accessible at http://localhost/phpmyadmin

### **Database Setup:**
- [ ] Database `hrms_db` created
- [ ] Database schema imported
- [ ] 25+ tables visible in phpMyAdmin
- [ ] Sample data visible (organizations, roles tables)

### **Backend Setup:**
- [ ] npm install completed (in backend folder)
- [ ] Database connection test passes (`npm run test:db`)
- [ ] Backend server starts (`npm run dev`)
- [ ] Health check endpoint works
- [ ] API endpoint responds

### **Frontend Setup:**
- [ ] npm install completed (in frontend folder)
- [ ] Frontend server starts (`npm run dev`)
- [ ] Can access http://localhost:5173

### **Verification:**
- [ ] Both servers running simultaneously
- [ ] No error messages in terminals
- [ ] Can access both frontend and backend URLs

---

## 🐛 Troubleshooting

### **Problem: MySQL won't start in XAMPP**

**Symptoms:**
- Red status in XAMPP
- Error message in XAMPP logs

**Solutions:**

1. **Check if port 3306 is in use:**
   ```bash
   netstat -ano | findstr :3306
   ```
   If something is using it, stop that service

2. **Check for other MySQL services:**
   - Press `Win + R`, type `services.msc`
   - Look for "MySQL" services
   - Stop any running MySQL services

3. **Check XAMPP logs:**
   - In XAMPP Control Panel, click "Logs" next to MySQL
   - Look for error messages

### **Problem: Can't access phpMyAdmin**

**Solutions:**
- Make sure Apache is also running in XAMPP
- Try http://127.0.0.1/phpmyadmin instead
- Clear browser cache
- Check if port 80 is available

### **Problem: Database connection test fails**

**Error:** `ER_ACCESS_DENIED_ERROR`

**Solution:**
- XAMPP default has no password for root user
- Make sure your `.env` has: `DB_PASSWORD=` (empty)

**Error:** `ER_BAD_DB_ERROR`

**Solution:**
- Database doesn't exist
- Go back to Step 2 and create `hrms_db`

**Error:** `ECONNREFUSED`

**Solution:**
- MySQL is not running
- Start MySQL in XAMPP Control Panel

### **Problem: No tables found after import**

**Solutions:**
1. Check if import actually succeeded in phpMyAdmin
2. Try command line import method instead
3. Check file path is correct
4. Make sure you selected the right database before importing

### **Problem: Backend server won't start**

**Error:** `Cannot find module`

**Solution:**
```bash
cd E:\HR\backend
npm install
```

**Error:** `Port 5000 already in use`

**Solution:**
- Change PORT in `.env` to 5001 or another port
- Or stop the process using port 5000

---

## 📊 Quick Reference Commands

### **XAMPP Shell Commands:**

```bash
# Create database
mysql -u root -e "CREATE DATABASE hrms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Import schema
mysql -u root hrms_db < "E:\HR\.agent\planning\database-schema.sql"

# Show databases
mysql -u root -e "SHOW DATABASES;"

# Show tables
mysql -u root hrms_db -e "SHOW TABLES;"

# Count tables
mysql -u root hrms_db -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'hrms_db';"
```

### **Backend Commands:**

```bash
# Test database connection
npm run test:db

# Start development server
npm run dev

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint
```

### **Frontend Commands:**

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🎯 What's Next?

Once all tests pass, you're ready to start development!

### **Week 2 - Day 1 Tasks:**

1. ✅ Database connection working
2. 🔜 Create Sequelize models for core tables
3. 🔜 Build authentication endpoints (register, login)
4. 🔜 Implement JWT token generation
5. 🔜 Create login UI in frontend

### **Recommended Order:**

1. Create User and Organization models
2. Create authentication controller
3. Create auth routes
4. Test with Postman/Thunder Client
5. Build frontend login page
6. Connect frontend to backend

---

## 📞 Need Help?

If you're stuck:

1. **Check XAMPP logs:** `C:\xampp\mysql\data\mysql_error.log`
2. **Check backend logs:** `E:\HR\backend\logs\`
3. **Review error messages** carefully
4. **Verify each step** in the checklist above

---

**Setup Guide Version:** 1.0  
**Last Updated:** December 4, 2025  
**Status:** Ready for Testing 🚀
