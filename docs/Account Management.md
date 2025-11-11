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
- Method : `PUT`
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