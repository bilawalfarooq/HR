-- ============================================
-- HR Management System - Database Schema
-- Database: MySQL 8.0+
-- Created: December 4, 2025
-- ============================================

-- Create database
CREATE DATABASE IF NOT EXISTS hrms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hrms_db;

-- ============================================
-- MULTI-TENANT ARCHITECTURE
-- ============================================

CREATE TABLE organizations (
    organization_id INT AUTO_INCREMENT PRIMARY KEY,
    organization_name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    subscription_plan ENUM('free', 'basic', 'premium', 'enterprise') DEFAULT 'basic',
    subscription_status ENUM('active', 'suspended', 'cancelled', 'trial') DEFAULT 'trial',
    subscription_expires_at DATETIME,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    address TEXT,
    logo_url VARCHAR(500),
    settings JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_subdomain (subdomain),
    INDEX idx_subscription_status (subscription_status)
) ENGINE=InnoDB;

-- ============================================
-- USER MANAGEMENT
-- ============================================

CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    role_name VARCHAR(50) NOT NULL,
    role_type ENUM('super_admin', 'admin', 'team_lead', 'employee') NOT NULL,
    permissions JSON,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) ON DELETE CASCADE,
    INDEX idx_org_role (organization_id, role_type)
) ENGINE=InnoDB;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role_id INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login_at DATETIME,
    password_reset_token VARCHAR(255),
    password_reset_expires DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id),
    UNIQUE KEY unique_email_per_org (organization_id, email),
    INDEX idx_email (email),
    INDEX idx_org_active (organization_id, is_active)
) ENGINE=InnoDB;

-- ============================================
-- EMPLOYEE MANAGEMENT
-- ============================================

CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    department_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) ON DELETE CASCADE,
    INDEX idx_org_dept (organization_id)
) ENGINE=InnoDB;

CREATE TABLE teams (
    team_id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    department_id INT NOT NULL,
    team_name VARCHAR(100) NOT NULL,
    team_lead_id INT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE,
    INDEX idx_org_team (organization_id),
    INDEX idx_dept_team (department_id)
) ENGINE=InnoDB;

CREATE TABLE employees (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    user_id INT NOT NULL,
    employee_code VARCHAR(50) NOT NULL,
    department_id INT,
    team_id INT,
    manager_id INT,
    designation VARCHAR(100),
    date_of_joining DATE NOT NULL,
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    address JSON,
    emergency_contact JSON,
    employment_type ENUM('full_time', 'part_time', 'contract', 'intern') DEFAULT 'full_time',
    status ENUM('active', 'inactive', 'terminated', 'resigned') DEFAULT 'active',
    termination_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL,
    FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE SET NULL,
    FOREIGN KEY (manager_id) REFERENCES employees(employee_id) ON DELETE SET NULL,
    UNIQUE KEY unique_emp_code_per_org (organization_id, employee_code),
    INDEX idx_org_emp (organization_id),
    INDEX idx_dept_emp (department_id),
    INDEX idx_team_emp (team_id),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- Add foreign key for team_lead_id after employees table is created
ALTER TABLE teams ADD FOREIGN KEY (team_lead_id) REFERENCES employees(employee_id) ON DELETE SET NULL;

-- ============================================
-- ATTENDANCE MODULE
-- ============================================

CREATE TABLE attendance_policies (
    policy_id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    policy_name VARCHAR(100) NOT NULL,
    working_hours_per_day DECIMAL(4,2) DEFAULT 8.00,
    grace_period_minutes INT DEFAULT 15,
    half_day_hours DECIMAL(4,2) DEFAULT 4.00,
    location_tracking_enabled BOOLEAN DEFAULT FALSE,
    location_radius_meters INT DEFAULT 100,
    auto_clock_out_enabled BOOLEAN DEFAULT FALSE,
    auto_clock_out_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) ON DELETE CASCADE,
    INDEX idx_org_policy (organization_id)
) ENGINE=InnoDB;

CREATE TABLE attendance (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    employee_id INT NOT NULL,
    date DATE NOT NULL,
    clock_in_time DATETIME,
    clock_in_location JSON,
    clock_out_time DATETIME,
    clock_out_location JSON,
    total_hours DECIMAL(4,2),
    status ENUM('present', 'absent', 'half_day', 'late', 'on_leave', 'holiday') DEFAULT 'present',
    remarks TEXT,
    is_manual BOOLEAN DEFAULT FALSE,
    marked_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (marked_by) REFERENCES users(user_id) ON DELETE SET NULL,
    UNIQUE KEY unique_emp_date (employee_id, date),
    INDEX idx_org_date (organization_id, date),
    INDEX idx_emp_date (employee_id, date),
    INDEX idx_status (status)
) ENGINE=InnoDB;

