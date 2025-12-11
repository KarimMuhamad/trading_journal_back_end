# Trading Journal API Documentation
## Playbooks Management
Backend: Node.js + Express + Prisma  
Auth: JWT (Access & Refresh Tokens)  
Format: JSON  
Version: 1.0.0
Base URL: `/api.domain/v1`
---

# Table of Contents
1. [Create Playbook](#1-create-playbook)
2. [Get All Playbooks](#2-get-all-playbooks)
3. [Get Playbook by ID](#3-get-playbook-by-id)
4. [Update Playbook](#4-update-playbook)
5. [Delete Playbook](#5-delete-playbook)

---
## 1. Create Playbook
- Method: `POST`
- Endpoint: `/playbooks`
- Authorization: `Bearer <accessToken>`

Request Body
```json
{
  "name": "Extreme Order Block",
  "description": "A sample playbook for extreme order block strategy."
}
```

Validation Rules
- `name` (required): 1–100 characters
- `description` (optional): up to 2000 characters

Response 201 — Success
```json
{
  "status": "success",
  "message": "Playbook created successfully.",
  "data": {
    "id": 123,
    "name": "Extreme Order Block",
    "description": "A sample playbook for extreme order block strategy."
  }
}
```

Response 400 — Validation Error
```json
{
  "status": "error",
  "message": "Validation error",
  "errors": [
    { "field": "name", "message": "Name is required" }
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
## 2. Get All Playbooks
- Method: `GET`
- Endpoint: `/playbooks`
- Authorization: `Bearer <accessToken>`

Response 200 — Success
```json
{
  "status": "success",
  "data": [
    {
      "id": 123,
      "name": "Extreme Order Block",
      "description": "A sample playbook for extreme order block strategy."
    },
    {
      "id": 456,
      "name": "Extreme Order Block 2",
      "description": "A sample playbook for extreme order block strategy 2."
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
## 3. Get Playbook by ID
- Method: `GET`
- Endpoint: `/playbooks/:id`
- Authorization: `Bearer <accessToken>`

Response 200 — Success
```json
{
  "status": "success",
  "message": "Playbook retrieved successfully.",
  "data": {
    "id": 123,
    "name": "Extreme Order Block",
    "description": "A sample playbook for extreme order block strategy."
  }
}
```

Response 404 — Not Found
```json
{
  "status": "error",
  "message": "Playbook not found",
  "code": "PLAYBOOK_NOT_FOUND"
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
## 4. Update Playbook
- Method: `PATCH`
- Endpoint: `/playbooks/:id`
- Authorization: `Bearer <accessToken>`

Request Body
```json
{
  "name": "Extreme Order Block",
  "description": "A sample playbook for extreme order block strategy."
}
```

Response 200 — Success
```json
{
  "status": "success",
  "message": "Playbook updated successfully.",
  "data": {
    "id": 123,
    "name": "Extreme Order Block",
    "description": "A sample playbook for extreme order block strategy."
  }
}
```

Response 400 — Validation Error
```json
{
  "status": "error",
  "message": "Validation error",
  "errors": [
    { "field": "name", "message": "Name must be between 1 and 100 characters" }
  ]
}
```

Response 404 — Not Found
```json
{
  "status": "error",
  "message": "Playbook not found",
  "code": "PLAYBOOK_NOT_FOUND"
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
## 5. Delete Playbook
- Method: `DELETE`
- Endpoint: `/playbooks/:id`
- Authorization: `Bearer <accessToken>`

Response 200 — Success
```json
{
  "status": "success",
  "message": "Playbook deleted successfully."
}
```

Response 404 — Not Found
```json
{
  "status": "error",
  "message": "Playbook not found",
  "code": "PLAYBOOK_NOT_FOUND"
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