# 🎯 HRMS Test Credentials

## 📋 Login Credentials for Testing

All users belong to organization: **demo-corp** (subdomain: `demo-corp`)

---

### 🔴 SUPER ADMIN

**Email:** `superadmin@hrms.com`  
**Password:** `SuperAdmin@123`  
**Role:** Super Admin  
**Organization:** demo-corp  
**Access:** Full system access, can manage all organizations

---

### 🟢 ADMIN/HR USERS

#### Admin User
**Email:** `admin@demo.com`  
**Password:** `Admin@123`  
**Role:** Admin  
**Organization:** demo-corp  
**Access:** Full admin access to manage employees, attendance, payroll, leaves, and reports

#### HR User
**Email:** `hr@demo.com`  
**Password:** `HR@123`  
**Role:** HR  
**Organization:** demo-corp  
**Access:** Manage employees, attendance, leaves, and view reports

---

### 🟡 TEAM LEAD USERS

#### IT Team Lead
**Email:** `teamlead@demo.com`  
**Password:** `TeamLead@123`  
**Role:** Team Lead  
**Organization:** demo-corp  
**Department:** Information Technology  
**Access:** View team attendance, approve leaves, view team reports

#### Sales Manager
**Email:** `manager@demo.com`  
**Password:** `Manager@123`  
**Role:** Team Lead  
**Organization:** demo-corp  
**Department:** Sales  
**Access:** View team attendance, approve leaves, view team reports

---

### 🔵 EMPLOYEE USERS

#### IT Employee
**Email:** `employee@demo.com`  
**Password:** `Employee@123`  
**Role:** Employee  
**Organization:** demo-corp  
**Department:** Information Technology  
**Access:** View own attendance, apply for leaves, view own payroll

#### Sales Employee
**Email:** `staff@demo.com`  
**Password:** `Staff@123`  
**Role:** Employee  
**Organization:** demo-corp  
**Department:** Sales  
**Access:** View own attendance, apply for leaves, view own payroll

---

## 📊 Test Data Summary

The database has been seeded with:

- ✅ **1 Organization:** Demo Corporation (demo-corp)
- ✅ **5 Roles:** Super Admin, Admin, HR, Team Lead, Employee
- ✅ **7 Test Users** (including Super Admin)
- ✅ **5 Departments:** Human Resources, IT, Sales, Finance, Operations
- ✅ **4 Shifts:** Morning, Afternoon, Night, Flexible Hours
- ✅ **5 Leave Types:** Annual, Sick, Casual, Maternity, Paternity
- ✅ **4 Holidays:** New Year, Independence Day, Christmas, Thanksgiving
- ✅ **30 Days of Attendance Records** (last 30 days)
- ✅ **Sample Leave Requests** (various statuses)
- ✅ **Leave Balances** for all employees
- ✅ **Salary Structures** for all employees

---

## 🚀 Quick Start

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Login with any of the credentials above**

4. **Optional:** Use organization subdomain `demo-corp` during login (can be left blank)

---

## 🔄 Reset Database

To reset the database and reseed with fresh test data:

```bash
cd backend
npm run db:reset
```

This will:
- Drop all existing tables
- Recreate all tables
- Seed fresh test data
- Display all login credentials

---

**Last Updated:** 2025-12-12


