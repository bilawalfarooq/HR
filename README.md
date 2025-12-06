# HR Management System (HRMS)

A comprehensive, multi-tenant SaaS HR Management System built with React, Node.js, and MySQL.

![Status](https://img.shields.io/badge/Status-In%20Planning-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📋 Overview

This HR Management System is a complete solution for managing all aspects of human resources including attendance tracking, timesheet management, payroll processing, employee self-service, and notifications. Built with modern technologies and designed for scalability.

---

## ✨ Key Features

### 🕐 Attendance Management
- GPS-based clock in/out
- Real-time attendance tracking
- Manual attendance marking (Admin/Team Lead)
- Attendance regularization workflow
- Comprehensive attendance reports
- Configurable attendance policies

### ⏱️ Timesheet Management
- Project and task-based time tracking
- Approval workflow (Employee → Team Lead → HR)
- Billable vs non-billable hours
- Productivity analytics
- Weekly/monthly timesheet reports

### 💰 Payroll Management
- Automated salary calculation
- Configurable salary structures
- Allowances and deductions management
- Automated payslip generation (PDF)
- Tax calculations
- Payment tracking and reporting

### 👤 Employee Self-Service (ESS)
- Personal profile management
- Leave application and tracking
- Attendance history viewing
- Payslip download
- Document management
- Announcement viewing

### 🔔 Notifications System
- Real-time in-app notifications
- Email notifications
- SMS notifications (optional)
- Push notifications (mobile app)
- Customizable notification templates
- User notification preferences

---

## 🏗️ Architecture

### Multi-Tenant SaaS
- Organization-level data isolation
- Subdomain-based tenant identification
- Scalable architecture supporting multiple organizations

### User Roles
1. **Super Admin** - Platform management
2. **Admin/HR Manager** - Full HR operations
3. **Team Lead** - Team-level management
4. **Employee** - Self-service access

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18+
- **Build Tool:** Vite
- **State Management:** Redux Toolkit
- **UI Library:** Material-UI (MUI)
- **Forms:** React Hook Form + Yup
- **HTTP Client:** Axios
- **Charts:** Recharts

### Backend
- **Runtime:** Node.js 18+ LTS
- **Framework:** Express.js
- **ORM:** Sequelize / Prisma
- **Authentication:** JWT
- **Validation:** Joi
- **File Upload:** Multer
- **PDF Generation:** Puppeteer
- **Email:** Nodemailer

### Database
- **Primary Database:** MySQL 8.0+
- **Cache:** Redis
- **File Storage:** AWS S3 / Local Storage

### Mobile (Optional)
- **Framework:** Flutter
- **Features:** GPS attendance, offline support, push notifications

---

## 📁 Project Structure

```
HR/
├── .agent/
│   ├── planning/
│   │   ├── phase1-architecture.md
│   │   ├── api-quick-reference.md
│   │   ├── database-schema.sql
│   │   ├── project-roadmap.md
│   │   └── phase1-summary.md
│   └── workflows/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── app.js
│   ├── tests/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   └── package.json
├── mobile/ (optional)
│   ├── lib/
│   ├── android/
│   ├── ios/
│   └── pubspec.yaml
├── docs/
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ LTS
- MySQL 8.0+
- Redis
- npm or yarn

### Installation

#### 1. Clone the repository
```bash
git clone https://github.com/yourusername/hr-management-system.git
cd hr-management-system
```

#### 2. Set up the database
```bash
# Create MySQL database
mysql -u root -p

# Run the schema
mysql -u root -p hrms_db < .agent/planning/database-schema.sql
```

#### 3. Set up the backend
```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Update .env with your configuration
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=yourpassword
# DB_NAME=hrms_db
# JWT_SECRET=your-secret-key
# REDIS_URL=redis://localhost:6379

# Start the backend
npm run dev
```

#### 4. Set up the frontend
```bash
cd frontend
npm install

# Create .env file
cp .env.example .env

# Update .env with backend URL
# VITE_API_URL=http://localhost:5000/api/v1

# Start the frontend
npm run dev
```

#### 5. Access the application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs

---

## 📚 Documentation

### Planning Documents
- [Phase 1 Architecture](.agent/planning/phase1-architecture.md) - Complete system architecture
- [API Quick Reference](.agent/planning/api-quick-reference.md) - API endpoint reference
- [Database Schema](.agent/planning/database-schema.sql) - MySQL database schema
- [Project Roadmap](.agent/planning/project-roadmap.md) - 14-week development roadmap
- [Phase 1 Summary](.agent/planning/phase1-summary.md) - Executive summary

### API Documentation
- Swagger UI available at `/api-docs` when backend is running
- 100+ RESTful API endpoints
- JWT-based authentication

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
npm run test:coverage
```

### Frontend Tests
```bash
cd frontend
npm test
npm run test:e2e
```

---

## 📦 Deployment

### Production Build

#### Backend
```bash
cd backend
npm run build
npm start
```

#### Frontend
```bash
cd frontend
npm run build
# Deploy the 'dist' folder to your hosting service
```

### Docker Deployment (Coming Soon)
```bash
docker-compose up -d
```

---

## 🗺️ Roadmap

### ✅ Phase 1: Planning & Architecture (Complete)
- Module definitions
- User roles and permissions
- Database design
- Technology stack selection
- API structure

### ⏳ Phase 2: Foundation (Weeks 1-2)
- Project setup
- Authentication & authorization
- Multi-tenant infrastructure
- User and role management

### ⏳ Phase 3: Core Modules (Weeks 3-6)
- Employee management
- Attendance module
- Timesheet module
- Leave management

### ⏳ Phase 4: Payroll (Weeks 7-8)
- Salary structures
- Payroll processing
- Payslip generation

### ⏳ Phase 5: ESS & Notifications (Weeks 9-10)
- Employee self-service portal
- Notification system
- Announcements

### ⏳ Phase 6: Reports & Analytics (Weeks 11-12)
- Dashboards
- Report generation
- Data export

### ⏳ Phase 7: Testing & Deployment (Weeks 13-14)
- Testing
- Production deployment
- Documentation

### ⏳ Phase 8: Mobile App (Weeks 15-18) - Optional
- Flutter app development
- GPS attendance
- App store deployment

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Project Lead:** [Your Name]
- **Backend Developer:** [Name]
- **Frontend Developer:** [Name]
- **Mobile Developer:** [Name]

---

## 📞 Support

For support, email support@hrms.com or join our Slack channel.

---

## 🙏 Acknowledgments

- Material-UI for the excellent React components
- Express.js community for the robust backend framework
- MySQL team for the reliable database system

---

## 📊 Project Status

- **Current Phase:** Planning Complete ✅
- **Next Phase:** Development - Week 1
- **Estimated Completion:** March 2026
- **Progress:** 5% (Planning Complete)

---

## 🔗 Links

- [Live Demo](https://demo.hrms.com) (Coming Soon)
- [API Documentation](https://api.hrms.com/docs) (Coming Soon)
- [User Guide](https://docs.hrms.com) (Coming Soon)

---

**Built with ❤️ by the HRMS Development Team**
