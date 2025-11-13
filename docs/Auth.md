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
  "message": "User registered successfully. Please verify your email."
}
```
- Response 400
```json
{
  "message": "Username or email already exists."
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
  "message": "Login successful",
  "accessToken": "<accessToken>",
}
```
- Response 401
```json
{
  "message": "Invalid email or password."
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
  "message": "Access token refreshed successfully.",
  "accessToken": "<newAccessToken>"
}
```
- Response 401
```json
{
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
- Endpoint : `/auth/verify/send`
- Authorization : `Bearer <accessToken>`
- Response 200
```json
{
  "message": "Verification email sent successfully. Please check your email."
}
```
- Response 400
```json
{
  "message": "User already verified."
}
```
- Response 429
```json
{
  "message": "Too many requests. Please try again later."
}
```
- Response 401
```json
{
  "message": "Invalid or expired access token."
}
```

### Verify Email
- Method : `POST`
- Endpoint : `/auth/verify`
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
  "message": "Email verified successfully."
}
```
- Response 400
```json
{
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
  "message": "Current password is incorrect."
}
```
- Response 401
```json
{
  "message": "Invalid or expired access token."
}
```

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
  "message": "User Found."
}
```
- Response 404
```json
{
  "message": "User not found."
}
```
- Response 429
```json
{
  "message": "Too many requests. Please try again later."
}
```

### Send OTP Code
- Method : `POST`
- Endpoint : `/auth/forgotPassword/sendOTP`
- Request Body
```json
{
  "email": "karim@example.com"
}
```
- Response 200
```json
{
  "message": "OTP Code sent successfully. Please check your email."
}
```
- Response 404
```json
{
  "message": "User not found."
}
```
- Response 429
```json
{
  "message": "Too many requests. Please try again later."
}
```


### Reset Password via Forgot Password Page
- Method : `PATCH`
- Endpoint : `/auth/resetPassword`
- Request Body
```json
{
  "email": "karim@example.com",
  "otpCode": "123456",
  "newPassword": "NewStrongPass!45"
}
```
- Response 200
```json
{
  "message": "Password reset successfully."
}
```
- Response 400
```json
{
  "message": "Invalid OTP Code."
}
```
- Response 404
```json
{
  "message": "User not found."
}
```
- Response 429
```json
{
  "message": "Too many requests. Please try again later."
}
```
- Response 401
```json
{
  "message": "Invalid or expired access token."
}
```