CREATE TABLE attendance_regularization (
    regularization_id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    employee_id INT NOT NULL,
    attendance_id INT,
    date DATE NOT NULL,
    requested_clock_in DATETIME,
    requested_clock_out DATETIME,
    reason TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approved_by INT,
    approved_at DATETIME,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (attendance_id) REFERENCES attendance(attendance_id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_org_status (organization_id, status),
    INDEX idx_emp_status (employee_id, status)
) ENGINE=InnoDB;

-- ============================================
-- TIMESHEET MODULE
-- ============================================

CREATE TABLE projects (
    project_id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    project_name VARCHAR(200) NOT NULL,
    project_code VARCHAR(50),
    client_name VARCHAR(200),
    description TEXT,
    start_date DATE,
    end_date DATE,
    status ENUM('active', 'completed', 'on_hold', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) ON DELETE CASCADE,
    INDEX idx_org_status (organization_id, status)
) ENGINE=InnoDB;

CREATE TABLE tasks (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    project_id INT NOT NULL,
    task_name VARCHAR(200) NOT NULL,
    description TEXT,
    assigned_to INT,
    estimated_hours DECIMAL(6,2),
    status ENUM('open', 'in_progress', 'completed', 'cancelled') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES employees(employee_id) ON DELETE SET NULL,
    INDEX idx_org_project (organization_id, project_id),
    INDEX idx_assigned (assigned_to, status)
) ENGINE=InnoDB;

CREATE TABLE timesheets (
    timesheet_id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    employee_id INT NOT NULL,
    date DATE NOT NULL,
    project_id INT,
    task_id INT,
    hours_worked DECIMAL(4,2) NOT NULL,
    description TEXT,
    is_billable BOOLEAN DEFAULT FALSE,
    status ENUM('draft', 'submitted', 'approved', 'rejected') DEFAULT 'draft',
    submitted_at DATETIME,
    approved_by INT,
    approved_at DATETIME,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE SET NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_org_date (organization_id, date),
    INDEX idx_emp_date (employee_id, date),
    INDEX idx_project (project_id),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- ============================================
-- PAYROLL MODULE
-- ============================================

CREATE TABLE salary_structures (
    salary_structure_id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    employee_id INT NOT NULL,
    basic_salary DECIMAL(10,2) NOT NULL,
    allowances JSON,
    deductions JSON,
    gross_salary DECIMAL(10,2) NOT NULL,
    net_salary DECIMAL(10,2) NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    INDEX idx_org_emp (organization_id, employee_id),
    INDEX idx_active (is_active)
) ENGINE=InnoDB;

CREATE TABLE payroll (
    payroll_id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    employee_id INT NOT NULL,
    salary_structure_id INT NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    working_days INT NOT NULL,
    present_days DECIMAL(4,1) NOT NULL,
    leave_days DECIMAL(4,1) DEFAULT 0,
    basic_salary DECIMAL(10,2) NOT NULL,
    allowances JSON,
    deductions JSON,
    gross_salary DECIMAL(10,2) NOT NULL,
    net_salary DECIMAL(10,2) NOT NULL,
    payment_date DATE,
    payment_status ENUM('pending', 'processed', 'paid') DEFAULT 'pending',
    payment_method VARCHAR(50),
    transaction_reference VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (salary_structure_id) REFERENCES salary_structures(salary_structure_id),
    UNIQUE KEY unique_emp_month_year (employee_id, month, year),
    INDEX idx_org_month_year (organization_id, year, month),
    INDEX idx_status (payment_status)
) ENGINE=InnoDB;

CREATE TABLE payslips (
    payslip_id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    payroll_id INT NOT NULL,
    employee_id INT NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    payslip_pdf_url VARCHAR(500),
    generated_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) ON DELETE CASCADE,
    FOREIGN KEY (payroll_id) REFERENCES payroll(payroll_id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    INDEX idx_org_emp (organization_id, employee_id),
    INDEX idx_emp_month_year (employee_id, year, month)
) ENGINE=InnoDB;

-- ============================================
-- LEAVE MANAGEMENT (ESS)
-- ============================================

CREATE TABLE leave_types (
    leave_type_id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    leave_type_name VARCHAR(100) NOT NULL,
    days_allowed_per_year INT NOT NULL,
    carry_forward_allowed BOOLEAN DEFAULT FALSE,
    max_carry_forward_days INT DEFAULT 0,
    requires_approval BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) ON DELETE CASCADE,
    INDEX idx_org_leave_type (organization_id)
) ENGINE=InnoDB;

CREATE TABLE leave_balances (
    balance_id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    employee_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    year INT NOT NULL,
    total_days DECIMAL(4,1) NOT NULL,
    used_days DECIMAL(4,1) DEFAULT 0,
    remaining_days DECIMAL(4,1) NOT NULL,
    carried_forward_days DECIMAL(4,1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(leave_type_id) ON DELETE CASCADE,
    UNIQUE KEY unique_emp_leave_year (employee_id, leave_type_id, year),
    INDEX idx_org_emp (organization_id, employee_id)
) ENGINE=InnoDB;

CREATE TABLE leave_applications (
    leave_application_id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    employee_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(4,1) NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
    approved_by INT,
    approved_at DATETIME,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(leave_type_id),
    FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_org_status (organization_id, status),
    INDEX idx_emp_status (employee_id, status),
    INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB;

-- ============================================
-- NOTIFICATIONS MODULE
-- ============================================

CREATE TABLE notification_templates (
    template_id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    template_name VARCHAR(100) NOT NULL,
    template_type ENUM('email', 'sms', 'push', 'in_app') NOT NULL,
    subject VARCHAR(255),
    body TEXT NOT NULL,
    variables JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) ON DELETE CASCADE,
    INDEX idx_org_type (organization_id, template_type)
) ENGINE=InnoDB;

CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('announcement', 'alert', 'reminder', 'approval', 'info') DEFAULT 'info',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME,
    link_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, is_read),
    INDEX idx_created (created_at DESC)
) ENGINE=InnoDB;

