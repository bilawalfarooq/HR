# Development Environment Setup Guide
## HR Management System

**Date:** December 4, 2025

---

## ✅ Setup Progress

### Completed Steps
- ✅ Project structure created
- ✅ Backend folder structure created
- ✅ Backend configuration files created
- ✅ Environment variables configured
- ✅ Logger utility created
- ✅ Error handling middleware created
- ✅ Main server file created
- ⏳ Installing backend dependencies...
- ⏳ Installing frontend dependencies...

---

## 📋 Prerequisites Checklist

### Required Software
- [x] **Node.js 24.11.1** - Installed ✅
- [x] **npm 11.6.2** - Installed ✅
- [ ] **MySQL 8.0+** - Not found in PATH ⚠️
- [ ] **Redis** - Optional (for caching)

### MySQL Setup Required

Since MySQL is not in your system PATH, you have two options:

#### Option 1: Install MySQL (Recommended)
1. Download MySQL from: https://dev.mysql.com/downloads/installer/
2. Run the installer
3. Choose "Developer Default" setup
4. Set root password (remember this!)
5. Add MySQL to system PATH

#### Option 2: Use XAMPP/WAMP
1. Download XAMPP: https://www.apachefriends.org/
2. Install and start MySQL service
3. Default credentials: root / (no password)

---

## 🗂️ Project Structure Created

```
E:\HR\
├── .agent\
│   └── planning\
│       ├── phase1-architecture.md
│       ├── api-quick-reference.md
│       ├── database-schema.sql
│       ├── project-roadmap.md
│       ├── phase1-summary.md
│       └── developer-quick-start.md
├── backend\                    ✅ Created
│   ├── src\
│   │   ├── config\
│   │   │   └── config.js      ✅ Created
│   │   ├── controllers\
│   │   ├── middleware\
│   │   │   └── errorHandler.js ✅ Created
│   │   ├── models\
│   │   ├── routes\
│   │   ├── services\
│   │   └── utils\
│   │       └── logger.js       ✅ Created
│   ├── tests\
│   │   ├── unit\
│   │   └── integration\
│   ├── uploads\
│   │   └── .gitkeep            ✅ Created
│   ├── .env                    ✅ Created
│   ├── .env.example            ✅ Created
│   ├── .gitignore              ✅ Created
│   ├── package.json            ✅ Created
│   ├── server.js               ✅ Created
│   └── README.md               ✅ Created
├── frontend\                   ⏳ Installing
├── docs\                       ✅ Created
├── uploads\                    ✅ Created
└── README.md                   ✅ Created
```

---

## 🔧 Configuration Files Created

### Backend Configuration

#### 1. `.env` File
Location: `backend\.env`

**Important:** Update the following values:
```env
DB_PASSWORD=your_mysql_password_here
```

All other defaults are set for local development.

#### 2. `server.js`
- Express server setup
- Middleware configuration
- CORS enabled for frontend
- Health check endpoint at `/health`
- API base at `/api/v1`

#### 3. Logger (`src/utils/logger.js`)
- Winston logger configured
- Logs to console and files
- Log files in `logs/` directory

#### 4. Error Handler (`src/middleware/errorHandler.js`)
- Global error handling
- Custom AppError class
- Async handler wrapper

---

## 📦 Dependencies Being Installed

### Backend Dependencies (Production)
- **express** - Web framework
- **mysql2** - MySQL client
- **sequelize** - ORM for MySQL
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication
- **joi** - Validation
- **cors** - CORS middleware
- **helmet** - Security headers
- **morgan** - HTTP logger
- **winston** - Application logger
- **dotenv** - Environment variables
- **multer** - File upload
- **nodemailer** - Email sending
- **express-rate-limit** - Rate limiting
- **redis** - Redis client
- **puppeteer** - PDF generation
- **exceljs** - Excel export
- **node-cron** - Task scheduling
- **swagger-ui-express** - API documentation
- **swagger-jsdoc** - Swagger generator

### Backend Dependencies (Development)
- **nodemon** - Auto-restart server
- **eslint** - Code linting
- **prettier** - Code formatting
- **jest** - Testing framework
- **supertest** - API testing

---

## 🚀 Next Steps After Installation

### 1. Set Up MySQL Database

Once MySQL is installed:

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE hrms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Exit MySQL
exit

# Import schema
mysql -u root -p hrms_db < .agent/planning/database-schema.sql

# Verify tables
mysql -u root -p hrms_db -e "SHOW TABLES;"
```

### 2. Update Backend .env File

Edit `backend\.env`:
```env
DB_PASSWORD=your_actual_mysql_password
```

### 3. Start Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:5000
📝 Environment: development
🔗 API Base: http://localhost:5000/api/v1
```

### 4. Test Backend

Open browser or use curl:
```bash
# Health check
curl http://localhost:5000/health

# API info
curl http://localhost:5000/api/v1
```

### 5. Set Up Frontend

After frontend installation completes:

```bash
cd frontend
npm install  # If not already done
npm run dev
```

Frontend will run on: http://localhost:5173

---

## 🐛 Troubleshooting

### Issue: MySQL not found
**Solution:** Install MySQL or XAMPP, then add to system PATH

### Issue: Port 5000 already in use
**Solution:** Change PORT in `backend\.env` to another port (e.g., 5001)

### Issue: Database connection error
**Solution:** 
1. Check MySQL is running
2. Verify credentials in `.env`
3. Ensure database `hrms_db` exists

### Issue: Module not found errors
**Solution:** Run `npm install` in backend directory

### Issue: Permission errors on Windows
**Solution:** Run terminal as Administrator

---

## 📊 Installation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Node.js | ✅ Installed | v24.11.1 |
| npm | ✅ Installed | v11.6.2 |
| MySQL | ⚠️ Required | Not in PATH |
| Backend Structure | ✅ Complete | All files created |
| Backend Dependencies | ⏳ Installing | In progress |
| Frontend Structure | ⏳ Installing | In progress |
| Database | ⏳ Pending | Needs MySQL |

---

## 🎯 What's Been Set Up

### Backend Features Ready
- ✅ Express server with middleware
- ✅ Environment configuration
Once installations finish and MySQL is set up:

1. ✅ Test backend server
2. ✅ Test database connection
3. ✅ Test frontend dev server
4. ✅ Verify CORS between frontend and backend
5. 🚀 Start building authentication module (Week 2)

---

**Setup Started:** December 4, 2025, 9:43 PM  
**Estimated Completion:** 10-15 minutes (depending on internet speed)

---

**Next Document:** See `developer-quick-start.md` for development workflow
