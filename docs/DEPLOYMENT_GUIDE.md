# RFPFlow Deployment Guide

This guide provides comprehensive instructions for deploying RFPFlow to production environments.

## 🏗 Architecture Overview

RFPFlow consists of three main components:
- **Backend API**: Node.js/Express server with PostgreSQL database
- **Frontend SPA**: React application served statically
- **File Storage**: Cloudinary for document management
- **Email Service**: SendGrid for notifications

## 🌐 Deployment Options

### Option 1: Separate Services (Recommended)
- **Backend**: Railway, Heroku, or DigitalOcean App Platform
- **Frontend**: Vercel, Netlify, or AWS S3 + CloudFront
- **Database**: Railway PostgreSQL, Heroku Postgres, or AWS RDS

### Option 2: Full-Stack Platform
- **All-in-one**: Railway, Render, or DigitalOcean App Platform
- **Database**: Managed PostgreSQL service
- **CDN**: Platform-provided or external CDN

## 📋 Prerequisites

### Required Accounts
- [ ] **Railway/Heroku/DigitalOcean**: For backend hosting
- [ ] **Vercel/Netlify**: For frontend hosting
- [ ] **Cloudinary**: For file storage ([Sign up](https://cloudinary.com))
- [ ] **SendGrid**: For email service ([Sign up](https://sendgrid.com))
- [ ] **Domain Provider**: For custom domain (optional)

### Required Tools
```bash
# Install deployment tools
npm install -g vercel         # For Vercel deployment
npm install -g netlify-cli    # For Netlify deployment
npm install -g @railway/cli   # For Railway deployment
```

## 🗄 Database Setup

### Railway PostgreSQL (Recommended)

1. **Create Railway Project**:
```bash
railway login
railway new --name rfpflow-backend
cd backend
railway add postgres
```

2. **Get Database URL**:
```bash
railway variables
# Copy the DATABASE_URL
```

3. **Run Migrations**:
```bash
# Set DATABASE_URL in .env
pnpm prisma migrate deploy
pnpm prisma db seed
```

### Alternative: Heroku Postgres

1. **Create Heroku App**:
```bash
heroku create rfpflow-backend
heroku addons:create heroku-postgresql:hobby-dev
```

2. **Get Database URL**:
```bash
heroku config:get DATABASE_URL
```

### Alternative: AWS RDS

1. **Create RDS Instance**:
- Engine: PostgreSQL 14+
- Instance Class: db.t3.micro (for testing)
- Storage: 20GB SSD
- Multi-AZ: No (for cost savings)

2. **Configure Security Group**:
- Allow inbound on port 5432 from your backend service

## 🚀 Backend Deployment

### Railway Deployment (Recommended)

1. **Initialize Railway**:
```bash
cd backend
railway login
railway init
```

2. **Set Environment Variables**:
```bash
railway variables set DATABASE_URL="your-database-url"
railway variables set JWT_SECRET="your-jwt-secret"
railway variables set SENDGRID_API_KEY="your-sendgrid-key"
railway variables set FROM_EMAIL="noreply@yourdomain.com"
railway variables set CLOUDINARY_CLOUD_NAME="your-cloud-name"
railway variables set CLOUDINARY_API_KEY="your-api-key"
railway variables set CLOUDINARY_API_SECRET="your-api-secret"
railway variables set FRONTEND_URL="https://your-frontend-domain.com"
```

3. **Deploy**:
```bash
railway up
```

4. **Run Database Migrations**:
```bash
railway run pnpm prisma migrate deploy
railway run pnpm prisma db seed
```

### Heroku Deployment

1. **Create and Configure App**:
```bash
cd backend
heroku create rfpflow-backend
heroku buildpacks:add heroku/nodejs
```

2. **Set Environment Variables**:
```bash
heroku config:set JWT_SECRET="your-jwt-secret"
heroku config:set SENDGRID_API_KEY="your-sendgrid-key"
heroku config:set FROM_EMAIL="noreply@yourdomain.com"
heroku config:set CLOUDINARY_CLOUD_NAME="your-cloud-name"
heroku config:set CLOUDINARY_API_KEY="your-api-key"
heroku config:set CLOUDINARY_API_SECRET="your-api-secret"
heroku config:set FRONTEND_URL="https://your-frontend-domain.com"
```

3. **Add Procfile**:
```bash
echo "web: pnpm dev" > Procfile
```

4. **Deploy**:
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

5. **Run Migrations**:
```bash
heroku run pnpm prisma migrate deploy
heroku run pnpm prisma db seed
```

### DigitalOcean App Platform

1. **Create App Spec** (`app.yaml`):
```yaml
name: rfpflow-backend
services:
- name: api
  source_dir: /backend
  github:
    repo: your-username/rfpflow
    branch: main
  run_command: pnpm dev
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}
  - key: JWT_SECRET
    value: your-jwt-secret
  - key: SENDGRID_API_KEY
    value: your-sendgrid-key
  - key: FROM_EMAIL
    value: noreply@yourdomain.com
  - key: CLOUDINARY_CLOUD_NAME
    value: your-cloud-name
  - key: CLOUDINARY_API_KEY
    value: your-api-key
  - key: CLOUDINARY_API_SECRET
    value: your-api-secret
  - key: FRONTEND_URL
    value: https://your-frontend-domain.com
databases:
- name: db
  engine: PG
  version: "14"
```

2. **Deploy**:
```bash
doctl apps create --spec app.yaml
```

## 🌍 Frontend Deployment

### Vercel Deployment (Recommended)

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Configure Environment**:
Create `frontend/.env.production`:
```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_WEBSOCKET_URL=https://your-backend-domain.com
```

3. **Deploy**:
```bash
cd frontend
vercel --prod
```

4. **Configure Domain** (optional):
```bash
vercel domains add yourdomain.com
vercel alias set your-project-name.vercel.app yourdomain.com
```

### Netlify Deployment

1. **Build and Deploy**:
```bash
cd frontend
netlify deploy --prod --dir=dist
```

2. **Configure Environment Variables**:
- Go to Netlify Dashboard → Site Settings → Environment Variables
- Add:
  - `VITE_API_BASE_URL`: `https://your-backend-domain.com/api`
  - `VITE_WEBSOCKET_URL`: `https://your-backend-domain.com`

3. **Configure Redirects**:
Create `frontend/public/_redirects`:
```
/*    /index.html   200
```

### AWS S3 + CloudFront

1. **Build Application**:
```bash
cd frontend
pnpm build
```

2. **Create S3 Bucket**:
```bash
aws s3 mb s3://rfpflow-frontend
aws s3 sync dist/ s3://rfpflow-frontend --delete
```

3. **Configure S3 for Static Hosting**:
```json
{
  "IndexDocument": {
    "Suffix": "index.html"
  },
  "ErrorDocument": {
    "Key": "index.html"
  }
}
```

4. **Create CloudFront Distribution**:
- Origin: S3 bucket
- Default Root Object: `index.html`
- Error Pages: 404 → `/index.html` (for SPA routing)

## 🔧 Configuration

### Environment Variables

#### Backend Environment Variables
```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"

# Email Service
SENDGRID_API_KEY="SG.xxxxxx"
FROM_EMAIL="noreply@yourdomain.com"

# File Storage
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# CORS
FRONTEND_URL="https://yourdomain.com"

# Optional
NODE_ENV="production"
PORT="3000"
```

#### Frontend Environment Variables
```env
# API Configuration
VITE_API_BASE_URL="https://api.yourdomain.com/api"
VITE_WEBSOCKET_URL="https://api.yourdomain.com"

# Optional
VITE_APP_NAME="RFPFlow"
VITE_APP_VERSION="1.0.0"
```

### SSL/HTTPS Configuration

Most platforms provide automatic HTTPS. For custom configurations:

1. **Let's Encrypt** (for self-hosted):
```bash
certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

2. **Cloudflare** (for enhanced security):
- Add your domain to Cloudflare
- Configure SSL/TLS settings
- Enable security features

### CORS Configuration

Update backend CORS settings for production:

```typescript
// backend/src/index.ts
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'https://yourdomain.com',
    'https://www.yourdomain.com'
  ],
  credentials: true
}));
```

## 🔐 Security Checklist

### Backend Security
- [ ] Use HTTPS in production
- [ ] Set strong JWT secret (min 32 characters)
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Validate all inputs
- [ ] Use parameterized queries (Prisma handles this)
- [ ] Keep dependencies updated

### Database Security
- [ ] Use SSL connections
- [ ] Restrict network access
- [ ] Regular backups
- [ ] Strong passwords
- [ ] Monitor for suspicious activity

### API Security
- [ ] Implement rate limiting
- [ ] Use HTTPS only
- [ ] Validate JWT tokens
- [ ] Sanitize inputs
- [ ] Log security events

### Frontend Security
- [ ] Use HTTPS
- [ ] Secure cookie settings
- [ ] Content Security Policy
- [ ] No sensitive data in localStorage
- [ ] Regular dependency updates

## 📊 Monitoring & Maintenance

### Application Monitoring

1. **Error Tracking** (Sentry):
```bash
npm install @sentry/node @sentry/react
```

2. **Performance Monitoring**:
- Railway: Built-in metrics
- Heroku: Heroku Metrics
- Custom: Prometheus + Grafana

3. **Uptime Monitoring**:
- UptimeRobot
- Pingdom
- StatusCake

### Database Monitoring

1. **Connection Monitoring**:
```typescript
// Add to backend health check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});
```

2. **Performance Monitoring**:
- Query performance analysis
- Connection pool monitoring
- Slow query identification

### Backup Strategy

1. **Database Backups**:
```bash
# Automated daily backups
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

