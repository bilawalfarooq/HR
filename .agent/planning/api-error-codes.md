# API Error Codes & Messages Reference

## 🎯 Error Message Design Principles

1. **Distinct & Non-Overlapping**: Each error has a unique message
2. **User-Friendly**: Clear, actionable language
3. **Consistent Status Codes**: Proper HTTP status codes
4. **No Technical Details**: Safe for production use

---

## 📊 Complete Error Catalog

### Authentication Errors (401 Unauthorized)

| Scenario | Status | Error Message | When It Occurs |
|----------|--------|---------------|----------------|
| Missing Token | 401 | "Authentication required. Please provide a valid token." | No Authorization header or malformed header |
| Expired Token | 401 | "Your session has expired. Please log in again." | JWT token has passed expiration time |
| Invalid Token | 401 | "Invalid authentication token. Please log in again." | JWT signature invalid or malformed token |
| Token Not Yet Active | 401 | "Token not yet active." | Token's `nbf` (not before) claim is in the future |
| User Not Found | 401 | "User account not found or has been deactivated. Please contact support." | User deleted or deactivated after token was issued |
| Invalid Credentials | 401 | "Invalid email or password." | Login with wrong email or password |
| Incorrect Password | 401 | "Incorrect current password." | Wrong current password when changing password |
| Inactive User | 401 | "User not found or inactive." | User account is deactivated |

### Authorization Errors (403 Forbidden)

| Scenario | Status | Error Message | When It Occurs |
|----------|--------|---------------|----------------|
| Insufficient Role | 403 | "You do not have permission to access this resource." | User's role not in allowed roles list |
| Insufficient Permission | 403 | "You do not have permission to {action} {resource}." | User lacks specific permission for resource |
| Suspended Organization | 403 | "Organization account is suspended or cancelled." | Organization subscription is inactive |

### Validation Errors (400 Bad Request / 422 Unprocessable Entity)

| Scenario | Status | Error Message | When It Occurs |
|----------|--------|---------------|----------------|
| Missing Required Field | 422 | "Validation Error" with field-specific errors | Required fields missing from request |
| Invalid Email Format | 422 | "Validation Error" with "Invalid email address" | Email doesn't match email pattern |
| Password Too Short | 422 | "Validation Error" with "Password must be at least 8 characters" | Password < 8 characters |
| Invalid Password Format | 422 | "Validation Error" with password requirements | Password missing uppercase/lowercase/number |
| Invalid Subdomain Format | 422 | "Validation Error" with subdomain rules | Subdomain contains invalid characters |
| Missing Refresh Token | 400 | "Refresh token required." | Refresh token not provided in request |

### Resource Errors (404 Not Found)

| Scenario | Status | Error Message | When It Occurs |
|----------|--------|---------------|----------------|
| Organization Not Found | 404 | "Organization not found." | Invalid organization subdomain |
| User Not Found | 404 | "User not found." | Invalid user ID |
| Employee Not Found | 404 | "Employee not found." | Invalid employee ID |
| Route Not Found | 404 | "Route {route} not found." | Invalid API endpoint |

### Conflict Errors (409 Conflict)

| Scenario | Status | Error Message | When It Occurs |
|----------|--------|---------------|----------------|
| Duplicate Subdomain | 409 | "Subdomain already taken." | Attempting to register with existing subdomain |
| Duplicate Email | 409 | "This record already exists. Please use different values." | Email already registered |
| Duplicate Resource | 409 | "This record already exists. Please use different values." | Any unique constraint violation |

### Server Errors (500 Internal Server Error)

| Scenario | Status | Error Message | When It Occurs |
|----------|--------|---------------|----------------|
| Unknown Error | 500 | "Something went wrong. Please try again later." | Unexpected server error |
| Database Error | 500 | "A database error occurred. Please try again later." | Database connection or query error |
| Database Connection Error | 500 | "Unable to connect to the database. Please try again later." | Cannot connect to database |

---

## 🔍 Error Response Format

