# API Documentation

This document provides comprehensive documentation for the RFP management system's API.

## Base URL

`http://localhost:3000/api`

## Authentication

Most endpoints require a JSON Web Token (JWT) for authentication. The JWT should be included in the `Authorization` header as a Bearer token:

`Authorization: Bearer <your_jwt>`

## WebSocket Connection

For real-time notifications, connect to the WebSocket server:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'your_jwt_token'
  }
});

// Listen for notifications
socket.on('rfp_published', (data) => {
  console.log('New RFP published:', data);
});

socket.on('response_submitted', (data) => {
  console.log('New response submitted:', data);
});

socket.on('rfp_status_changed', (data) => {
  console.log('RFP status changed:', data);
});
```

## Endpoints

### Health Check

#### `GET /health`

Check the health status of the application and its services.

**Responses:**

- `200 OK`: Application is healthy
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "websocket": "active",
    "api": "running"
  }
}
```

- `503 Service Unavailable`: Application is unhealthy
```json
{
  "status": "unhealthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "version": "1.0.0",
  "services": {
    "database": "disconnected",
    "websocket": "active",
    "api": "running"
  },
  "error": "Database connection failed"
}
```

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

### Dashboard

#### `GET /dashboard`

Get role-specific dashboard data.

**Responses:**

- `200 OK`: Dashboard data for the user's role.
- `401 Unauthorized`: Missing or invalid JWT.

**Buyer Dashboard Response:**
```json
{
  "recentRfps": [...],
  "recentResponses": [...],
  "rfpsNeedingAttention": [...],
  "role": "Buyer"
}
```

**Supplier Dashboard Response:**
```json
{
  "availableRfps": [...],
  "myResponses": [...],
  "responsesNeedingAttention": [...],
  "role": "Supplier"
}
```

#### `GET /dashboard/stats`

Get dashboard statistics.

**Responses:**

- `200 OK`: Dashboard statistics for the user's role.
- `401 Unauthorized`: Missing or invalid JWT.

**Buyer Stats Response:**
```json
{
  "totalRfps": 10,
  "publishedRfps": 5,
  "draftRfps": 3,
  "totalResponses": 15,
  "pendingResponses": 8,
  "approvedResponses": 5,
  "rejectedResponses": 2,
  "role": "Buyer"
}
```

**Supplier Stats Response:**
```json
{
  "totalResponses": 8,
  "draftResponses": 2,
  "submittedResponses": 4,
  "approvedResponses": 1,
  "rejectedResponses": 1,
  "availableRfps": 12,
  "role": "Supplier"
}
```

### RFPs

#### `GET /rfp/all`

Get all published RFPs (for suppliers).

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `search` (optional): Search term for filtering
- `filters` (optional): Additional filters

**Responses:**

- `200 OK`: List of published RFPs.
- `401 Unauthorized`: Missing or invalid JWT.

#### `GET /rfp`

Get user's own RFPs (for buyers).

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `search` (optional): Search term for filtering
- `filters` (optional): Additional filters

**Responses:**

- `200 OK`: List of user's RFPs.
- `401 Unauthorized`: Missing or invalid JWT.

#### `GET /rfp/{rfp_id}`

Get specific RFP details.

**Parameters:**
- `rfp_id` (path): RFP ID

**Responses:**

- `200 OK`: RFP details.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: User not authorized to view this RFP.
- `404 Not Found`: RFP not found.

#### `POST /rfp`

Create a new RFP (buyers only).

**Request Body:**

```json
{
  "title": "New RFP for Office Supplies",
  "description": "We need a new supplier for office supplies.",
  "requirements": "Pens, Paper, Notebooks",
  "budget_min": 1000,
  "budget_max": 5000,
  "deadline": "2024-12-31T23:59:59Z",
  "notes": "Additional requirements and notes"
}
```

**Responses:**

- `201 Created`: RFP created successfully.
- `400 Bad Request`: Invalid request data.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: User does not have permission to create an RFP.

#### `PUT /rfp/{rfp_id}`

Update an RFP (buyers only).

**Parameters:**
- `rfp_id` (path): RFP ID

**Request Body:** Same as POST /rfp

**Responses:**

- `200 OK`: RFP updated successfully.
- `400 Bad Request`: Invalid request data or RFP cannot be updated.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: User not authorized to update this RFP.
- `404 Not Found`: RFP not found.

#### `DELETE /rfp/{rfp_id}`

Delete an RFP (buyers only).

