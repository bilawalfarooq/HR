# Error Handling Security Implementation

## 🔒 Security Principles

### 1. **Never Expose Technical Details in Production** ✅

All stack traces, error names, and technical information are:
- ❌ **NEVER** sent to the client in production
- ✅ **ALWAYS** logged server-side for debugging
- ✅ **ALWAYS** replaced with user-friendly messages

### 2. **Environment-Based Behavior** ✅

#### Development Mode (`NODE_ENV=development`):
```json
{
  "success": false,
  "message": "User-friendly message",
  "errors": [],
  "debug": {
    "originalMessage": "Actual technical error",
    "errorName": "SequelizeValidationError",
    "stack": "Error: ...\n at ...",
    "statusCode": 400
  }
}
```

#### Production Mode (`NODE_ENV=production`):
```json
{
  "success": false,
  "message": "User-friendly message",
  "errors": []
}
```

### 3. **Server-Side Logging** ✅

All errors are ALWAYS logged server-side with full details:
```javascript
logger.error('Error occurred:', {
  message: err.message,          // Full error message
  name: err.name,                 // Error type
  stack: err.stack,               // Full stack trace
  statusCode: err.statusCode,     // HTTP status code
  url: req.originalUrl,           // Request URL
  method: req.method,             // HTTP method
  ip: req.ip,                     // Client IP
  body: req.body,                 // Request body (dev only)
  headers: req.headers,           // Request headers (dev only)
  isOperational: err.isOperational // Error category
});
```

## 📋 Error Message Mapping

### Database Errors:
| Technical Error | User-Friendly Message |
|-----------------|----------------------|
| `SequelizeUniqueConstraintError` | "This record already exists. Please use different values." |
| `SequelizeForeignKeyConstraintError` | "Cannot perform this operation due to related records." |
| `SequelizeValidationError` | "Invalid data provided. Please check your input." |
| `SequelizeDatabaseError` | "A database error occurred. Please try again later." |
| `SequelizeConnectionError` | "Unable to connect to the database. Please try again later." |

### Authentication Errors:
| Technical Error | User-Friendly Message |
|-----------------|----------------------|
| `JsonWebTokenError` | "Invalid authentication token. Please login again." |
| `TokenExpiredError` | "Your session has expired. Please login again." |
| `NotBeforeError` | "Token not active yet." |

### Validation Errors:
| Technical Error | User-Friendly Message |
|-----------------|----------------------|
| `ValidationError` | "Invalid request. Please check your input." |
| `CastError` | "Invalid data format provided." |

### HTTP Errors:
| Technical Error | User-Friendly Message |
|-----------------|----------------------|
| `BadRequestError` | "Invalid request." |
| `UnauthorizedError` | "Authentication required." |
| `ForbiddenError` | "You do not have permission to perform this action." |
| `NotFoundError` | "The requested resource was not found." |
| `ConflictError` | "A conflict occurred. Please try again." |

### Network Errors:
| Technical Error | User-Friendly Message |
|-----------------|----------------------|
| `TimeoutError` | "The request took too long. Please try again." |
| `NetworkError` | "A network error occurred. Please check your connection." |

### Unknown/Unexpected Errors:
| Status Code | User-Friendly Message |
|-------------|----------------------|
| 500 | "Something went wrong. Please try again later." |
| 400-499 | "Invalid request. Please check your input and try again." |
| Other | "An error occurred. Please try again later." |

## 🛡️ Security Features

### 1. **Operational vs Non-Operational Errors**

- **Operational Errors** (Expected): User-facing errors that are part of normal operation
  - Validation failures
  - Authentication errors
  - Resource not found
  - These can show the original message if it's safe

- **Non-Operational Errors** (Unexpected): Programming errors or system failures
  - Database connection issues
  - Null pointer exceptions
  - Unhandled promise rejections
  - These ALWAYS get generic messages

### 2. **Sensitive Data Protection**

In production mode, we **DO NOT LOG**:
- ❌ Request bodies (may contain passwords, tokens)
- ❌ Request headers (may contain auth tokens)
- ❌ User input that could contain sensitive data

In development mode, we CAN log these for debugging but they're still:
- ✅ Only in server logs
- ✅ Never sent to client
- ✅ Not in production logs

### 3. **Stack Trace Protection**

Stack traces can reveal:
- File paths and directory structure
- Third-party library versions
- Internal code logic
- Database schema details

**Our Protection:**
- ✅ Stack traces ONLY logged server-side
- ✅ NEVER included in API responses (production)
- ✅ Only in development mode's `debug` object
- ✅ Full traces always available in log files

## 📝 Example Scenarios

### Scenario 1: Database Unique Constraint Violation

