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

socket.on('response_status_changed', (data) => {
  console.log('Response status changed:', data);
});

socket.on('rfp_awarded', (data) => {
  console.log('RFP awarded:', data);
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
  "stats": {
    "totalRfps": 10,
    "publishedRfps": 5,
    "totalResponses": 25,
    "pendingReviews": 3
  }
}
```

**Supplier Dashboard Response:**
```json
{
  "recentRfps": [...],
  "recentResponses": [...],
  "stats": {
    "totalResponses": 15,
    "approvedResponses": 8,
    "pendingResponses": 3,
    "awardedResponses": 2
  }
}
```

#### `GET /dashboard/stats`

Get detailed dashboard statistics.

### RFPs

#### `GET /rfp`

Get published RFPs (for suppliers) or user's RFPs (for buyers).

**Query Parameters:**
- `page` (number): Page number for pagination
- `limit` (number): Items per page
- `search` (string): Search term
- `status` (string): Filter by status (Draft, Published, Closed, Awarded, Cancelled)
- `gte___budget_min` (number): Minimum budget filter
- `lte___budget_max` (number): Maximum budget filter
- `gte___deadline` (date): From date filter
- `lte___deadline` (date): To date filter

#### `GET /rfp/my`

Get user's own RFPs (buyers only).

**Query Parameters:** Same as above

#### `POST /rfp`

Create a new RFP.

**Request Body:**
```json
{
  "title": "Website Development RFP",
  "description": "We need a new website",
  "requirements": "Modern design, responsive",
  "budget_min": 5000,
  "budget_max": 15000,
  "deadline": "2024-02-15T00:00:00.000Z"
}
```

#### `GET /rfp/:id`

Get specific RFP details.

#### `PUT /rfp/:id`

Update an RFP.

#### `DELETE /rfp/:id`

Delete an RFP (draft only).

#### `PUT /rfp/:id/publish`

Publish an RFP.

#### `PUT /rfp/:id/close`

Close an RFP.

#### `PUT /rfp/:id/cancel`

Cancel an RFP.

#### `PUT /rfp/:id/award`

Award an RFP to a specific response.

**Request Body:**
```json
{
  "responseId": "response-uuid"
}
```

### RFP Versions

#### `POST /rfp/:id/versions`

Create a new version of an RFP.

#### `GET /rfp/:id/versions`

Get all versions of an RFP.

#### `PUT /rfp/:id/versions/:versionId`

Update a specific version.

#### `DELETE /rfp/:id/versions/:versionId`

Delete a version.

### Responses

#### `GET /rfp/my-responses`

Get user's responses (suppliers only).

**Query Parameters:**
- `page` (number): Page number for pagination
- `limit` (number): Items per page
- `search` (string): Search term
- `status` (string): Filter by status (Draft, Submitted, Under Review, Approved, Rejected, Awarded)
- `gte___proposed_budget` (number): Minimum budget filter
- `lte___proposed_budget` (number): Maximum budget filter
- `gte___created_at` (date): From date filter
- `lte___created_at` (date): To date filter

#### `GET /rfp/:id/responses`

Get responses for a specific RFP (buyers only).

#### `POST /rfp/:id/responses`

Submit a response to an RFP.

**Request Body:**
```json
{
  "proposed_budget": 12000,
  "timeline": "3 months",
  "cover_letter": "We are excited to work on this project..."
}
```

#### `GET /rfp/responses/:responseId`

Get specific response details.

#### `PUT /rfp/responses/:responseId`

Update a response.

#### `DELETE /rfp/responses/:responseId`

Delete a response.

#### `PUT /rfp/responses/:responseId/submit`

Submit a response (change status to Submitted).

#### `PUT /rfp/responses/:responseId/approve`

Approve a response (buyers only).

#### `PUT /rfp/responses/:responseId/reject`

Reject a response (buyers only).

**Request Body:**
```json
{
  "rejection_reason": "Budget too high"
}
```

#### `PUT /rfp/responses/:responseId/award`

Award a response (buyers only).

#### `PUT /rfp/responses/:responseId/move-to-review`

Move response to review status (buyers only).

### Documents

#### `POST /rfp/documents`

Upload document for RFP.

**Request Body:** Multipart form data
- `file`: Document file
- `rfp_version_id`: RFP version ID
- `file_type`: Document type (pdf, image, docx)

#### `POST /rfp/responses/:responseId/documents`

Upload document for response.

**Request Body:** Multipart form data
- `file`: Document file
- `file_type`: Document type

#### `DELETE /rfp/documents/:documentId`

Delete a document.

**Request Body:**
```json
{
  "rfp_version_id": "version-uuid" // or "responseId": "response-uuid"
}
```

### Notifications

#### `GET /notifications`

Get user's notifications.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `unread_only` (boolean): Filter unread notifications

#### `PUT /notifications/:id/read`

Mark notification as read.

#### `PUT /notifications/read-all`

Mark all notifications as read.

### Audit Trail

#### `GET /audit/my`

Get user's audit trail.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `search` (string): Search term
- `action` (string): Filter by action type
- `gte___created_at` (date): From date filter
- `lte___created_at` (date): To date filter

#### `GET /audit/target/:targetType/:targetId`

Get audit trail for specific target.

#### `GET /audit/all`

Get all audit trails (admin only).

## Status Codes

### RFP Statuses
- `Draft`: Initial state, only visible to creator
- `Published`: Visible to all suppliers
- `Closed`: No longer accepting responses
- `Awarded`: RFP has been awarded to a supplier
- `Cancelled`: RFP has been cancelled

### Response Statuses
- `Draft`: Initial state, only visible to supplier
- `Submitted`: Submitted for review
- `Under Review`: Being reviewed by buyer
- `Approved`: Approved by buyer
- `Rejected`: Rejected by buyer
- `Awarded`: Response has been awarded

## Error Responses

All endpoints return consistent error responses:

```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "field_name",
      "message": "Validation error message"
    }
  ]
}
```

## Pagination

Most list endpoints support pagination with the following response format:

```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

## Filtering

Many endpoints support advanced filtering using the following format:

- `eq___field`: Equal to value
- `neq___field`: Not equal to value
- `gte___field`: Greater than or equal to value
- `lte___field`: Less than or equal to value
- `gt___field`: Greater than value
- `lt___field`: Less than value
- `contains___field`: Contains substring
- `in___field`: Value in array (comma-separated)
- `not_in___field`: Value not in array (comma-separated)

## File Upload

File uploads support the following formats:
- **Documents**: PDF, DOC, DOCX
- **Images**: JPG, PNG, GIF
- **Maximum size**: 10MB per file

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute
- **File uploads**: 10 requests per minute
- **Other endpoints**: 100 requests per minute

## WebSocket Events

### Client to Server
- `join_room`: Join a specific room for notifications
- `leave_room`: Leave a room

### Server to Client
- `rfp_published`: New RFP published
- `response_submitted`: New response submitted
- `rfp_status_changed`: RFP status updated
- `response_status_changed`: Response status updated
- `rfp_awarded`: RFP awarded to supplier
- `notification`: New notification received
