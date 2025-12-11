# Trading Journal API Documentation
## Account Management
Backend: Node.js + Express + Prisma  
Auth: JWT (Access & Refresh Tokens)  
Format: JSON  
Version: 1.0.0
Base URL: `/api.domain/v1`
---

# Table of Contents
1. [Create Account](#1-create-account)
2. [Get Account](#2-get-account)
3. [Update Account](#3-update-account)
4. [Delete Account](#4-delete-account)
5. [Get All Accounts](#5-get-all-accounts)
6. [Create New Trade Position](#6-create-new-trade-position)
7. [Get All Trades by Account](#7-get-all-trades-by-account)

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
  "balance": 1000
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
    "balance": 1000
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

Response 200 — Success
```json
{
  "status": "success",
  "data": [
    {
      "id": 123,
      "nickName": "karimfx",
      "exchange": "Binance",
      "balance": 1000
    },
    {
      "id": 456,
      "nickName": "ahmedfx",
      "exchange": "Binance",
      "balance": 2000
    }
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
## 6. Create New Trade Position
- Method: `POST`
- Endpoint: `/accounts/:accountId/trades`
- Authorization: `Bearer <accessToken>`

Request Body
```json
{
  "entry_time": "2025-11-13T10:00:00Z",
  "pair": "BTCUSDT",
  "position": "LONG",
  "entry_price": 68000.25,
  "position_size": 0.5,
  "sl_price": 67000.00,
  "tp_price": 70000.00,
  "note": "Breakout entry at resistance",
  "link_img": "https://cdn.example.com/trades/chart1.png",
  "playbook_ids": [1, 3]
}
```

Response 201 — Success
```json
{
  "status": "success",
  "message": "Trade created successfully.",
  "data": {
    "id": 201,
    "account_id": 12,
    "pair": "BTCUSDT",
    "position": "LONG",
    "status": "Running",
    "risk_reward": 2.0,
    "playbooks": [
      { "id": 1, "name": "Order Block" },
      { "id": 3, "name": "Liquidity Sweep" }
    ]
  }
}
```

Response 400 — Validation Error
```json
{
  "status": "error",
  "message": "Validation error",
  "errors": [
    { "field": "pair", "message": "Pair is required" }
  ]
}
```

Response 404 — Account Not Found
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
## 7. Get All Trades by Account
- Method: `GET`
- Endpoint: `/accounts/:accountId/trades`
- Authorization: `Bearer <accessToken>`

Response 200 — Success
```json
{
  "status": "success",
  "account_id": 12,
  "data": [
    {
      "id": 201,
      "pair": "BTCUSDT",
      "position": "LONG",
      "entry_price": 68000.25,
      "exit_price": 69500.00,
      "realized_pnl": 749.88,
      "status": "Closed",
      "trade_result": "WIN"
    },
    {
      "id": 202,
      "pair": "ETHUSDT",
      "position": "SHORT",
      "entry_price": 3200.00,
      "status": "Running"
    }
  ]
}
```

Response 404 — No Trades Found
```json
{
  "status": "error",
  "message": "No trades found for this account",
  "code": "TRADES_NOT_FOUND"
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

Query Parameters

| Param    | Type   | Default | Example                             |
| -------- | ------ | ------- | ----------------------------------- |
| `status` | string | all     | `/accounts/12/trades?status=Closed` |
| `limit`  | int    | 20      | `/accounts/12/trades?limit=10`      |
