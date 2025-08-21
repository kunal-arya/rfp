# API Documentation

This document provides documentation for the RFP management system's API.

## Base URL

`http://localhost:3000/api`

## Authentication

Most endpoints require a JSON Web Token (JWT) for authentication. The JWT should be included in the `Authorization` header as a Bearer token:

`Authorization: Bearer <your_jwt>`

## Endpoints

### Authentication

#### `POST /auth/register`

Registers a new user.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "yourpassword",
  "roleName": "Buyer" 
}
```

**Responses:**

- `201 Created`: User registered successfully.
- `400 Bad Request`: Missing required fields or invalid role.
- `409 Conflict`: Email already exists.

#### `POST /auth/login`

Logs in a user and returns a JWT.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Responses:**

- `200 OK`: Login successful. Returns a JWT.
- `401 Unauthorized`: Invalid credentials.

### RFPs

#### `POST /rfps`

Creates a new RFP. Requires authentication and the `rfp.create` permission (granted to Buyers).

**Request Body:**

```json
{
  "title": "New RFP for Office Supplies",
  "form_data": {
    "description": "We need a new supplier for office supplies.",
    "requirements": [
      "Pens",
      "Paper",
      "Notebooks"
    ]
  }
}
```

**Responses:**

- `201 Created`: RFP created successfully.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: User does not have permission to create an RFP.