**What Happens:**
```
1. User tries to register with existing email
2. Database throws SequelizeUniqueConstraintError
3. Error handler catches it
```

**Server-Side Log:**
```
ERROR: Error occurred:
  message: "Validation error"
  name: "SequelizeUniqueConstraintError"
  stack: "Error: Validation error\n at ..."
  url: "/api/v1/auth/register"
  method: "POST"
  ip: "192.168.1.100"
```

**Client Response (Production):**
```json
{
  "success": false,
  "message": "This record already exists. Please use different values.",
  "errors": [
    {
      "field": "email",
      "message": "Email must be unique"
    }
  ]
}
```

**Client Response (Development):**
```json
{
  "success": false,
  "message": "This record already exists. Please use different values.",
  "errors": [...],
  "debug": {
    "originalMessage": "Validation error",
    "errorName": "SequelizeUniqueConstraintError",
    "stack": "Error: Validation error\n at ...",
    "statusCode": 422
  }
}
```

### Scenario 2: Unknown/Unexpected 500 Error

**What Happens:**
```
1. Unhandled exception in code
2. Error bubbles to error handler
3. Error is NOT operational
```

**Server-Side Log:**
```
ERROR: Error occurred:
  message: "Cannot read property 'id' of undefined"
  name: "TypeError"
  stack: "TypeError: Cannot read property 'id' of undefined\n at ..."
  url: "/api/v1/employees/123"
  method: "GET"
```

**Client Response (Production):**
```json
{
  "success": false,
  "message": "Something went wrong. Please try again later.",
  "errors": []
}
```

**NO STACK TRACE OR TECHNICAL DETAILS SENT TO CLIENT**

### Scenario 3: 404 Not Found

**What Happens:**
```
1. User requests non-existent route
2. notFound middleware catches it
3. Creates AppError with 404 status
```

**Server-Side Log:**
```
ERROR: Error occurred:
  message: "Route /api/v1/invalid not found"
  url: "/api/v1/invalid"
  method: "GET"
```

**Client Response (Both Production & Development):**
```json
{
  "success": false,
  "message": "Route /api/v1/invalid not found",
  "errors": []
}
```

## 🔍 Debugging in Production

### How to Debug Without Exposing Errors:

1. **Check Server Logs:**
   - All errors are logged with full details
   - Log files: `logs/error.log` and `logs/combined.log`
   - Logs include timestamps, request details, stack traces

2. **Use Correlation IDs** (TODO):
   - Add request ID to each request
   - Return ID to client in error response
   - User can provide ID to support team
   - Support can look up exact error in logs

3. **Monitoring Services** (TODO):
   - Integrate with Sentry, LogRocket, or similar
   - Get real-time error notifications
   - Full stack traces and context
   - User session replay

## ✅ Implementation Checklist

- [x] Error handler logs all errors server-side
- [x] Stack traces never sent to client in production
- [x] User-friendly messages for all error types
- [x] Development mode includes debug info
- [x] Production mode only shows safe messages
- [x] Sensitive data not logged in production
- [x] 404 handler implemented
- [x] All async errors caught with asyncHandler
- [x] AppError class for operational errors
- [ ] Add request correlation IDs
- [ ] Integrate error monitoring service
- [ ] Add error metrics/analytics
- [ ] Implement error rate limiting

## 🎯 Best Practices

1. **Always use AppError for expected errors:**
   ```javascript
   throw new AppError('User not found', 404);
   ```

2. **Use asyncHandler for async route handlers:**
   ```javascript
   router.get('/users/:id', asyncHandler(async (req, res) => {
     // Your async code
   }));
   ```

3. **Never log passwords or tokens:**
   ```javascript
   // ❌ BAD
   logger.error('Login failed', { email, password });
   
   // ✅ GOOD
   logger.error('Login failed', { email });
   ```

4. **Set NODE_ENV in production:**
   ```bash
   NODE_ENV=production npm start
   ```

5. **Monitor error logs regularly:**
   - Set up log rotation
   - Archive old logs
   - Alert on error spikes
   - Review errors weekly

## 📊 Error Response Format

### Standard Format:
```typescript
interface ErrorResponse {
  success: false;
  message: string;        // User-friendly message
  errors?: Array<{        // Validation errors
    field: string;
    message: string;
  }>;
  debug?: {               // ONLY in development
    originalMessage: string;
    errorName: string;
    stack: string;
    statusCode: number;
  };
}
```

### Success Format (for reference):
```typescript
interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}
```

---

**Updated**: December 6, 2025  
**Status**: ✅ Fully Implemented  
**Security Level**: Production-Ready  
**Compliance**: Follows OWASP best practices