2. **File Storage Backups**:
- Cloudinary provides built-in redundancy
- Consider additional backup for critical files

3. **Code Backups**:
- Git repository (GitHub/GitLab)
- Multiple branches and tags
- Documentation backups

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check database connectivity
psql $DATABASE_URL

# Verify connection string format
# postgresql://user:password@host:port/database
```

#### CORS Issues
```typescript
// Temporary debugging (remove in production)
app.use(cors({ origin: true }));
```

#### Environment Variable Issues
```bash
# Check variables are set
echo $DATABASE_URL
railway variables list
heroku config
```

#### Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules
rm package-lock.json
pnpm install
```

### Performance Issues

#### Slow Database Queries
```sql
-- Enable query logging
SET log_statement = 'all';
SET log_min_duration_statement = 100;
```

#### Frontend Performance
```bash
# Analyze bundle size
pnpm build
npx webpack-bundle-analyzer dist/assets/*.js
```

### Memory Issues
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" pnpm dev
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Load balancers for multiple backend instances
- Database read replicas
- CDN for static assets
- Microservices architecture

### Vertical Scaling
- Increase server resources
- Database optimization
- Memory management
- CPU optimization

### Caching Strategy
- Redis for session storage
- Database query caching
- CDN for static content
- Application-level caching

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      # Backend tests
      - name: Test Backend
        run: |
          cd backend
          pnpm install
          pnpm test
      
      # Frontend tests
      - name: Test Frontend
        run: |
          cd frontend
          pnpm install
          pnpm test:run

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          railway login --token ${{ secrets.RAILWAY_TOKEN }}
          railway up

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: |
          cd frontend
          vercel --token ${{ secrets.VERCEL_TOKEN }} --prod