**Parameters:**
- `rfp_id` (path): RFP ID

**Responses:**

- `200 OK`: RFP deleted successfully.
- `400 Bad Request`: RFP cannot be deleted in current status.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: User not authorized to delete this RFP.
- `404 Not Found`: RFP not found.

#### `PUT /rfp/{rfp_id}/publish`

Publish an RFP (buyers only).

**Parameters:**
- `rfp_id` (path): RFP ID

**Responses:**

- `200 OK`: RFP published successfully.
- `400 Bad Request`: RFP cannot be published from current status.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: User not authorized to publish this RFP.
- `404 Not Found`: RFP not found.

#### `PUT /rfp/{rfp_id}/close`

Close an RFP (buyers only).

**Parameters:**
- `rfp_id` (path): RFP ID

**Responses:**

- `200 OK`: RFP closed successfully.
- `400 Bad Request`: RFP cannot be closed in current status.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: User not authorized to close this RFP.
- `404 Not Found`: RFP not found.

#### `PUT /rfp/{rfp_id}/cancel`

Cancel an RFP (buyers only).

**Parameters:**
- `rfp_id` (path): RFP ID

**Responses:**

- `200 OK`: RFP cancelled successfully.
- `400 Bad Request`: RFP cannot be cancelled in current status.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: User not authorized to cancel this RFP.
- `404 Not Found`: RFP not found.

#### `PUT /rfp/{rfp_id}/award`

Award an RFP to a response (buyers only).

**Parameters:**
- `rfp_id` (path): RFP ID

**Request Body:**

```json
{
  "response_id": "response-uuid"
}
```

**Responses:**

- `200 OK`: RFP awarded successfully.
- `400 Bad Request`: RFP cannot be awarded or response is not approved.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: User not authorized to award this RFP.
- `404 Not Found`: RFP or response not found.

#### `POST /rfp/{rfp_id}/versions`

Create a new version of an RFP (buyers only, Draft RFPs only).

**Parameters:**
- `rfp_id` (path): RFP ID

**Request Body:** Same as POST /rfp

**Responses:**

- `201 Created`: RFP version created successfully.
- `400 Bad Request`: Invalid request data or RFP cannot be versioned.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: User not authorized to create versions for this RFP.
- `404 Not Found`: RFP not found.

#### `GET /rfp/{rfp_id}/versions`

Get all versions of an RFP (buyers only).

**Parameters:**
- `rfp_id` (path): RFP ID

**Responses:**

- `200 OK`: List of RFP versions.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: User not authorized to view versions for this RFP.
- `404 Not Found`: RFP not found.

#### `PUT /rfp/{rfp_id}/versions/{version_id}/switch`

Switch to a specific version of an RFP (buyers only, Draft RFPs only).

**Parameters:**
- `rfp_id` (path): RFP ID
- `version_id` (path): Version ID

**Responses:**

- `200 OK`: RFP version switched successfully.
- `400 Bad Request`: RFP cannot switch versions.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: User not authorized to switch versions for this RFP.
- `404 Not Found`: RFP or version not found.

### Responses

#### `POST /rfp/{rfp_id}/responses`

Submit a response to an RFP (suppliers only).

**Parameters:**
- `rfp_id` (path): RFP ID

**Request Body:**

```json
{
  "proposed_budget": 3000,
  "timeline": "2 weeks",
  "cover_letter": "We are excited to submit our proposal..."
}
```

**Responses:**

- `201 Created`: Response created successfully.
- `400 Bad Request`: Invalid request data or RFP not available.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: User not authorized to respond to this RFP.
- `404 Not Found`: RFP not found.

#### `GET /rfp/my-responses`

Get supplier's responses.

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `search` (optional): Search term for filtering

**Responses:**

- `200 OK`: List of supplier's responses.
- `401 Unauthorized`: Missing or invalid JWT.

#### `GET /rfp/responses/{responseId}`

Get specific response details.

**Parameters:**
- `responseId` (path): Response ID

**Responses:**

- `200 OK`: Response details.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: User not authorized to view this response.
- `404 Not Found`: Response not found.

#### `PUT /rfp/responses/{responseId}`

Update a supplier response.

**Parameters:**
- `responseId` (path): Response ID

**Request Body:** Same as POST /rfp/{rfp_id}/responses

**Responses:**

- `200 OK`: Response updated successfully.
- `400 Bad Request`: Invalid request data or response cannot be updated.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: User not authorized to update this response.
- `404 Not Found`: Response not found.

