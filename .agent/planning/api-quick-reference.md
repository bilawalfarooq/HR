# API Quick Reference Guide
## HR Management System

**Base URL:** `https://api.hrms.com/v1`

---

## Authentication

All API requests (except login/register) require JWT token in header:
```
Authorization: Bearer <access_token>
```

### Auth Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/login` | User login | Public |
| POST | `/auth/logout` | User logout | Authenticated |
| POST | `/auth/refresh-token` | Refresh access token | Authenticated |
| POST | `/auth/forgot-password` | Request password reset | Public |
| POST | `/auth/reset-password` | Reset password | Public |
| GET | `/auth/me` | Get current user | Authenticated |

---

## Module Overview

### 1. Attendance Module

**Base:** `/attendance`

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/clock-in` | Clock in | Employee |
| POST | `/clock-out` | Clock out | Employee |
| GET | `/` | List attendance | All |
| POST | `/manual` | Manual attendance | Admin/Team Lead |
| GET | `/employee/:employeeId` | Employee attendance | Employee/Team Lead/Admin |
| GET | `/team/:teamId` | Team attendance | Team Lead/Admin |
| GET | `/reports/daily` | Daily report | Admin |
| GET | `/reports/monthly` | Monthly report | Admin |
| POST | `/regularization` | Request regularization | Employee |
| PUT | `/regularization/:id/approve` | Approve regularization | Team Lead/Admin |
| PUT | `/regularization/:id/reject` | Reject regularization | Team Lead/Admin |

---

### 2. Timesheet Module

**Base:** `/timesheets`

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/` | Create timesheet | Employee |
| GET | `/` | List timesheets | All |
| PUT | `/:id` | Update timesheet | Employee |
| POST | `/:id/submit` | Submit for approval | Employee |
| PUT | `/:id/approve` | Approve timesheet | Team Lead/Admin |
| PUT | `/:id/reject` | Reject timesheet | Team Lead/Admin |
| GET | `/employee/:employeeId` | Employee timesheets | Employee/Team Lead/Admin |
| GET | `/team/:teamId` | Team timesheets | Team Lead/Admin |
| GET | `/reports/weekly` | Weekly report | Admin |
| GET | `/reports/monthly` | Monthly report | Admin |

**Projects & Tasks:**

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/projects` | List projects | All |
| POST | `/projects` | Create project | Admin |
| GET | `/tasks` | List tasks | All |
| POST | `/tasks` | Create task | Admin/Team Lead |
| GET | `/tasks/assigned` | Assigned tasks | Employee |

---

### 3. Payroll Module

**Base:** `/payroll`

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/process` | Process monthly payroll | Admin |
| GET | `/` | List payroll records | Admin |
| GET | `/:id` | Get payroll details | Admin |
| POST | `/:id/generate-payslip` | Generate payslip | Admin |
| POST | `/:id/mark-paid` | Mark as paid | Admin |
| GET | `/reports/monthly` | Monthly report | Admin |

**Salary Structures:**

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/salary-structures` | List structures | Admin |
| POST | `/salary-structures` | Create structure | Admin |
| GET | `/salary-structures/employee/:employeeId` | Employee structure | Admin/Employee |

**Payslips:**

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/payslips` | List all payslips | Admin |
| GET | `/payslips/employee/:employeeId` | Employee payslips | Employee/Admin |
| GET | `/payslips/:id/download` | Download PDF | Employee/Admin |

---

### 4. Leave Management (ESS)

**Base:** `/leave-applications`

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/` | Apply for leave | Employee |
| GET | `/` | List applications | All |
| GET | `/:id` | Get details | Employee/Team Lead/Admin |
| PUT | `/:id` | Update application | Employee |
| DELETE | `/:id` | Cancel application | Employee |
| GET | `/pending` | Pending approvals | Team Lead/Admin |
| PUT | `/:id/approve` | Approve leave | Team Lead/Admin |
| PUT | `/:id/reject` | Reject leave | Team Lead/Admin |
| GET | `/team/:teamId` | Team applications | Team Lead/Admin |
| GET | `/calendar` | Leave calendar | All |

**Leave Types & Balances:**

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/leave-types` | List leave types | All |
| POST | `/leave-types` | Create leave type | Admin |
| GET | `/leave-balances` | Get balances | Employee |
| GET | `/leave-balances/employee/:employeeId` | Employee balance | Admin |

---

### 5. Employee Management

