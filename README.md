# RFPFlow - Request for Proposal Management System

A comprehensive full-stack RFP (Request for Proposal) management system built with modern technologies and AI assistance.

## 🌟 Overview

RFPFlow streamlines the entire RFP lifecycle from creation to completion, enabling seamless collaboration between buyers and suppliers with role-based access control, real-time notifications, and comprehensive document management.

## ✨ Key Features

### 🔐 Authentication & Authorization
- **JWT-based Authentication**: Secure token-based authentication system
- **Dynamic RBAC**: Database-driven role-based access control
- **Fine-grained Permissions**: Granular control over user actions and resource access

### 📋 RFP Lifecycle Management
- **Complete CRUD Operations**: Create, read, update, delete RFPs
- **Status Workflow**: Draft → Published → Under Review → Approved/Rejected
- **Version Control**: Track RFP changes and iterations
- **Deadline Management**: Automated deadline tracking and notifications

### 🔍 Advanced Search & Filtering
- **Full-text Search**: Database-driven search across RFP content
- **Multi-faceted Filtering**: Filter by status, date range, budget, keywords
- **Real-time Results**: Instant search with debounced queries

### 📄 Document Management
- **File Upload/Download**: Cloudinary integration for secure file storage
- **Multiple Format Support**: PDF, Word, Excel, images
- **Document Versioning**: Track document changes and history

### 🔔 Real-time Notifications
- **WebSocket Integration**: Socket.IO for instant updates
- **Email Notifications**: SendGrid for automated email alerts
- **Event-driven Architecture**: Automatic notifications on status changes

### 📊 Data Visualization & Analytics
- **Interactive Charts**: RFP status distribution and analytics
- **Role-specific Dashboards**: Customized views for buyers and suppliers
- **Export Capabilities**: PDF/Excel export with print-friendly views

### 🚀 Modern UI/UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS v4
- **Component Library**: shadcn/ui for consistent design system
- **Real-time Updates**: Live UI updates via WebSocket integration
- **Bulk Operations**: Multi-select actions with confirmation dialogs

## 🛠 Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JSON Web Tokens (JWT)
- **File Storage**: Cloudinary
- **Email Service**: SendGrid
- **Real-time**: Socket.IO
- **Validation**: Zod schema validation
- **Testing**: Jest with Supertest

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **State Management**: React Query (TanStack Query)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Testing**: Vitest with React Testing Library

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- PostgreSQL database
- Cloudinary account (for file uploads)
- SendGrid account (for email notifications)

### Backend Setup

1. **Clone and navigate to backend**:
```bash
git clone <repository-url>
cd rfp/backend
```

2. **Install dependencies**:
```bash
pnpm install
```

3. **Environment variables** - Create `.env` file:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/rfp_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# SendGrid
SENDGRID_API_KEY="your-sendgrid-api-key"
FROM_EMAIL="noreply@yourdomain.com"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Frontend URL
FRONTEND_URL="http://localhost:5173"
```

4. **Database setup**:
```bash
# Run migrations
pnpm prisma migrate deploy

# Seed default data
pnpm prisma db seed
```

5. **Start development server**:
```bash
pnpm dev
```

The backend will be available at `http://localhost:3000`

### Frontend Setup

1. **Navigate to frontend**:
```bash
cd ../frontend
```

2. **Install dependencies**:
```bash
pnpm install
```

3. **Environment variables** - Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WEBSOCKET_URL=http://localhost:3000
```

**Important**: The `VITE_WEBSOCKET_URL` should point to the backend server root (without `/api` path) for WebSocket connections.

4. **Start development server**:
```bash
pnpm dev
```

The frontend will be available at `http://localhost:5173`

## 🧪 Testing

### Backend Testing
```bash
cd backend
pnpm test              # Run all tests
pnpm test:watch        # Run tests in watch mode
pnpm test:coverage     # Run tests with coverage report
```

### Frontend Testing
```bash
cd frontend
pnpm test              # Run tests in watch mode
pnpm test:run          # Run all tests once
pnpm test:coverage     # Run tests with coverage report
```

## 📚 API Documentation

The API documentation is available at:
- **Development**: `http://localhost:3000/api-docs`
- **Swagger JSON**: `http://localhost:3000/api-docs.json`

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

#### RFPs
- `GET /api/rfp` - Get user's RFPs
- `POST /api/rfp` - Create new RFP
- `GET /api/rfp/:id` - Get RFP details
- `PUT /api/rfp/:id` - Update RFP
- `DELETE /api/rfp/:id` - Delete RFP
- `PUT /api/rfp/:id/publish` - Publish RFP

#### Responses
- `POST /api/rfp/:id/responses` - Submit response to RFP
- `GET /api/rfp/my-responses` - Get user's responses
- `GET /api/rfp/:id/responses` - Get responses for RFP

