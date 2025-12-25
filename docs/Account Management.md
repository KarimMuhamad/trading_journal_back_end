# Trading Journal API Documentation
## Account Management
Backend: Node.js + Express + Prisma  
Auth: JWT (Access & Refresh Tokens)  
Format: JSON  
Version: 1.0.0
Base URL: `/api.domain`
---

# Table of Contents
1. [Create Account](#1-create-account)
2. [Get Account](#2-get-account)
3. [Update Account](#3-update-account)
4. [Delete Account](#4-delete-account)
5. [Get All Accounts](#5-get-all-accounts)
6. [Archive Account](#6-archive-account)
7. [Unarchive Account](#7-unarchive-account)
8. [Get All Archived Accounts](#8-get-all-archived-accounts)

---
## 1. Create Account
- Method: `POST`
- Endpoint: `/accounts`
- Authorization: `Bearer <accessToken>`

Request Body
```json
{
  "nickName": "karimfx",
  "exchange": "Binance",
  "balance": 1000,
  "risk_per_trade": 0.1,
  "max_risk_per_day": 0.3
}
```

Response 201 — Success
```json
{
  "status": "success",
  "message": "Account created successfully.",
  "data": {
    "id": 123,
    "nickName": "karimfx",
    "exchange": "Binance",
    "balance": 1000,
    "risk_per_trade": 0.1,
    "max_risk_per_day": 0.3
  }
}
```

Response 400 — Validation Error
```json
{
  "status": "error",
  "message": "Validation error",
  "errors": [
    { "field": "nickName", "message": "Nickname is required" }
  ]
}
```

Response 401 — Unauthorized
```json
{
  "status": "error",
  "message": "Unauthorized",
  "code": "AUTH_UNAUTHORIZED"
}
```

---
## 2. Get Account
- Method: `GET`
- Endpoint: `/accounts/:id`
- Authorization: `Bearer <accessToken>`

Response 200 — Success
```json
{
  "status": "success",
  "data": {
    "id": 123,
    "nickName": "karimfx",
    "exchange": "Binance",
    "balance": 1000
  }
}
```

Response 404 — Not Found
```json
{
  "status": "error",
  "message": "Account not found",
  "code": "ACCOUNT_NOT_FOUND"
}
```

Response 401 — Unauthorized
```json
{
  "status": "error",
  "message": "Unauthorized",
  "code": "AUTH_UNAUTHORIZED"
}
```

---
## 3. Update Account
- Method: `PATCH`
- Endpoint: `/accounts/:id`
- Authorization: `Bearer <accessToken>`

Request Body
```json
{
  "nickName": "karimfx"
}
```

Response 200 — Success
```json
{
  "status": "success",
  "message": "Account updated successfully."
}
```

Response 400 — Validation Error
```json
{
  "status": "error",
  "message": "Validation error",
  "errors": [
    { "field": "nickName", "message": "Nickname must be a non-empty string" }
  ]
}
```

Response 404 — Not Found
```json
{
  "status": "error",
  "message": "Account not found",
  "code": "ACCOUNT_NOT_FOUND"
}
```

Response 401 — Unauthorized
```json
{
  "status": "error",
  "message": "Unauthorized",
  "code": "AUTH_UNAUTHORIZED"
}
```

---
## 4. Delete Account
- Method: `DELETE`
- Endpoint: `/accounts/:id`
- Authorization: `Bearer <accessToken>`

Rules for deleting an account:
- Account must not be `archived`.

Response 200 — Success
```json
{
  "status": "success",
  "message": "Account deleted successfully."
}
```

Response 404 — Not Found
```json
{
  "status": "error",
  "message": "Account not found",
  "code": "ACCOUNT_NOT_FOUND"
}
```

Response 401 — Unauthorized
```json
{
  "status": "error",
  "message": "Unauthorized",
  "code": "AUTH_UNAUTHORIZED"
}
```

---
## 5. Get All Accounts
- Method: `GET`
- Endpoint: `/accounts`
- Authorization: `Bearer <accessToken>`

Query Params:
- `page`: Page number (default: 1)
- `size`: Number of items per page (default: 5)

Response 200 — Success
```json
{
  "status": "success",
  "data": [
    {
      "id": 123,
      "nickName": "karimfx",
      "exchange": "Binance",
      "balance": 1000,
      "risk_per_trade": 1,
      "max_risk_per_day": 3,
      "stats": {
        "total_trades": 20,
        "total_profit": 100,
        "total_loss": 150
      }
    },
    {
      "id": 456,
      "nickName": "ahmedfx",
      "exchange": "Binance",
      "balance": 2000,
      "risk_per_trade": 1,
      "max_risk_per_day": 3,
      "stats": {
        "total_trades": 20,
        "total_profit": 100,
        "total_loss": 150
      }
    }
  ],
  "paging": {
    "page": 1,
    "size": 5,
    "total": 5
  }
}
```

Response 401 — Unauthorized
```json
{
  "status": "error",
  "message": "Unauthorized",
  "code": "AUTH_UNAUTHORIZED"
}
```
---

## 6. Archive Account
- Method: `DELETE`
- Endpoint: `/accounts/:id/archive`
- Authorization: `Bearer <accessToken>`

Response 200 - Success
```json
{
  "status": "success",
  "message": "Account archived successfully."
}
```

Response 404 - Not Found
```json
{
  "status": "error",
  "message": "Account not found",
  "code": "ACCOUNT_NOT_FOUND"
}
```

Response 401 - Unauthorized
```json
{
  "status": "error",
  "message": "Unauthorized",
  "code": "AUTH_UNAUTHORIZED"
}
```
---

## 7. Unarchive Account
- Method: `PATCH`
- Endpoint: `/accounts/:id/unarchive`
- Authorization: `Bearer <accessToken>`
- Note: Account must be archived.

Response 200 - Success
```json
{ 
  "status": "success",
  "message": "Account unarchived successfuly",
  "data": {
    "id": 123,
    "nickName": "karimfx",
    "exchange": "Binance",
    "balance": 1000,
    "risk_per_trade": 0.1,
    "max_risk_per_day": 0.3
  }
}
```

Response 404 - Not Found
```json
{
  "status": "error",
  "message": "Account not found",
  "code": "ACCOUNT_NOT_FOUND"
}
```

Response 401 - Unauthorized
```json
{
  "status": "error",
  "message": "Unauthorized",
  "code": "AUTH_UNAUTHORIZED"
}
```
---

## 8. Get All Archived Accounts
- Method: `GET`
- Endpoint: `/accounts/archived`
- Authorization: `Bearer <accessToken>`

Query Params:
- `page`: Page number (default: 1)
- `size`: Number of items per page (default: 5)

Response 200 - Success
```json
{
  "status": "success",
  "data": [
    {
      "id": 123,
      "nickName": "karimfx",
      "exchange": "Binance",
      "balance": 1000,
      "risk_per_trade": 1,
      "max_risk_per_day": 3,
      "stats": {
        "total_trades": 20,
        "total_profit": 100,
        "total_loss": 150
      }
    },
    {
      "id": 456,
      "nickName": "ahmedfx",
      "exchange": "Binance",
      "balance": 2000,
      "risk_per_trade": 1,
      "max_risk_per_day": 3,
      "stats": {
        "total_trades": 20,
        "total_profit": 100,
        "total_loss": 150
      }
    }
  ],
  "paging": {
    "page": 1,
    "size": 5,
    "total": 5
  }
}
```

Response 401 - Unauthorized
```json
{
  "status": "error",
  "message": "Unauthorized",
  "code": "AUTH_UNAUTHORIZED"
}
```