```

## 📋 Post-Deployment Checklist

### Functional Testing
- [ ] User registration and login
- [ ] RFP creation and management
- [ ] Response submission and review
- [ ] File upload and download
- [ ] Email notifications
- [ ] Real-time updates
- [ ] Search and filtering
- [ ] Export functionality

### Performance Testing
- [ ] Page load times < 3 seconds
- [ ] API response times < 500ms
- [ ] Database query performance
- [ ] File upload/download speed
- [ ] WebSocket connection stability

### Security Testing
- [ ] HTTPS enforcement
- [ ] Authentication flows
- [ ] Authorization checks
- [ ] Input validation
- [ ] XSS protection
- [ ] CSRF protection

### Monitoring Setup
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Uptime monitoring enabled
- [ ] Database monitoring set up
- [ ] Alert notifications configured

## 📞 Support and Maintenance

### Regular Maintenance Tasks
- [ ] **Weekly**: Check error logs and performance metrics
- [ ] **Monthly**: Update dependencies and security patches
- [ ] **Quarterly**: Review and optimize database performance
- [ ] **Annually**: Security audit and penetration testing

### Emergency Procedures
1. **Service Outage**: Check status dashboards and error logs
2. **Database Issues**: Verify connection and check query performance
3. **Security Incident**: Immediately revoke affected tokens and investigate
4. **Performance Degradation**: Review metrics and scale resources if needed

---

This deployment guide provides comprehensive instructions for production deployment of RFPFlow. For additional support, refer to the platform-specific documentation or create an issue in the project repository.