#### Dashboard
- `GET /api/dashboard` - Get dashboard data
- `GET /api/dashboard/stats` - Get dashboard statistics

For complete API documentation, see [docs/api-docs.md](./docs/api-docs.md)

## 🗄 Database Schema

The system uses PostgreSQL with the following key entities:

- **Users**: Authentication and profile information
- **Roles**: Dynamic role definitions with JSON permissions
- **RFPs**: Request for proposal records
- **RFPVersions**: Versioned RFP content
- **SupplierResponses**: Supplier responses to RFPs
- **Documents**: File attachments and metadata
- **Notifications**: System notifications and templates

For detailed schema information, see [docs/database-schema.md](./docs/database-schema.md)

## 🔑 Permissions System

The system implements a flexible RBAC model with:

### Default Roles
- **Buyer**: Can create/manage RFPs, review responses
- **Supplier**: Can view published RFPs, submit responses

### Permission Structure
```json
{
  "resource": {
    "action": {
      "allowed": boolean,
      "scope": "own" | "rfp_owner" | "published",
      "allowed_statuses": ["status1", "status2"]
    }
  }
}
```

For complete permissions documentation, see [docs/permissions.md](./docs/permissions.md)

## 🔄 Real-time Features

### WebSocket Events
- `rfp_published` - New RFP published (to suppliers)
- `response_submitted` - New response submitted (to buyers)
- `rfp_status_changed` - RFP status updated (to relevant users)

### Email Notifications
- RFP published notifications
- Response submission alerts
- Status change notifications
- Deadline reminders

## 📁 Project Structure

```
rfp/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Custom middleware
│   │   ├── utils/           # Utility functions
│   │   ├── validations/     # Zod schemas
│   │   └── __tests__/       # Test files
│   ├── prisma/              # Database schema and migrations
│   └── docs/                # Backend documentation
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── contexts/        # React contexts
│   │   ├── apis/            # API layer
│   │   ├── utils/           # Utility functions
│   │   └── test/            # Test utilities
├── docs/                    # Project documentation
└── README.md               # This file
```

## 🤖 AI Usage Report

This project was developed with significant AI assistance, demonstrating effective human-AI collaboration:

### AI-Assisted Development Areas

#### Backend Development
- **Architecture Design**: AI helped design the Controller-Service pattern and RBAC system
- **Database Schema**: Prisma schema design with complex relationships
- **API Implementation**: RESTful endpoints with proper error handling
- **Authentication**: JWT implementation with dynamic permissions
- **Real-time Features**: Socket.IO integration for live notifications

#### Frontend Development
- **Component Architecture**: React component design with TypeScript
- **State Management**: React Query integration for server state
- **UI/UX Design**: Modern interface with Tailwind CSS and shadcn/ui
- **Form Handling**: Complex forms with validation and error handling
- **Real-time Integration**: WebSocket client implementation

#### Testing & Quality Assurance
- **Test Strategy**: Comprehensive testing approach with Jest and Vitest
- **Test Implementation**: Unit, integration, and component tests
- **Mocking Strategy**: Effective mocking of external dependencies
- **Bug Identification**: AI-assisted debugging and issue resolution

#### Documentation
- **API Documentation**: Comprehensive OpenAPI/Swagger documentation
- **Code Documentation**: Clear inline documentation and comments
- **User Documentation**: Setup guides and usage instructions

### Productivity Improvements
- **Code Generation**: ~60% of boilerplate code generated with AI assistance
- **Problem Solving**: Rapid resolution of complex technical challenges
- **Best Practices**: Implementation of industry-standard patterns and practices
- **Error Handling**: Comprehensive error scenarios and edge cases covered

### Code Quality Maintenance
- **Consistent Patterns**: Maintained architectural consistency throughout
- **Type Safety**: Full TypeScript coverage with proper type definitions
- **Testing Coverage**: Comprehensive test suite with high coverage
- **Performance**: Optimized queries and efficient data handling

## 🚀 Deployment

### Backend Deployment (Railway/Heroku)
1. Set up production database (PostgreSQL)
2. Configure environment variables
3. Deploy with `git push` or Railway CLI
4. Run database migrations in production

### Frontend Deployment (Vercel/Netlify)
1. Build production bundle: `pnpm build`
2. Configure environment variables
3. Deploy to hosting platform
4. Set up custom domain (optional)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies and best practices
- AI-assisted development for enhanced productivity
- Open source libraries and frameworks that made this possible
- shadcn/ui for the excellent component library
- Tailwind CSS for the utility-first styling approach

---

**RFPFlow** - Streamline Your RFP Process with Modern Technology 🚀