#### `PUT /rfp/responses/{responseId}/submit`

Submit a draft response (suppliers only).

**Parameters:**
- `responseId` (path): Response ID

**Responses:**

- `200 OK`: Response submitted successfully.
- `400 Bad Request`: Response is not in Draft status.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: User not authorized to submit this response.
- `404 Not Found`: Response not found.

#### `GET /rfp/{rfp_id}/responses`

Get all responses for a specific RFP (buyers only).

**Parameters:**
- `rfp_id` (path): RFP ID

**Responses:**

- `200 OK`: List of responses for the RFP.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: User not authorized to view responses for this RFP.
- `404 Not Found`: RFP not found.

#### `PUT /rfp/responses/review/{rfp_id}`

Review a supplier response (approve/reject) (buyers only).

**Parameters:**
- `rfp_id` (path): RFP ID

**Request Body:**

```json
{
  "status": "Approved"
}
```

**Responses:**

- `200 OK`: Response reviewed successfully.
- `400 Bad Request`: Invalid status or RFP not in correct status.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: User not authorized to review responses for this RFP.
- `404 Not Found`: RFP not found.

#### `PUT /rfp/responses/{response_id}/approve`

Approve a response (buyers only).

**Parameters:**
- `response_id` (path): Response ID

**Responses:**

- `200 OK`: Response approved successfully.
- `400 Bad Request`: Response cannot be approved in current status.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: User not authorized to approve this response.
- `404 Not Found`: Response not found.

#### `PUT /rfp/responses/{response_id}/reject`

Reject a response (buyers only).

**Parameters:**
- `response_id` (path): Response ID

**Request Body:**

```json
{
  "rejection_reason": "Reason for rejection"
}
```

**Responses:**

- `200 OK`: Response rejected successfully.
- `400 Bad Request`: Response cannot be rejected in current status.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: User not authorized to reject this response.
- `404 Not Found`: Response not found.

#### `PUT /rfp/responses/{response_id}/award`

Award a response (buyers only).

**Parameters:**
- `response_id` (path): Response ID

**Responses:**

- `200 OK`: Response awarded successfully.
- `400 Bad Request`: Response cannot be awarded in current status.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: User not authorized to award this response.
- `404 Not Found`: Response not found.

### Audit Trail

#### `GET /audit/my`

Get user's own audit trails.

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `action` (optional): Filter by action type
- `search` (optional): Search term

**Responses:**

- `200 OK`: User's audit trails with pagination.
- `401 Unauthorized`: Missing or invalid JWT.

#### `GET /audit/target/{targetType}/{targetId}`

Get audit trails for a specific target (RFP, Response, etc.).

**Parameters:**
- `targetType` (path): Type of target (RFP, Response, Document, etc.)
- `targetId` (path): ID of the target

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `action` (optional): Filter by action type

**Responses:**

- `200 OK`: Target's audit trails with pagination.
- `401 Unauthorized`: Missing or invalid JWT.

#### `GET /audit/all`

Get all audit trails (admin only).

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `user_id` (optional): Filter by user ID
- `action` (optional): Filter by action type
- `target_type` (optional): Filter by target type
- `target_id` (optional): Filter by target ID

**Responses:**

- `200 OK`: All audit trails with pagination.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: Admin access required.

### Documents

#### `POST /rfp/{rfp_version_id}/documents`

Upload a document for an RFP.

**Parameters:**
- `rfp_version_id` (path): RFP Version ID

**Request Body:**
- `document` (multipart/form-data): File to upload

**Responses:**

- `201 Created`: Document uploaded successfully.
- `400 Bad Request`: No file uploaded.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: User not authorized to upload documents for this RFP.
- `404 Not Found`: RFP version not found.

#### `POST /rfp/responses/{responseId}/documents`

Upload a document for a response.

**Parameters:**
- `responseId` (path): Response ID

**Request Body:**
- `document` (multipart/form-data): File to upload

**Responses:**

- `201 Created`: Document uploaded successfully.
- `400 Bad Request`: No file uploaded.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: User not authorized to upload documents for this response.
- `404 Not Found`: Response not found.

## Error Responses

All endpoints may return the following error responses:

- `400 Bad Request`: Invalid request data or business rule violation
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: User does not have permission for the requested action
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Environment Variables

The following environment variables are required:

```env
JWT_SECRET=your_jwt_secret
DATABASE_URL=your_database_url
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@yourdomain.com
FRONTEND_URL=http://localhost:3000
```
