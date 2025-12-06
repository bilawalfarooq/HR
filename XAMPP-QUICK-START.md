# ⚡ XAMPP Quick Setup - HR Management System

## 🚀 5-Minute Setup

### 1️⃣ Start XAMPP MySQL
```
Open XAMPP Control Panel
Click "Start" next to MySQL
Wait for green "Running" status
```

### 2️⃣ Create Database (Choose One Method)

**Method A: phpMyAdmin (Easiest)**
1. Open: http://localhost/phpmyadmin
2. Click "New" → Database name: `hrms_db`
3. Collation: `utf8mb4_unicode_ci` → Click "Create"

**Method B: Command Line**
```bash
# Open XAMPP Shell, then:
mysql -u root -e "CREATE DATABASE hrms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 3️⃣ Import Database Schema

**Method A: phpMyAdmin**
1. Click `hrms_db` in left sidebar
2. Click "Import" tab
3. Choose file: `E:\HR\.agent\planning\database-schema.sql`
4. Click "Import" button

**Method B: Command Line**
```bash
# In XAMPP Shell:
mysql -u root hrms_db < "E:\HR\.agent\planning\database-schema.sql"
```

### 4️⃣ Verify Setup
```bash
# In XAMPP Shell:
mysql -u root hrms_db -e "SHOW TABLES;"
```
✅ Should show 25+ tables

### 5️⃣ Start Backend Server
```bash
cd E:\HR\backend
npm run dev
```
✅ Should see: "🚀 Server running on http://localhost:5000"

### 6️⃣ Test
Open browser: http://localhost:5000/health
✅ Should return JSON with "success": true

---

## 📝 XAMPP Default Settings (Already Configured)

Your `backend\.env` is already set for XAMPP:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=          # Empty - XAMPP default
DB_NAME=hrms_db
```

**✅ No changes needed!**

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| MySQL won't start | Stop other MySQL services in Task Manager |
| Can't access phpMyAdmin | Start Apache in XAMPP too |
| Import fails | Use command line method instead |
| Connection error | Check MySQL is running (green in XAMPP) |

---

## ✅ Setup Checklist

- [ ] XAMPP MySQL running (green)
- [ ] Database `hrms_db` created
- [ ] Schema imported (25+ tables)
- [ ] Backend server starts
- [ ] http://localhost:5000/health works

---

**Ready to code!** 🎉

See `xampp-setup-guide.md` for detailed instructions.
