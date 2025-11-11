# Trading Journal API Documentation
Backend: Node.js + Express + Prisma  
Auth: JWT (Access & Refresh Tokens)  
Format: JSON  
Version: 1.0.0
Base URL: `/api.domain/v1`
---

## Create Playbook
- Method : `POST`
- Endpoint : `/playbooks`
- Authorization : `Bearer <accessToken>`
- Request Body
```json
{
  "name": "Extreme Order Block",
  "description": "A sample playbook for extreme order block strategy.",
}
```
- Response 201
```json
{
  "message": "Playbook created successfully."
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

## Get All Playbooks
- Method : `GET`
- Endpoint : `/playbooks`
- Authorization : `Bearer <accessToken>`
- Response 200
```json
[
  {
    "id": 123,
    "name": "Extreme Order Block",
    "description": "A sample playbook for extreme order block strategy.",
  },
  {
    "id": 456,
    "name": "Mean Reversion",
    "description": "A sample playbook for mean reversion strategy.",
  }
]
```
- Response 401
```json
{
  "message": "Unauthorized. Please log in."
}
```

## Get Playbook by ID
- Method : `GET`
- Endpoint : `/playbooks/:id`
- Authorization : `Bearer <accessToken>`
- Response 200
```json
{
  "id": 123,
  "name": "Extreme Order Block",
  "description": "A sample playbook for extreme order block strategy.",
}
```
- Response 401
```json
{
  "message": "Unauthorized. Please log in."
}
```

## Update Playbook
- Method : `PUT`
- Endpoint : `/playbooks/:id`
- Authorization : `Bearer <accessToken>`
- Request Body
```json
{
  "name": "Extreme Order Block",
  "description": "A sample playbook for extreme order block strategy.",
}
```
- Response 200
```json
{
  "message": "Playbook updated successfully."
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

## Delete Playbook
- Method : `DELETE`
- Endpoint : `/playbooks/:id`
- Authorization : `Bearer <accessToken>`
- Response 200
```json
{
  "message": "Playbook deleted successfully."
}
```
- Response 401
```json
{
  "message": "Unauthorized. Please log in."
}
```