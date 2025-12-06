# Quick Start Guide for Developers
## HR Management System

**Last Updated:** December 4, 2025

---

## 🎯 Purpose

This guide will help developers quickly understand the project structure and start contributing to the HR Management System.

---

## 📚 Essential Reading

Before you start coding, please review these documents in order:

1. **[phase1-summary.md](phase1-summary.md)** - Start here! Executive overview of the entire system
2. **[phase1-architecture.md](phase1-architecture.md)** - Detailed architecture and design decisions
3. **[api-quick-reference.md](api-quick-reference.md)** - API endpoints reference
4. **[database-schema.sql](database-schema.sql)** - Database structure
5. **[project-roadmap.md](project-roadmap.md)** - Development timeline and tasks

---

## 🏗️ System Overview

### What We're Building
A multi-tenant SaaS HR Management System with 5 core modules:
- 🕐 **Attendance** - GPS-based clock in/out
- ⏱️ **Timesheets** - Project time tracking
- 💰 **Payroll** - Automated salary processing
- 👤 **ESS** - Employee self-service portal
- 🔔 **Notifications** - Real-time alerts

### Tech Stack at a Glance
```
Frontend: React + Vite + Redux + MUI
Backend:  Node.js + Express + Sequelize
Database: MySQL + Redis
Mobile:   Flutter (optional)
```

---

## 🚀 Development Setup (30 Minutes)

### Prerequisites Checklist
- [ ] Node.js 18+ installed
- [ ] MySQL 8.0+ installed and running
- [ ] Redis installed and running
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

### Step 1: Clone and Setup (5 min)
```bash
# Clone the repository
git clone <repository-url>
cd HR

# Create necessary directories
mkdir -p backend frontend docs
```

### Step 2: Database Setup (5 min)
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE hrms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Exit MySQL
exit

# Import schema
mysql -u root -p hrms_db < .agent/planning/database-schema.sql

# Verify tables were created
mysql -u root -p hrms_db -e "SHOW TABLES;"
```

### Step 3: Backend Setup (10 min)
```bash
cd backend

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express mysql2 sequelize bcrypt jsonwebtoken joi cors helmet morgan winston dotenv multer nodemailer

# Install dev dependencies
npm install -D nodemon eslint prettier

# Create .env file
cat > .env << EOF
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=hrms_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email (optional for now)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# Frontend URL
FRONTEND_URL=http://localhost:5173
EOF

# Create basic folder structure
mkdir -p src/{config,controllers,middleware,models,routes,services,utils}
mkdir -p tests uploads
```

### Step 4: Frontend Setup (10 min)
```bash
cd ../frontend

# Create Vite React project
npm create vite@latest . -- --template react

# Install dependencies
npm install

# Install additional packages
npm install @reduxjs/toolkit react-redux react-router-dom @mui/material @emotion/react @emotion/styled axios react-hook-form yup @hookform/resolvers date-fns recharts react-toastify

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=HR Management System
EOF

# Create folder structure
mkdir -p src/{components,pages,store,services,utils,hooks,constants}
```

---

## 📂 Project Structure

### Backend Structure
```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # Database connection
│   │   ├── redis.js             # Redis connection
│   │   └── config.js            # App configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── userController.js    # User management
│   │   ├── employeeController.js
│   │   ├── attendanceController.js
│   │   ├── timesheetController.js
│   │   ├── payrollController.js
│   │   └── leaveController.js
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   ├── multiTenant.js       # Tenant isolation
│   │   ├── rbac.js              # Role-based access
│   │   ├── errorHandler.js      # Error handling
│   │   └── validator.js         # Input validation
│   ├── models/
│   │   ├── index.js             # Sequelize initialization
│   │   ├── Organization.js
│   │   ├── User.js
│   │   ├── Employee.js
│   │   ├── Attendance.js
│   │   ├── Timesheet.js
│   │   ├── Payroll.js
│   │   └── ...
│   ├── routes/
│   │   ├── index.js             # Route aggregator
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── employeeRoutes.js
│   │   ├── attendanceRoutes.js
│   │   └── ...
│   ├── services/
│   │   ├── emailService.js      # Email sending
│   │   ├── pdfService.js        # PDF generation
│   │   ├── payrollService.js    # Payroll calculations
│   │   └── notificationService.js
│   ├── utils/
│   │   ├── logger.js            # Winston logger
│   │   ├── helpers.js           # Helper functions
│   │   └── constants.js         # Constants
│   └── app.js                   # Express app setup
├── tests/
│   ├── unit/
│   └── integration/
├── uploads/                     # File uploads
├── .env                         # Environment variables
├── .env.example                 # Example env file
├── .eslintrc.js                 # ESLint config
├── .prettierrc                  # Prettier config
├── package.json
└── server.js                    # Entry point
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Loader.jsx
│   │   ├── attendance/
│   │   ├── timesheet/
│   │   ├── payroll/
│   │   └── employee/
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── dashboard/
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── EmployeeDashboard.jsx
│   │   ├── attendance/
│   │   ├── timesheet/
│   │   ├── payroll/
│   │   └── employee/
│   ├── store/
│   │   ├── index.js             # Redux store
│   │   ├── slices/
│   │   │   ├── authSlice.js
│   │   │   ├── employeeSlice.js
│   │   │   └── ...
│   ├── services/
│   │   ├── api.js               # Axios instance
│   │   ├── authService.js
│   │   ├── employeeService.js
│   │   └── ...
│   ├── utils/
│   │   ├── helpers.js
│   │   ├── validators.js
│   │   └── constants.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useApi.js
│   ├── App.jsx                  # Main app component
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles
├── public/
├── .env                         # Environment variables
├── .env.example
├── package.json
└── vite.config.js
```

---

## 🔑 Key Concepts

### 1. Multi-Tenant Architecture
Every request must include organization context:
```javascript
// Backend middleware
const multiTenant = (req, res, next) => {
  const organizationId = req.user.organization_id;
  req.organizationId = organizationId;
  next();
};

