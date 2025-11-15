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

### Update User Profile
- Method : `PATCH`
- Endpoint : `/users/me`
- Authorization : `Bearer <accessToken>`
- Request Body
```json
{
  "username": "karimfx",
  "email": "karim@example.com"
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
    "email" : "karim@example.com"
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