CREATE TABLE notification_preferences (
    preference_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    push_enabled BOOLEAN DEFAULT TRUE,
    notification_types JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_pref (user_id)
) ENGINE=InnoDB;

-- ============================================
-- DOCUMENTS & ANNOUNCEMENTS
-- ============================================

CREATE TABLE documents (
    document_id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    employee_id INT NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    uploaded_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(user_id),
    INDEX idx_org_emp (organization_id, employee_id),
    INDEX idx_type (document_type)
) ENGINE=InnoDB;

CREATE TABLE announcements (
    announcement_id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    target_audience ENUM('all', 'department', 'team', 'individual') DEFAULT 'all',
    target_ids JSON,
    published_by INT NOT NULL,
    published_at DATETIME,
    expires_at DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) ON DELETE CASCADE,
    FOREIGN KEY (published_by) REFERENCES users(user_id),
    INDEX idx_org_active (organization_id, is_active),
    INDEX idx_published (published_at DESC)
) ENGINE=InnoDB;

-- ============================================
-- AUDIT & LOGS
-- ============================================

CREATE TABLE audit_logs (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_org_created (organization_id, created_at DESC),
    INDEX idx_user_action (user_id, action),
    INDEX idx_entity (entity_type, entity_id)
) ENGINE=InnoDB;

-- ============================================
-- HOLIDAYS
-- ============================================

CREATE TABLE holidays (
    holiday_id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id INT NOT NULL,
    holiday_name VARCHAR(200) NOT NULL,
    holiday_date DATE NOT NULL,
    is_optional BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) ON DELETE CASCADE,
    INDEX idx_org_date (organization_id, holiday_date)
) ENGINE=InnoDB;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample organization
INSERT INTO organizations (organization_name, subdomain, subscription_plan, subscription_status) 
VALUES ('Demo Company', 'demo', 'premium', 'active');

-- Insert default roles
INSERT INTO roles (organization_id, role_name, role_type, permissions) VALUES
(1, 'Super Admin', 'super_admin', '{"all": true}'),
(1, 'HR Manager', 'admin', '{"attendance": "full", "payroll": "full", "employees": "full"}'),
(1, 'Team Lead', 'team_lead', '{"attendance": "team", "timesheets": "team", "leave": "team"}'),
(1, 'Employee', 'employee', '{"attendance": "self", "timesheets": "self", "leave": "self"}');

-- ============================================
-- END OF SCHEMA
-- ============================================