**Base:** `/employees`

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/` | Create employee | Admin |
| GET | `/` | List employees | Admin/Team Lead |
| GET | `/:id` | Get details | Admin/Team Lead |
| PUT | `/:id` | Update employee | Admin |
| DELETE | `/:id` | Delete employee | Admin |
| GET | `/:id/profile` | Get profile | Employee |
| PUT | `/:id/profile` | Update profile | Employee |

**Departments & Teams:**

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/departments` | List departments | All |
| POST | `/departments` | Create department | Admin |
| GET | `/teams` | List teams | All |
| POST | `/teams` | Create team | Admin |
| GET | `/teams/:id/members` | Team members | Team Lead/Admin |

---

### 6. Notifications

**Base:** `/notifications`

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/` | List notifications | User |
| GET | `/:id` | Get details | User |
| PUT | `/:id/read` | Mark as read | User |
| PUT | `/read-all` | Mark all as read | User |
| POST | `/send` | Send notification | Admin |
| POST | `/broadcast` | Broadcast | Admin |

**Templates & Preferences:**

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/notification-templates` | List templates | Admin |
| POST | `/notification-templates` | Create template | Admin |
| GET | `/notification-preferences` | Get preferences | User |
| PUT | `/notification-preferences` | Update preferences | User |

---

### 7. Documents & Announcements

**Documents:**

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/documents` | Upload document | Employee/Admin |
| GET | `/documents` | List documents | Admin |
| GET | `/documents/employee/:employeeId` | Employee documents | Employee/Admin |
| DELETE | `/documents/:id` | Delete document | Admin |

**Announcements:**

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/announcements` | List announcements | All |
| POST | `/announcements` | Create announcement | Admin |
| GET | `/announcements/:id` | Get details | All |
| PUT | `/announcements/:id` | Update | Admin |
| DELETE | `/announcements/:id` | Delete | Admin |

---

### 8. Reports & Analytics

**Base:** `/reports`

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/dashboard` | Dashboard analytics | Admin |
| GET | `/attendance/summary` | Attendance summary | Admin |
| GET | `/attendance/trends` | Attendance trends | Admin |
| GET | `/timesheet/productivity` | Productivity report | Admin |
| GET | `/payroll/summary` | Payroll summary | Admin |
| GET | `/leave/summary` | Leave summary | Admin |
| GET | `/employee/headcount` | Headcount report | Admin |
| POST | `/custom` | Custom report | Admin |
| GET | `/export/:reportId` | Export report | Admin |

---

### 9. Super Admin (SaaS)

**Base:** `/admin`

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/organizations` | Create organization | Super Admin |
| GET | `/organizations` | List organizations | Super Admin |
| GET | `/organizations/:id` | Get details | Super Admin |
| PUT | `/organizations/:id` | Update organization | Super Admin |
| DELETE | `/organizations/:id` | Delete organization | Super Admin |
| PUT | `/organizations/:id/suspend` | Suspend | Super Admin |
| PUT | `/organizations/:id/activate` | Activate | Super Admin |
| GET | `/subscriptions` | List subscriptions | Super Admin |
| GET | `/analytics` | Platform analytics | Super Admin |
| GET | `/audit-logs` | Audit logs | Super Admin |

---

## Common Query Parameters

### Pagination
```
?page=1&limit=10
```

### Filtering
```
?status=active
?department_id=123
?start_date=2025-01-01&end_date=2025-01-31
```

### Sorting
```
?sort_by=created_at&order=desc
```

### Search
```
?search=john
```

---

## Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Server Error |

---

## Sample Requests

### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "john.doe@company.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "user_id": 1,
      "email": "john.doe@company.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "Employee"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Clock In
```bash
POST /attendance/clock-in
Authorization: Bearer <token>
Content-Type: application/json

{
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "New York, NY"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Clocked in successfully",
  "data": {
    "attendance_id": 123,
    "employee_id": 1,
    "date": "2025-12-04",
    "clock_in_time": "2025-12-04T09:00:00Z",
    "status": "Present"
  }
}
```

### Apply Leave
```bash
POST /leave-applications
Authorization: Bearer <token>
Content-Type: application/json

{
  "leave_type_id": 1,
  "start_date": "2025-12-10",
  "end_date": "2025-12-12",
  "total_days": 3,
  "reason": "Family vacation"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Leave application submitted",
  "data": {
    "leave_application_id": 456,
    "employee_id": 1,
    "leave_type": "Casual Leave",
    "start_date": "2025-12-10",
    "end_date": "2025-12-12",
    "total_days": 3,
    "status": "Pending"
  }
}
```

---

## Rate Limiting

- **General:** 100 requests per 15 minutes per user
- **Auth endpoints:** 5 requests per 15 minutes per IP
- **Report generation:** 10 requests per hour per user

---

**Last Updated:** December 4, 2025
