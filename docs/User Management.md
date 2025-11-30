# Trading Journal API Documentation
Backend: Node.js + Express + Prisma  
Auth: JWT (Access & Refresh Tokens)  
Format: JSON  
Version: 1.0.0
Base URL: `/api.domain/v1`
---

## User Management

### Get User Profile
- Method : `GET`
- Endpoint : `/users/me`
- Authorization : `Bearer <accessToken>`
- Response 200
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
- Response 401
```json
{
  "status" : "error",
  "message": "Unauthorized. Please log in."
}
```
---

### Update UserName Profile
- Method : `PATCH`
- Endpoint : `/users/me`
- Authorization : `Bearer <accessToken>`
- Request Body
```json
{
  "username": "karimfx",
}
```
- Response 200
```json
{
  "status": "success",
  "message": "User profile updated successfully.",
  "data" : {
    "id" : 123,
    "username " : "karimfx12",
  }
}
```
- Response 401
```json
{
  "status": "error",
  "message": "Unauthorized. Please log in."
}
```
---

### Request OTP Update Email
- Method : `POST`
- Endpoint : `users/email/request-otp`
- Authorization : `Bearer <accessToken>`
- Request Body 
```json
{
  "newEmail" : "tjNew@dev.com"
}
```
- Response 200
```json
{
  "status" : "success",
  "message" : "Sending OTP Code succesfully"
}
```
- Response 409
```json
{
  "status" : "error",
  "message" : "Email already exist"
}
```
- Response 429
```json
{
  "status" : "error",
  "message" : "to manu request. please try again later"
}
```
- Response 401
```json
{
  "status": "error",
  "message": "Unauthorized. Please log in."
}
```
---

### Verify OTP and Update Email
- Method : `PATCH`
- Endpoint : `users/email/verify-otp`
- Authorization : `Bearer <accessToken>`
- Request Body 
```json
{
  "newEmail" : "tjNew@dev.com",
  "otp" : 32418 //6 digit
}
```
- Response 200 
```json
{
  "status" : "success",
  "message" : "Email updated succesfully"
}
```
- Response 409
```json
{
  "status" : "error",
  "message" : "Email already exist"
}
```
- Response 401
```json
{
  "status": "error",
  "message": "Unauthorized. Please log in."
}
```
---

### Delete User Account
- Method : `DELETE`
- Endpoint : `/users/me`
- Authorization : `Bearer <accessToken>`
- Request Body
```json
{
  "password": "StrongPass!23"
}
```
- Response 200
```json
{
  "message": "User account deleted successfully."
}
```
- Response 400
```json
{
  "status": "error",
  "message": "Invalid password."
}
```
- Response 401
```json
{
  "status": "error",
  "message": "Unauthorized. Please log in."
}
```