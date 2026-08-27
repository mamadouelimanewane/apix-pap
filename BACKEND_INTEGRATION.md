# APIX-PAP Backend Integration Guide

## Vue d'ensemble

APIX-PAP v1.0.2 est entièrement préparé pour l'intégration avec un backend réel. Le frontend utilise `ApiServiceV2` qui peut basculer vers n'importe quel backend.

## Architecture actuelle

### Frontend (React 19 + Vite)
- **Services**: ApiServiceV2, WorkflowService, NotificationService
- **State**: React hooks + React Context (Auth, Notifications)
- **Storage**: localStorage (temporaire) + localStorage workflows
- **Testing**: Vitest + React Testing Library

### Backend requis

```
┌─────────────────────────────────────────┐
│      Frontend (React 19 + Vite)         │
│  - ApiServiceV2 (fetch-based HTTP)      │
│  - WorkflowService (localStorage)       │
│  - Custom React Hooks                   │
└──────────────┬──────────────────────────┘
               │ HTTP/REST or GraphQL
┌──────────────▼──────────────────────────┐
│    Backend (Node/FastAPI/Django)        │
│  - RESTful API endpoints                │
│  - Database (MongoDB/PostgreSQL)        │
│  - Authentication (JWT)                 │
│  - Workflow engine                      │
└──────────────────────────────────────────┘
```

## Endpoints requis

### Authentication
```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/profile
```

### PAP Management
```
GET    /api/pap/list              # List with pagination & filters
GET    /api/pap/:papCode          # Get details
POST   /api/pap/create            # Create new PAP
PUT    /api/pap/:papCode          # Update PAP
DELETE /api/pap/:papCode          # Delete PAP (if needed)
GET    /api/pap/search?q=...      # Global search
```

### Biens (Properties)
```
GET    /api/bien/list/:papCode    # List properties for PAP
GET    /api/bien/:bienCode        # Get property details
POST   /api/bien/create/:papCode  # Add property
PUT    /api/bien/:bienCode        # Update property
DELETE /api/bien/:bienCode        # Delete property
```

### Evaluations
```
POST   /api/evaluation/create/:bienCode     # Create evaluation
GET    /api/evaluation/list                 # List evaluations
GET    /api/evaluation/:evaluationId        # Get details
PUT    /api/evaluation/:evaluationId        # Update evaluation
```

### Compensation
```
POST   /api/compensation/submit/:bienCode       # Submit for compensation
GET    /api/compensation/list                   # List files
POST   /api/compensation/review/:dossierId      # Review
POST   /api/compensation/approve/:dossierId     # Approve
GET    /api/compensation/:dossierId             # Get details
```

### Payments
```
POST   /api/payment/initiate/:compensationId    # Initiate payment
POST   /api/payment/confirm/:paiementId         # Confirm payment
GET    /api/payment/list                        # List payments
GET    /api/payment/status/:paiementId          # Get status
```

### Reclamations
```
POST   /api/reclamation/create/:papCode   # Create complaint
GET    /api/reclamation/list/:papCode     # List complaints
POST   /api/reclamation/treat/:reclamationId  # Treat complaint
GET    /api/reclamation/:reclamationId    # Get details
```

### Communications
```
GET    /api/communications/messages/:papCode  # Get messages
POST   /api/communications/message/:papCode   # Send message
GET    /api/communications/notifications      # Get notifications
PUT    /api/communications/notification/:notifId/read
```

### Analytics & Reports
```
GET    /api/analytics/:type?period=30d
GET    /api/reports/generate/:type
GET    /api/dashboard/metrics
```

## Implementation Steps

### Phase 1: API Service Replacement (1-2 days)

1. **Configure API base URL**
```javascript
// .env.development
VITE_APP_API_URL=http://localhost:3000/api

// .env.production
VITE_APP_API_URL=https://api.apix-pap.sn/api
```

2. **Test endpoints**
```bash
# Update ApiServiceV2 with actual backend
# No code changes needed - just configuration

npm run dev
# Test each endpoint in browser console
```

### Phase 2: Database Migration (3-5 days)

1. **Migrate localStorage workflows to database**

