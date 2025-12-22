# Trading Journal API Documentation
## Trade
Backend: Node.js + Express + Prisma  
Auth: JWT (Access & Refresh Tokens)  
Format: JSON  
Version: 1.0.0
Base URL: `/api.domain`
---

# Table of Contents
1. [Get Trade Detail](#1-get-trade-detail)
2. [Close Running Trade](#2-close-running-trade)

---
## 1. Get Trade Detail
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
    "realized_pnl": 749.88,
    "risk_reward": 2.0,
    "rr_actual": 2.3,
    "trade_result": "WIN",
    "status": "Closed",
    "note": "Closed manually at resistance.",
    "entry_time": "2025-11-13T10:00:00Z",
    "exit_time": "2025-11-13T14:30:00Z",
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
## 2. Close Running Trade
- Method: `PATCH`
- Endpoint: `/trades/:tradeId`
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
    "entry_price": 68000.25,
    "exit_price": 69500.00,
    "exit_time": "2025-11-13T14:30:00Z",
    "trade_duration": "6300s",
    "realized_pnl": 749.88,
    "risk_reward": 2.0,
    "rr_actual": 2.3,
    "trade_result": "WIN",
    "status": "Closed"
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
