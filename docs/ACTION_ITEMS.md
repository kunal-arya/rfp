# RFP System - Actionable Checklist

This checklist is derived from the `docs/requirements.md` file to track our implementation progress.

## Phase 1: Backend Setup & Core Models

-   [X] Set up Node.js/Express/TypeScript project structure.
-   [X] Refactor authentication to Controller-Service pattern.
-   [X] Implement dynamic, database-driven RBAC.
-   [X] Create database seeding for roles.
-   [X] Install core dependencies (Express, pg for database, etc.).
-   [X] Establish database connection.
-   [X] Define and implement final database schema using an ORM/migration tool (e.g., Prisma, TypeORM).
-   [X] Create initial database migration files.

## Phase 2: Core Features

### User Management & Authentication
-   [X] Implement User registration endpoint (`/api/auth/register`).
-   [X] Implement User login endpoint (`/api/auth/login`) returning a JWT.
-   [X] Implement middleware for JWT-based authentication and role-based access control.

### RFP Lifecycle Management
-   [X] **Buyer:** Create endpoint to create a new RFP (`POST /api/rfps`).
-   [X] **Buyer:** Create endpoint to publish an RFP (update status).
-   [X] **Supplier:** Create endpoint to browse/list published RFPs (`GET /api/rfps`).
-   [X] **Supplier:** Create endpoint to submit a response to an RFP (`POST /api/rfps/:id/responses`).
-   [X] **Buyer:** Create endpoint to review responses for an RFP.
-   [X] **Buyer:** Create endpoint to approve/reject a response (update status).

### Document Management & Search
-   [X] Implement file upload endpoint for RFP documents.
-   [X] Implement file upload endpoint for response documents.

### Notifications & Dashboards
-   [ ] Set up email service integration (e.g., SendGrid).
-   [ ] Implement logic to trigger email notifications on status changes.
-   [ ] **API:** Create endpoint for a role-specific dashboard (`GET /api/dashboard`).

### Real-time Notifications (WebSockets)
-   [ ] Set up WebSocket server (e.g., with Socket.IO).
-   [ ] **Notify Suppliers:** When a new RFP is published.
-   [ ] **Notify Buyer:** When a supplier submits a response.
-   [ ] **Notify Supplier:** When an RFP status changes.

## Phase 3: Frontend

-   [ ] Set up React/TypeScript project (e.g., with Vite or Create React App).
-   [ ] Design and implement registration and login pages.
-   [ ] Create a Buyer dashboard to create and manage RFPs.
-   [ ] Create a Supplier dashboard to browse RFPs and submit responses.
-   [ ] Implement responsive design for all pages.
-   [ ] Implement loading states and error handling.

## Phase 4: Documentation & Deployment

-   [ ] Create API documentation (Swagger/OpenAPI).
-   [ ] Write `README.md` with setup and deployment instructions.
-   [ ] Write AI Usage Report.
-   [ ] Deploy backend and frontend services.

