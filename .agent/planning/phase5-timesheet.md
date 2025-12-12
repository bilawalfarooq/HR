# Phase 5: Timesheet Implementation Plan

## 1. Database Schema Design (Backend)

We need models to track weekly timesheets and daily entries.

### New Models
- **Timesheet**:
  - `employee_id`: Reference -> Employee
  - `week_start_date`: DateOnly (e.g., Monday)
  - `week_end_date`: DateOnly (e.g., Sunday)
  - `total_hours`: Float
  - `status`: Enum ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED')
  - `approved_by`: Reference -> Employee (Manager)
  - `rejection_reason`: Text
- **TimesheetEntry**:
  - `timesheet_id`: Reference -> Timesheet
  - `date`: DateOnly
  - `project_id`: Integer (Optional, for now just string tasks?) -> Let's keep it simple: `project_name` or `task_name`.
  - `task_name`: String
  - `hours`: Float
  - `description`: Text

## 2. API Development (Backend)

### Endpoints
- `POST /api/v1/timesheets`: Create/Update a draft timesheet.
- `GET /api/v1/timesheets`: List my timesheets.
- `GET /api/v1/timesheets/:id`: Get details.
- `PUT /api/v1/timesheets/:id/submit`: Submit for approval.
- `GET /api/v1/timesheets/pending`: Manager view.
- `PUT /api/v1/timesheets/:id/approve`: Approve/Reject.

## 3. Frontend Development (Web)

### Components
- **TimesheetGrid**: A weekly grid (Mon-Sun) to input hours for different tasks.
- **TimesheetStatusBadge**: Visual indicator of status.

### Pages
- `/timesheets/my`: List and Create.
- `/timesheets/approvals`: Manager view.

## 4. Implementation Steps

1.  **Models**: Create `Timesheet`, `TimesheetEntry`.
2.  **API**: CRUD for timesheets + Approval logic.
3.  **UI**: Build the weekly input grid and management pages.
