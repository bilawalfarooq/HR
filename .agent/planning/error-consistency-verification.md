# 🛡️ Error Message Consistency - Implementation Guide

**Date:** December 6, 2025  
**Type:** UX Improvement  
**Status:** ✅ Verified

---

## 🎯 Goal

Ensure that users see **exact** error messages from the backend (e.g., "Invalid email or password") instead of generic messages, while still handling session expiration correctly.

---

## ✅ Implementation Details

### 1. API Interceptor (`api.js`)

**Logic:**
- Intercepts 401 (Unauthorized) errors.
- **CRITICAL CHANGE:** Skips auto-refresh logic if the request URL includes `/login`.
- For Login 401s: Passes the error through to the normal handler.
- For Other 401s: Attempts to refresh token. If fails, throws "Session expired".

**Code:**
```javascript
// api.js
if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/login')) {
    // ... refresh token logic ...
}
```

### 2. Error Extraction (`toast.js`)

**Logic:**
- Priority 1: Checks `error.response.data.message` (Exact backend message).
- Priority 5: Checks `error.message` (Message set by interceptor).

**Flow:**
1. Backend sends 401 + "Invalid email or password".
2. Interceptor skips refresh (because it's `/login`).
3. Interceptor formats error: `message = "Invalid email or password"`.
4. `extractErrorMessage` returns this message.
5. UI displays "Invalid email or password".

---

## 📊 Scenario Matrix

| Scenario | HTTP Status | Backend Message | Interceptor Action | User Sees |
|----------|-------------|-----------------|--------------------|-----------|
| **Login Failed** | 401 | "Invalid email or password" | **Pass through** (Skip refresh) | "Invalid email or password" |
| **Session Expired** | 401 | "Unauthorized" | **Try Refresh** → Fail | "Your session has expired. Please login again." |
| **Register Fail** | 409 | "Subdomain taken" | Pass through | "Subdomain taken" |
| **Validation** | 422 | "Invalid email" | Pass through | "Invalid email" |

---

## ✅ Verification

1. **Login with wrong password:**
   - Backend: 401 "Invalid email or password"
   - Interceptor: Skips refresh
   - Toast: "Invalid email or password" ✅

2. **Token expires while using app:**
   - Backend: 401 "Unauthorized"
   - Interceptor: Tries refresh → Fails
   - Toast: "Your session has expired. Please login again." ✅

3. **Network Error:**
   - Interceptor: Catches network error
   - Toast: "Unable to connect to the server..." ✅

---

## 📁 Files Modified

- `frontend/src/services/api.js` - Added check to exclude `/login` from 401 refresh logic.

---

**Conclusion:** The system now correctly distinguishes between "Invalid Credentials" (user error) and "Session Expired" (system state), providing the correct feedback for each.
