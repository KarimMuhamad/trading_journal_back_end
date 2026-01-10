# Trading Journal API Documentation
## Trade
Backend: Node.js + Express + Prisma  
Auth: JWT (Access & Refresh Tokens)  
Format: JSON  
Version: 1.0.0
Base URL: `/api.domain`
---

# Table of Contents
1. [Create New Trade Position](#1-create-new-trade-position)
2. [Get Trade Detail](#2-get-trade-detail)
3. [Close Running Trade](#3-close-running-trade)

---
## 1. Create New Trade Position
- Method: `POST`
- Endpoint: `/accounts/:accountId/trades`
- Authorization: `Bearer <accessToken>`

**Optional Values**
- sl_price
- tp_price
- exit_price
- trade_result
- trade_duration
- pnl
- risk_reward
- rr_actual
- link_img
- notes


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
    "entry_time": "<timestampz>",
    "pair": "BTCUSDT",
    "position": "LONG",
    "entry_price": "<entry_price>",
    "position_size": 0.5,
    "status": "Running",
    "sl_price": <sl_price>,
    "tp_price": <tp_price>,
    "risk_amount": <risk_amount>,
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

## 2. Get Trade Detail
- Method: `GET`
- Endpoint: `/trades/:tradeId`
- Authorization: `Bearer <accessToken>`

Response 200 — Success
```json
{
  "status": "success",
  "data": {
    "id": 201,
    "account_id": 12,
    "pair": "BTCUSDT",
    "position": "LONG",
    "entry_price": 68000.25,
    "exit_price": 69500.00,
    "position_size": 0.5,
    "pnl": 749.88,
    "sl_price": <sl_price>,
    "tp_price": <tp_price>,
    "risk_amount": <risk_amount>,
    "risk_reward": 2.0,
    "rr_actual": 2.3,
    "trade_result": "WIN",
    "status": "Closed",
    "note": "Closed manually at resistance.",
    "entry_time": "2025-11-13T10:00:00Z",
    "exit_time": "2025-11-13T14:30:00Z",
    "trade_duration": 430s,
    "link_img": "https://cdn.example.com/trades/chart1.png",
    "playbooks": [
      { "id": 1, "name": "Order Block" },
      { "id": 3, "name": "Liquidity Sweep" }
    ]
  }
}
```

Response 404 — Not Found
```json
{
  "status": "error",
  "message": "Trade not found",
  "code": "TRADE_NOT_FOUND"
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
## 3. Close Running Trade
- Method: `PATCH`
- Endpoint: `/trades/:tradeId/close`
- Authorization: `Bearer <accessToken>`

Request Body
```json
{
  "exit_price": 69500.00,
  "exit_time": "2025-11-13T14:30:00Z"
}
```

Response 200 — Success
```json
{
  "status": "success",
  "message": "Trade closed successfully.",
  "data": {
    "id": 201,
    "pair": "BTCUSDT",
    "position": "LONG",
    "position_size": 0.5,
    "entry_price": 68000.25,
    "exit_price": 69500.00,
    "exit_time": "2025-11-13T14:30:00Z",
    "tp_price": "<number>",
    "sl_price": "<number>",
    "trade_duration": 6300s,
    "pnl": 749.88,
    "risk_amount": <risk_amount>,
    "risk_reward": 2.0,
    "rr_actual": 2.3,
    "trade_result": "WIN",
    "status": "Closed",
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
    { "field": "exit_price", "message": "exit_price must be a positive number" },
    { "field": "exit_time", "message": "exit_time must be an ISO 8601 datetime" }
  ]
}
```

Response 404 — Not Found
```json
{
  "status": "error",
  "message": "Trade not found",
  "code": "TRADE_NOT_FOUND"
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

## 4. Update Trade
- Method: `PATCH`
- Endpoint: `/trades/:tradeId/update`
- Authorization: `Bearer <accessToken>`

**Rule**
- Status Trade is `Running`: Can change what in request body 
- Status Trade is `Closed`: Only can change `notes`, `link_img`

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
  "link_img": "https://cdn.example.com/trades/chart1.png",
  "playbook_ids": [1, 3]
}
```

Response 200 - Success
```json
{
  "status": "success",
  "message": "Trade created successfully.",
  "data": {
    "id": 201,
    "account_id": 12,
    "entry_time": "<timestampz>",
    "pair": "BTCUSDT",
    "position": "LONG",
    "entry_price": "<entry_price>",
    "position_size": 0.5,
    "status": "Running",
    "sl_price": <sl_price>,
    "tp_price": <tp_price>,
    "risk_amount": <risk_amount>,
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
    { "field": "tp_price", "message": "tp_price must be a positive number" },
    { "field": "sl_price", "message": "sl_price must be an ISO 8601 datetime" }
  ]
}
```

Response 404 — Not Found
```json
{
  "status": "error",
  "message": "Trade not found",
  "code": "TRADE_NOT_FOUND"
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

## 5. Get All Trades

---

## 6. Delete Trade
