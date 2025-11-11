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