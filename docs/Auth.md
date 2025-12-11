# Trading Journal API Documentation
## Authentication
Backend: Node.js + Express + Prisma  
Auth: JWT (Access & Refresh Tokens)  
Format: JSON  
Version: 1.0.0
Base URL: `/api.domain/v1`
---

# Table of Contents
1. [Register User](#1-register-user)
2. [Login User](#2-login-user)
3. [Logout User](#3-logout-user)
4. [Refresh Access Token](#4-refresh-access-token)
5. [Send Email Verification Link](#5-send-email-verification-link)
6. [Verify Email](#6-verify-email)
7. [Change Password (Profile)](#7-change-password-profile)
8. [Forgot Password](#8-forgot-password)
9. [Reset Password Using Email Link](#9-reset-password-using-email-link)
10. [Recover Account](#10-recover-account)

---
## 1. Register User
- Method: `POST`
- Endpoint: `/auth/register`

**Request Body**
```json
{
  "username": "karimfx",
  "email": "karim@example.com",
  "password": "StrongPass!23"
}
```
**Response 201 — Success**
```json
{
  "status": "success",
  "message": "User registered successfully. Please verify your email.",
  "data": {
    "username" : "karimfx",
    "email" : "karim@example.com",
    "isVerified" : false
  }
}
```
**Response 409 — Conflict (Username exists)**
```json
{
  "status": "error",
  "message": "Username already exists",
  "code": "USERNAME_EXISTS"
}
```
**Response 409 — Conflict (Email exists)**
```json
{
  "status": "error",
  "message": "Email already exists",
  "code": "EMAIL_EXISTS"
}
```

**Response 400 — Validation Error**
```json
{
  "status": "error",
  "message": "Validation error",
  "errors": [
    { "field": "username", "message": "Username is required" },
    { "field": "email", "message": "Email is invalid" },
    { "field": "password", "message": "Password must meet complexity requirements" }
  ]
}
```
---

## 2. Login User
- Method: `POST`
- Endpoint: `/auth/login`

**Request Body**
```json
{
  "identifier": "karim@example.com",
  "password": "StrongPass!23"
}
```
Notes
- `identifier` accepts either email or username.

**Response 200 — Success**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "id": 1,
    "username": "karimfx",
    "email": "karim@example.com",
    "isVerified": false
  },
  "accessToken": "<accessToken>"
}
```
**Set-Cookie**
```json
{
  "refreshToken": "<refreshToken>",
  "httpOnly": true,
  "secure": true,
  "sameSite": "Strict",
  "path": "/auth/refresh",
  "Max-Age": 2592000
}
```
**Response 200 — Recovery Needed**
```json
{
  "status": "RECOVERY_NEEDED",
  "message": "Account recovery needed. Your account has been scheduled for deletion.",
  "recovery_period": 300000,
  "token": "<token>"
}
```

**Response 401 — Invalid Credentials**
```json
{
  "status": "error",
  "message": "Invalid email/username or password",
  "code": "AUTH_INVALID_CREDENTIALS"
}
```
**Response 400 — Validation Error**
```json
{
  "status": "error",
  "message": "Validation error",
  "errors": [
    { "field": "identifier", "message": "Identifier is required" },
    { "field": "password", "message": "Password is required" }
  ]
}
```
---

## 3. Logout User
- Method: `DELETE`
- Endpoint: `/auth/logout`
- Authorization: `Bearer <accessToken>`

**Response 200 — Success**
```json
{
  "status": "success",
  "message": "Logout successful."
}
```
**Clear Cookie**
```json
{
  "refreshToken": "",
  "maxAge": 0
}
```
**Response 401 — Unauthorized**
```json
{
  "status": "error",
  "message": "Unauthorized",
  "code": "AUTH_UNAUTHORIZED"
}
```
---

## 4. Refresh Access Token
- Method: `POST`
- Endpoint: `/auth/refresh`

**Cookie**
```json
{
  "refreshToken": "<refreshToken>"
}
```
**Response 200 — Success**
```json
{
  "status": "success",
  "message": "Access token refreshed successfully.",
  "data" : {
    "id": 1,
    "username": "karimfx",
    "email": "karim@example.com",
    "isVerified": false
  },
  "accessToken": "<newAccessToken>"
}
```
**Response 401 — Invalid or Expired Refresh Token**
```json
{
  "status": "error",
  "message": "Invalid or expired refresh token",
  "code": "AUTH_REFRESH_TOKEN_INVALID"
}
```
**Clear Cookie**
```json
{
  "refreshToken": "",
  "maxAge": 0
}
```
---

## 5. Send Email Verification Link
- Method: `POST`
- Endpoint: `/auth/email/verify/send`
- Authorization: `Bearer <accessToken>`

**Response 200 — Success**
```json
{
  "status": "success",
  "message": "Verification email sent successfully. Please check your email."
}
```
**Response 400 — Already Verified**
```json
{
  "status": "error",
  "message": "User already verified",
  "code": "USER_ALREADY_VERIFIED"
}
```
**Response 429 — Too Many Requests**
```json
{
  "status": "error",
  "message": "Too many requests. Please try again later.",
  "code": "RATE_LIMIT_EXCEEDED"
}
```
**Response 401 — Unauthorized**
```json
{
  "status": "error",
  "message": "Unauthorized",
  "code": "AUTH_UNAUTHORIZED"
}
```

## 6. Verify Email
- Method: `GET`
- Endpoint: `/auth/email/verify`

**Response 200 — Success**
```json
{
  "status": "success",
  "message": "Email verified successfully."
}
```
**Response 404 — User Not Found**
```json
{
  "status": "error",
  "message": "User not found",
  "code": "USER_NOT_FOUND"
}
```
**Response 401 — Invalid or Expired Link**
```json
{
  "status": "error",
  "message": "Invalid or expired verification link",
  "code": "EMAIL_VERIFICATION_INVALID"
}
```
**Response 409 — Link Already Used**
```json
{
  "status": "error",
  "message": "Verification link already used",
  "code": "EMAIL_VERIFICATION_USED"
}
```
---

## 7. Change Password (Profile)
- Method: `PATCH`
- Endpoint: `/auth/changePassword`
- Authorization: `Bearer <accessToken>`

**Request Body**
```json
{
  "currentPassword": "StrongPass!23",
  "newPassword": "NewStrongPass!45"
}
```
**Response 200 — Success**
```json
{
  "status": "success",
  "message": "Password changed successfully."
}
```
*Note: This action invalidates existing sessions.*

**Clear Cookie**
```json
{
  "refreshToken": "",
  "maxAge": 0
}
```
**Response 400 — Validation error**
```json
{
  "status": "error",
  "message": "Validation error",
  "errors": [
    { "field": "password", "message": "Password must meet complexity requirements" }
  ]
}
```

**Response 401 — Incorrect Current Password**
```json
{
  "status": "error",
  "message": "Invalid current password",
  "code": "PASSWORD_INCORRECT"
}
```
**Response 401 — Unauthorized**
```json
{
  "status": "error",
  "message": "Unauthorized",
  "code": "AUTH_UNAUTHORIZED"
}
```
---

## 8. Forgot Password
- Method: `POST`
- Endpoint: `/auth/forgotPassword`

**Request Body**
```json
{
  "email": "karim@example.com"
}
```
**Response 200 — Success**
```json
{
  "status": "success",
  "message": "Please check your email for the password reset link."
}
```
**Response 404 — User Not Found**
```json
{
  "status": "error",
  "message": "User not found",
  "code": "USER_NOT_FOUND"
}
```
**Response 429 — Too Many Requests**
```json
{
  "status": "error",
  "message": "Too many requests. Please try again later.",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

## 9. Reset Password Using Email Link
- Method: `POST`
- Endpoint: `/forgot-password/reset?token=<token>`

**Request Body**
```json
{
  "token": "<token>",
  "newPassword": "NewStrongPass!45"
}
```
**Response 200 — Success**
```json
{
  "status": "success",
  "message": "Password reset successfully"
}
```
**Response 404 — User Not Found**
```json
{
  "status": "error",
  "message": "User not found",
  "code": "USER_NOT_FOUND"
}
```
**Response 401 — Invalid or Expired Link**
```json
{
  "status": "error",
  "message": "Invalid or expired password reset link",
  "code": "PASSWORD_RESET_INVALID"
}
```
**Response 409 — Link Already Used**
```json
{
  "status": "error",
  "message": "Password reset link already used",
  "code": "PASSWORD_RESET_USED"
}
```

**Response 429 — Too Many Requests**
```json
{
  "status": "error",
  "message": "Too many requests. Please try again later.",
  "code": "RATE_LIMIT_EXCEEDED"
}
```
---

## 10. Recover Account
- Method: `POST`
- Endpoint: `/auth/recovery?token=<token>`

**Response 200 — Success**
```json
{
  "status": "success",
  "message": "Account recovered successfully. Please Log In again"
}
```
**Response 401 — Invalid or Expired Token**
```json
{
  "status": "error",
  "message": "Invalid or expired account recovery token",
  "code": "ACCOUNT_RECOVERY_INVALID"
}
```