// All queries must filter by organization_id
const employees = await Employee.findAll({
  where: { organization_id: req.organizationId }
});
```

### 2. Role-Based Access Control (RBAC)
```javascript
// Middleware example
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};

// Usage in routes
router.get('/employees', 
  authenticate, 
  authorize('admin', 'team_lead'), 
  getEmployees
);
```

### 3. API Response Format
```javascript
// Success response
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}

// Error response
{
  "success": false,
  "message": "Validation error",
  "errors": [
    { "field": "email", "message": "Invalid email" }
  ]
}
```

---

## 🎯 Development Workflow

### 1. Pick a Task
- Check the [project-roadmap.md](project-roadmap.md)
- Choose a task from current week
- Create a feature branch

### 2. Branch Naming Convention
```bash
# Feature
git checkout -b feature/attendance-clock-in

# Bug fix
git checkout -b fix/payroll-calculation

# Enhancement
git checkout -b enhance/dashboard-ui
```

### 3. Coding Standards

#### Backend (Node.js)
```javascript
// Use async/await
const getEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.findAll({
      where: { organization_id: req.organizationId }
    });
    res.json({
      success: true,
      data: employees
    });
  } catch (error) {
    next(error);
  }
};

// Use meaningful variable names
// Add JSDoc comments for functions
// Follow ESLint rules
```

#### Frontend (React)
```jsx
// Use functional components with hooks
const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await employeeService.getAll();
      setEmployees(data);
    } catch (error) {
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  return (
    // JSX here
  );
};

// Use PropTypes or TypeScript
// Follow component structure: imports, component, export
```

### 4. Testing
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### 5. Commit Convention
```bash
# Format: <type>(<scope>): <subject>

git commit -m "feat(attendance): add clock-in API endpoint"
git commit -m "fix(payroll): correct salary calculation logic"
git commit -m "docs(api): update authentication documentation"
git commit -m "style(ui): improve dashboard layout"
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### 6. Pull Request
- Create PR with clear description
- Link to related issue/task
- Request code review
- Address review comments
- Merge after approval

---

## 🐛 Common Issues & Solutions

### Issue 1: Database Connection Error
```bash
# Check MySQL is running
mysql -u root -p

# Verify credentials in .env
# Check if database exists
mysql -u root -p -e "SHOW DATABASES;"
```

### Issue 2: CORS Error
```javascript
// backend/src/app.js
const cors = require('cors');
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### Issue 3: JWT Token Expired
```javascript
// Implement token refresh logic
// Check JWT_EXPIRES_IN in .env
```

---

## 📖 Useful Commands

### Backend
```bash
# Start development server
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format

# Generate API docs
npm run docs
```

### Frontend
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Lint code
npm run lint
```

### Database
```bash
# Create migration
npx sequelize-cli migration:generate --name create-users

# Run migrations
npx sequelize-cli db:migrate

# Rollback migration
npx sequelize-cli db:migrate:undo

# Create seed
npx sequelize-cli seed:generate --name demo-users

# Run seeds
npx sequelize-cli db:seed:all
```

---

## 🎓 Learning Resources

### Essential Topics
1. **Multi-tenant Architecture**
   - Data isolation strategies
   - Subdomain routing
   - Organization context

2. **JWT Authentication**
   - Token generation
   - Token verification
   - Refresh token flow

3. **Role-Based Access Control**
   - Permission management
   - Middleware implementation
   - Frontend route protection

4. **Sequelize ORM**
   - Model definition
   - Associations
   - Queries and transactions

5. **React State Management**
   - Redux Toolkit
   - Async thunks
   - Selectors

---

## 🤝 Getting Help

### Resources
- **Documentation:** Check `.agent/planning/` folder
- **API Reference:** [api-quick-reference.md](api-quick-reference.md)
- **Architecture:** [phase1-architecture.md](phase1-architecture.md)

### Communication
- Daily standup: 10:00 AM
- Code reviews: Within 24 hours
- Questions: Team Slack channel

---

## ✅ Checklist for First Day

- [ ] Read phase1-summary.md
- [ ] Set up development environment
- [ ] Create database and import schema
- [ ] Install backend dependencies
- [ ] Install frontend dependencies
- [ ] Run backend server successfully
- [ ] Run frontend server successfully
- [ ] Review coding standards
- [ ] Join team communication channels
- [ ] Pick first task from roadmap

---

## 🎯 Your First Task

Start with **Week 1** tasks from the roadmap:
1. Set up project structure
2. Configure database connection
3. Create basic Express server
4. Set up React app with routing

---

**Welcome to the team! Let's build something amazing! 🚀**

---

**Last Updated:** December 4, 2025  
**Maintained By:** Development Team
