# Trading Journal API Documentation
Backend: Node.js + Express + Prisma  
Auth: JWT (Access & Refresh Tokens)  
Format: JSON  
Version: 1.0.0
Base URL: `/api.domain/v1`
---

## Create Account
- Method : `POST`
- Endpoint : `/accounts`
- Authorization : `Bearer <accessToken>`
- Request Body
```json
{
  "nickName": "karimfx",
  "exchange": "Binance",
  "balance": "$1000"
}
```
- Response 201
```json
{
  "message": "Account created successfully."
}
```
- Response 400
```json
{
  "message": "Invalid request. Please check your input."
}
```
- Response 401 
```json
{
  "message": "Unauthorized. Please log in."
}
```

## Get Account
- Method : `GET`
- Endpoint : `/accounts/:id`
- Authorization : `Bearer <accessToken>`
- Response 200
```json
{
  "id": 123,
  "nickName": "karimfx",
  "exchange": "Binance",
  "balance": "$1000"
}
```
- Response 401
```json
{
  "message": "Unauthorized. Please log in."
}
```

## Update Account
- Method : `PATCH`
- Endpoint : `/accounts/:id`
- Authorization : `Bearer <accessToken>`
- Request Body
```json
{
  "nickName": "karimfx",
  "exchange": "Binance",
  "balance": "$1500"
}
```
- Response 200
```json
{
  "message": "Account updated successfully."
}
```
- Response 400
```json
{
  "message": "Invalid request. Please check your input."
}
```
- Response 401
```json
{
  "message": "Unauthorized. Please log in."
}
```

## Delete Account
- Method : `DELETE`
- Endpoint : `/accounts/:id`
- Authorization : `Bearer <accessToken>`
- Response 200
```json
{
  "message": "Account deleted successfully."
}
```
- Response 401
```json
{
  "message": "Unauthorized. Please log in."
}
```

## Get All Accounts
- Method : `GET`
- Endpoint : `/accounts`
- Authorization : `Bearer <accessToken>`
- Response 200
```json
[
  {
    "id": 123,
    "nickName": "karimfx",
    "exchange": "Binance",
    "balance": "$1000"
  },
  {
    "id": 456,
    "nickName": "ahmedfx",
    "exchange": "Binance",
    "balance": "$2000"
  }
]
```
- Response 401
```json
{
  "message": "Unauthorized. Please log in."
}
```
---
## Create New Trade Position
- Method : `POST`
- Endpoint : `/accounts/:accountId/trades`
- Authorization : `Bearer <accessToken>`
- Request Body
```json
{
  "entry_time": "2025-11-13T10:00:00Z",
  "pair": "BTCUSDT",
  "position": "LONG",
  "entry_price": 68000.25,
  "position_size": 0.5,
  "sl_price": 67000.00,
  "tp_price": 70000.00,
  "entry_time": "2025-11-13T10:00:00Z",
  "note": "Breakout entry at resistance",
  "link_img": "https://cdn.example.com/trades/chart1.png",
  "playbook_ids": [1, 3]
}

```
- Response 201
```json
{
  "message": "Trade created successfully.",
  "trade": {
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
- Response 400
```json
{
  "message": "Invalid trade data."
}
```
- Response 401
```json
{
  "message": "Unauthorized. Please log in."
}
```
---
## Get All Trade by Account
- Method : `GET`
- Endpoint : `/accounts/:accountId/trades`
- Authorization : `Bearer <accessToken>`
- Response 200
```json
{
  "account_id": 12,
  "trades": [
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
- Response 404
```json
{
  "message": "No trades found for this account."
}
```
- Response 401
```json
{
  "message": "Unauthorized. Please log in."
}
```
- Query Params

| Param    | Type   | Default | Example                             |
| -------- | ------ | ------- | ----------------------------------- |
| `status` | string | all     | `/accounts/12/trades?status=Closed` |
| `limit`  | int    | 20      | `/accounts/12/trades?limit=10`      |
