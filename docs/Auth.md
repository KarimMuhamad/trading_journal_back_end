# Trading Journal API Documentation
Backend: Node.js + Express + Prisma  
Auth: JWT (Access & Refresh Tokens)  
Format: JSON  
Version: 1.0.0
Base URL: `/api.domain/v1`
---

## Authentication

### Register User
- Method : `POST`
- Endpoint : `/auth/register`
- Request Body
```json
{
  "username": "karimfx",
  "email": "karim@example.com",
  "password": "StrongPass!23"
}
```
- Response 201
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
- Response 409
```json
{
  "status": "error",
  "message": "Username or email already exists."
}
```
- Response 400
```json
{
  "status": "error",
  "message": "Validation error"
}
```
---

### Login User
- Method : `POST`
- Endpoint : `/auth/login`
- Request Body
```json
{
  "email": "karim@example.com",
  "password": "StrongPass!23"
}
```
- Response 200
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
- Response 401
```json
{
  "status": "error",
  "message": "Invalid email or password."
}
```
- Response 400
```json
{
  "status": "error",
  "message": "Validation error"
}
```
- Cookie
```json
{
  "refreshToken": "<refreshToken>",
  "httpOnly": true,
  "secure": true,
  "sameSite": "Strict",
  "path": "/auth/refresh",
  "Max-Age": 2592000 // 1 Month
}
```
---

### Logout User
- Method : `DELETE`
- Endpoint : `/auth/logout`
- Authorization : `Bearer <accessToken>`
- Response 200
```json
{
  "status": "success",
  "message": "Logout successful."
}
```
- Cookie
```json
{
  "refreshToken": "",
  "maxAge": 0
}
```
---

### Refresh Access Token
- Method : `POST`
- Endpoint : `/auth/refresh`
- Cookie
```json
{
  "refreshToken": "<refreshToken>"
}
```
- Response 200
```json
{
  "status": "success",
  "message": "Access token refreshed successfully.",
  "data" : {
    ""id": 1,
    "username": "karimfx",
    "email": "karim@example.com",
    "isVerified": false"
  },
  "accessToken": "<newAccessToken>"
}
```
- Response 401
```json
{
  "status": "error",
  "message": "Invalid or expired refresh token."
}
```
- Cookie
```json
{
  "refreshToken": "",
  "maxAge": 0
}
```
---

### Verify Email Send Link
- Method : `POST`
- Endpoint : `/auth/email/verify/send`
- Authorization : `Bearer <accessToken>`
- Response 200
```json
{
  "status": "success",
  "message": "Verification email sent successfully. Please check your email."
}
```
- Response 400
```json
{
  "status": "error",
  "message": "User already verified."
}
```
- Response 429
```json
{
  "status": "error",
  "message": "Too many requests. Please try again later."
}
```
- Response 401
```json
{
  "status": "error",
  "message": "Invalid or expired access token."
}
```

### Verify Email
- Method : `GET`
- Endpoint : `/auth/email/verify`
- Request Body
```json
{
  "email": "karim@example.com",
  "token": "<token>"
}
```
- Response 200
```json
{
  "status": "success",
  "message": "Email verified successfully."
}
```
- Response 400
```json
{
  "status": "error",
  "message": "Invalid or expired token."
}
```
- Response 404
```json
{
  "message": "User not found."
}
```
- Response 401
```json
{
  "status": "error",
  "message": "Invalid or expired access token."
}
```
---

### Reset Password via Profile Page
- Method : `PATCH`
- Endpoint : `/auth/changePassword`
- Authorization : `Bearer <accessToken>`
- Request Body
```json
{
  "currentPassword": "StrongPass!23",
  "newPassword": "NewStrongPass!45"
}
```
- Response 200
```json
{
  "status": "success",
  "message": "Password changed successfully."
}
```
- Cookie
```json
{
  "refreshToken": "",
  "maxAge": 0
}
```
- Response 400
```json
{
  "status": "error",
  "message": "Current password is incorrect."
}
```
- Response 401
```json
{
  "status": "error",
  "message": "Invalid or expired access token."
}
```
---

### Forgot Password
- Method : `POST`
- Endpoint : `/auth/forgotPassword`
- Request Body
```json
{
  "email": "karim@example.com"
}
```
- Response 200
```json
{
  "status": "success",
  "message": "Please Check your email for reset password link."
}
```
- Response 404
```json
{
  "status": "error",
  "message": "User not found."
}
```
- Response 429
```json
{
  "status": "error",
  "message": "Too many requests. Please try again later."
}
```

### Rest Password Using Link in Email
- Method : `POST`
- Endpoint : `/auth/forgotPassword?token=<token>`
- Request Body
```json
{
  "token": "<token>"
}
```
- Response 200
```json
{
  "status": "success",
  "message": "Password Reset Succesfuly"
}
```
- Response 404
```json
{
  "status": "error",
  "message": "User not found."
}
- Response 401
```json
{
  "status": "error",
  "message": "Invalid or expired token."
}
```
- Response 429
```json
{
  "status": "error",
  "message": "Too many requests. Please try again later."
}
```
---

### Delete Account
- Method : `DELETE`
- Endpoint : `/auth/deleteAccount/:userId`
- Authorization : `Bearer <accessToken>`
- Request body
```json
{
  "password": "StrongPass!23"
}
```
- Response 200
```json
{
  "status": "success",
  "message": "Account deleted successfully."
}
```
- Response 401
```json
{
  "status": "error",
  "message": "Invalid or expired access token."
}
```