```javascript
// Migration script
const workflows = JSON.parse(localStorage.getItem('apix_pap_workflows'));

// Send to backend
for (const [papCode, workflow] of Object.entries(workflows)) {
  await fetch('/api/workflow/migrate', {
    method: 'POST',
    body: JSON.stringify(workflow)
  });
}
```

2. **Replace WorkflowService**

```javascript
// New WorkflowService using API instead of localStorage
export class WorkflowService {
  async createWorkflow(papCode, papData) {
    return apiService.makeRequest('/workflow/create', {
      method: 'POST',
      data: { papCode, papData }
    });
  }
  
  async updateWorkflow(papCode, phase, state, data) {
    return apiService.makeRequest(`/workflow/${papCode}/transition`, {
      method: 'POST',
      data: { phase, state, data }
    });
  }
}
```

### Phase 3: Authentication Integration (2-3 days)

1. **JWT Token Management**

```javascript
// Update AuthContext
const login = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  
  const { token, user } = await response.json();
  localStorage.setItem('jwtToken', token);
  setUser(user);
};
```

2. **Add token to all requests**
- Already implemented in ApiServiceV2
- Authorization header automatically added

### Phase 4: Testing & Optimization (2-3 days)

1. **Run test suite**
```bash
npm run test
npm run test:coverage
```

2. **Performance monitoring**
```javascript
import { PerformanceMonitor } from '@/utils/PerformanceOptimization';

const monitor = new PerformanceMonitor('api-calls');
// Monitor API response times
```

3. **Staging environment testing**

## Database Schema

### Workflows Collection
```javascript
{
  _id: ObjectId,
  papCode: String,
  papName: String,
  createdAt: Date,
  currentPhase: Number,
  currentState: String,
  status: String, // in_progress, completed, rejected
  closedAt: Date,
  data: {
    phase1: { /* PAP data */ },
    phase2: { /* Property data */ },
    phase3: { /* Compensation */ },
    phase4: { /* Payment */ },
    phase5: { /* Complaints */ },
    phase6: { /* Closure */ }
  },
  history: [
    {
      phase: Number,
      state: String,
      timestamp: Date,
      action: String,
      userId: String
    }
  ]
}
```

### PAP Collection
```javascript
{
  _id: ObjectId,
  papCode: String, // unique
  nom: String,
  prenom: String,
  dateNaissance: Date,
  zone: String,
  sector: String,
  createdAt: Date,
  updatedAt: Date,
  status: String
}
```

## Testing

### Run Tests
```bash
npm install --save-dev vitest @testing-library/react jsdom

# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Deployment Checklist

- [ ] Backend API deployed and tested
- [ ] Database configured and seeded
- [ ] Authentication endpoint working
- [ ] All 40+ endpoints tested
- [ ] CORS configured properly
- [ ] Rate limiting implemented
- [ ] Error logging configured
- [ ] Performance monitoring setup
- [ ] Staging environment testing complete
- [ ] Data migration from localStorage done
- [ ] Security audit completed
- [ ] SSL certificate configured
- [ ] CDN setup for static assets
- [ ] Backup and disaster recovery plan

## Support & Documentation

### Useful Resources
- [ApiServiceV2.js](src/services/ApiServiceV2.js) - API service implementation
- [WorkflowService.js](src/services/WorkflowService.js) - Workflow management
- [PerformanceOptimization.js](src/utils/PerformanceOptimization.js) - Performance utilities
- [Tests](src/__tests__/WorkflowService.test.js) - Test examples

### Backend Examples

#### Node.js/Express
```bash
# Scaffold backend
git clone https://github.com/expressjs/generator.git backend-template
cd backend-template && npm install

# Install dependencies
npm install mongoose jsonwebtoken cors dotenv
```

#### FastAPI/Python
```bash
# Scaffold backend
fastapi project-name
cd project-name

# Install dependencies
pip install fastapi uvicorn sqlalchemy psycopg2
```

## Next Steps

1. **Choose your backend stack** (Node/Express, FastAPI, Django, etc.)
2. **Implement endpoints** following the specification above
3. **Set up database** (MongoDB or PostgreSQL recommended)
4. **Run test suite** to verify integration
5. **Deploy to staging** and validate end-to-end workflows
6. **Load testing** with 100+ concurrent users
7. **Go to production** with monitoring

## Questions?

Contact: Mamadou Dia (mamadouastelwane@gmail.com)
