# Trading Journal API Documentation
## User Management
Backend: Node.js + Express + Prisma  
Auth: JWT (Access & Refresh Tokens)  
Format: JSON  
Version: 1.0.0
Base URL: `/api.domain/v1`
---

# Table of Contents
1. [Get User Profile](#1-get-user-profile)
2. [Update Username](#2-update-username)
3. [Request OTP to Update Email](#3-request-otp-to-update-email)
4. [Verify OTP and Update Email](#4-verify-otp-and-update-email)
5. [Delete User Account](#5-delete-user-account)
---

## 1. Get User Profile
- Method: `GET`
- Endpoint: `/users/me`
- Authorization: `Bearer <accessToken>`

**Response 200 — Success**
```json
{
  "status" : "success",
  "data" : {
    "id": 123,
    "username": "karimfx",
    "email": "karim@example.com"
  }
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

## 2. Update Username
- Method: `PATCH`
- Endpoint: `/users/me`
- Authorization: `Bearer <accessToken>`

Request Body
```json
{
  "username": "karimfx"
}
```
**Response 200 — Success**
```json
{
  "status": "success",
  "message": "User profile updated successfully.",
  "data" : {
    "id" : 123,
    "username" : "karimfx12",
    "email" : "karim@dev.com"
  }
}
```
**Response 400 — Validation Error**
```json
{
  "status": "error",
  "message": "Validation error",
  "errors": [
    { "field": "username", "message": "Username must be 3–30 characters" }
  ]
}
```
**Response 403 — Username Unchanged**
```json
{
  "status": "error",
  "message": "Username cannot be the same",
  "code": "USERNAME_SAME_FORBIDDEN"
}
```
**Response 409 — Conflict**
```json
{
  "status": "error",
  "message": "Username already exists",
  "code": "USERNAME_EXISTS"
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

## 3. Request OTP to Update Email
- Method: `POST`
- Endpoint: `/users/email/request-otp`
- Authorization: `Bearer <accessToken>`

**Request Body**
```json
{
  "newEmail" : "tjNew@dev.com"
}
```
**Response 200 — Success**
```json
{
  "status": "success",
  "message": "OTP sent successfully"
}
```
**Response 400 — Validation Error**
```json
{
  "status": "error",
  "message": "Validation error",
  "errors": [
    { "field": "newEmail", "message": "Email is invalid" }
  ]
}
```
**Response 409 — Conflict**
```json
{
  "status": "error",
  "message": "Email already exists",
  "code": "EMAIL_EXISTS"
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
---

## 4. Verify OTP and Update Email
- Method: `PATCH`
- Endpoint: `/users/email/verify-otp`
- Authorization: `Bearer <accessToken>`

**Request Body**
```json
{
  "newEmail" : "tjNew@dev.com",
  "otp" : "32418"
}
```
**Response 200 — Success**
```json
{
  "status": "success",
  "message": "Email updated successfully"
}
```
**Response 400 — Validation Error**
```json
{
  "status": "error",
  "message": "Validation error",
  "errors": [
    { "field": "otp", "message": "OTP must be a 5-digit code" }
  ]
}
```
**Response 401 — Invalid or Expired OTP**
```json
{
  "status": "error",
  "message": "Invalid or expired OTP code",
  "code": "OTP_INVALID_OR_EXPIRED"
}
```
**Response 409 — Conflict**
```json
{
  "status": "error",
  "message": "Email already exists",
  "code": "EMAIL_EXISTS"
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

## 5. Delete User Account
- Method: `DELETE`
- Endpoint: `/users/me`
- Authorization: `Bearer <accessToken>`

**Request Body**
```json
{
  "password": "StrongPass!23"
}
```
**Response 200 — Success**
```json
{
  "status": "success",
  "message": "User account deleted successfully."
}
```
**Response 403 — Invalid Password**
```json
{
  "status": "error",
  "message": "Invalid password",
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