### Standard Error Response
```json
{
  "success": false,
  "message": "User-friendly error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

### Success Response (for reference)
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

---

## 📝 Real-World Examples

### Example 1: Login with Invalid Credentials

**Request:**
```http
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "wrongpassword"
}
```

**Response:**
```json
{
  "success": false,
  "message": "Invalid email or password."
}
```

**Status Code:** 401  
**Frontend Action:** Show error toast, keep on login page

---

### Example 2: Expired Session During API Call

**Request:**
```http
GET /api/v1/employees
Authorization: Bearer <expired_token>
```

**Response:**
```json
{
  "success": false,
  "message": "Your session has expired. Please log in again."
}
```

**Status Code:** 401  
**Frontend Action:** Clear tokens, redirect to login, show toast

---

### Example 3: Insufficient Permissions

**Request:**
```http
DELETE /api/v1/employees/123
Authorization: Bearer <valid_token_without_delete_permission>
```

**Response:**
```json
{
  "success": false,
  "message": "You do not have permission to delete employees."
}
```

**Status Code:** 403  
**Frontend Action:** Show error toast, stay on current page

---

### Example 4: Validation Error (Registration)

**Request:**
```http
POST /api/v1/auth/register
{
  "organization_name": "Test",
  "subdomain": "test!@#",  // Invalid characters
  "admin_email": "invalid-email",  // Invalid format
  "admin_password": "123"  // Too short
}
```

**Response:**
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    {
      "field": "subdomain",
      "message": "Subdomain must contain only lowercase letters, numbers, and hyphens"
    },
    {
      "field": "admin_email",
      "message": "Invalid email address"
    },
    {
      "field": "admin_password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

**Status Code:** 422  
**Frontend Action:** Show validation errors under each field

---

### Example 5: Duplicate Subdomain

**Request:**
```http
POST /api/v1/auth/register
{
  "subdomain": "existing-company",  // Already exists
  ...
}
```

**Response:**
```json
{
  "success": false,
  "message": "Subdomain already taken."
}
```

**Status Code:** 409  
**Frontend Action:** Show error toast, highlight subdomain field

---

### Example 6: Organization Not Found

**Request:**
```http
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password123",
  "organization_subdomain": "nonexistent-org"
}
```

**Response:**
```json
{
  "success": false,
  "message": "Organization not found."
}
```

**Status Code:** 404  
**Frontend Action:** Show error toast, suggest removing subdomain

---

## 🎨 Frontend Error Handling

### How Frontend Should Handle Each Status Code

#### 401 Unauthorized
```javascript
if (error.statusCode === 401) {
  // Session expired or invalid credentials
  if (error.message.includes('expired')) {
    // Clear tokens and redirect to login
    logout();
    navigate('/login');
    showError('Your session has expired. Please log in again.');
  } else {
    // Show error in place (login form, etc.)
    showError(error.message);
  }
}
```

#### 403 Forbidden
```javascript
if (error.statusCode === 403) {
  // Insufficient permissions - stay on page, show error
  showError(error.message);
}
```

#### 404 Not Found
```javascript
if (error.statusCode === 404) {
  // Resource not found
  showError(error.message);
  // Optionally navigate to 404 page or back
}
```

#### 409 Conflict
```javascript
if (error.statusCode === 409) {
  // Duplicate resource - show error on form
  showError(error.message);
  // Highlight conflicting field
}
```

#### 422 Validation Error
```javascript
if (error.statusCode === 422) {
  // Show field-specific errors
  error.errors.forEach(err => {
    setFieldError(err.field, err.message);
  });
  showError('Please fix the validation errors.');
}
```

#### 500 Server Error
```javascript
if (error.statusCode === 500) {
  // Generic server error
  showError(error.message);
  // Optionally report to error tracking service
}
```

---

## 🛡️ Security Considerations

### What's NEVER Exposed

- ❌ Stack traces
- ❌ Database error details
- ❌ File paths
- ❌ Environment variables
- ❌ Library versions
- ❌ SQL queries
- ❌ Internal server structure

### What's ALWAYS Logged Server-Side

- ✅ Full error stack trace
- ✅ Request details (URL, method, body)
- ✅ User information
- ✅ Timestamp
- ✅ Error type and name

---

## 📋 HTTP Status Code Guide

| Code | Meaning | Use Case |
|------|---------|----------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Malformed request |
| 401 | Unauthorized | Authentication required or failed |
| 403 | Forbidden | Authenticated but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource (unique constraint) |
| 422 | Unprocessable Entity | Validation error |
| 500 | Internal Server Error | Unknown server error |
| 503 | Service Unavailable | Server temporarily down |

---

## ✅ Implementation Checklist

- [x] All authentication errors have distinct messages
- [x] All authorization errors are clear and specific
- [x] Validation errors include field-specific details
- [x] No technical details in production responses
- [x] Proper HTTP status codes for each scenario
- [x] Frontend can differentiate between error types
- [x] Error messages are actionable
- [x] All errors logged server-side
- [x] Documentation complete

---

**Last Updated:** December 6, 2025  
**Version:** 1.0  
**Status:** ✅ Production Ready
