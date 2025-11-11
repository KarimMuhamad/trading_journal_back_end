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
  "id": 123,
  "username": "karimfx",
  "email": "karim@example.com",
}
```
- Response 401
```json
{
  "message": "Unauthorized. Please log in."
}
```
---

### Update User Profile
- Method : `PUT`
- Endpoint : `/users/me`
- Authorization : `Bearer <accessToken>`
- Request Body
```json
{
  "username": "karimfx",
  "email": "karim@example.com",
}
```
- Response 200
```json
{
  "message": "User profile updated successfully."
}
```
- Response 401
```json
{
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
  "message": "Invalid password."
}
```
- Response 401
```json
{
  "message": "Unauthorized. Please log in."
}
```