# Architecture Document - Smart Roster Management System

## System Overview

The Smart Roster Management System follows a three-tier architecture:

```
┌─────────────────────────────────────────┐
│         Presentation Layer               │
│    (React Frontend - Port 5173)         │
└──────────────┬──────────────────────────┘
               │ HTTP/REST
┌──────────────┴──────────────────────────┐
│         Application Layer                │
│    (Express Backend - Port 5000)        │
└──────────────┬──────────────────────────┘
               │ Mongoose ODM
┌──────────────┴──────────────────────────┐
│          Data Layer                      │
│    (MongoDB - Port 27017)               │
└─────────────────────────────────────────┘
```

## Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.2.0 | UI framework |
| Vite | 5.0.8 | Build tool & dev server |
| React Router DOM | 6.21.1 | Client-side routing |
| Tailwind CSS | 3.4.0 | Utility-first CSS |
| Axios | 1.6.5 | HTTP client |
| React Hot Toast | 2.4.1 | Notifications |
| Lucide React | 0.303.0 | Icon library |
| date-fns | 3.0.6 | Date manipulation |
| ExcelJS | 4.4.0 | Excel export (planned) |

### Backend Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 16+ | Runtime environment |
| Express | 4.18.2 | Web framework |
| MongoDB | 5+ | Database |
| Mongoose | 8.0.3 | MongoDB ODM |
| JWT | 9.0.2 | Authentication |
| bcryptjs | 2.4.3 | Password hashing |
| dotenv | 16.3.1 | Environment config |
| CORS | 2.8.5 | Cross-origin requests |
| Morgan | 1.10.0 | HTTP logger |
| Jest | 29.7.0 | Testing framework |

## Architectural Patterns

### 1. Backend Architecture

#### **MVC Pattern with Service Layer**

```
┌─────────────────────────────────────────────────┐
│                   Routes                         │
│  (Define endpoints & HTTP methods)              │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────┐
│                Controllers                       │
│  (Handle requests, call services, send response)│
└──────────────────┬──────────────────────────────┘
                   │
           ┌───────┴──────┐
           │              │
┌──────────┴──────┐  ┌───┴──────────┐
│    Services     │  │    Models     │
│ (Business logic)│  │ (Data schema) │
└─────────────────┘  └───────────────┘
```

**Example Flow:**

```javascript
// 1. Route definition
router.post('/generate', rosterController.generateRoster);

// 2. Controller handles request
exports.generateRoster = async (req, res) => {
  // 3. Call service
  const scheduler = new SchedulingEngine(month, year, pods, brands);
  const result = await scheduler.generateSchedule();
  
  // 4. Use models to save
  const roster = await Roster.create({...});
  
  // 5. Send response
  res.status(201).json({ success: true, data: roster });
};
```

### 2. Frontend Architecture

#### **Component Hierarchy**

```
App.jsx
├── AuthProvider (Context)
│   └── Router
│       ├── PublicRoute
│       │   └── Login
│       └── ProtectedRoute
│           └── Layout
│               ├── Sidebar
│               ├── TopBar
│               └── Pages
│                   ├── Dashboard
│                   ├── Employees
│                   ├── Brands
│                   ├── Processes
│                   ├── Pods
│                   ├── Assignments
│                   ├── RosterGenerator
│                   ├── MonthlyRoster
│                   ├── Leaves
│                   ├── Holidays
│                   ├── Conflicts
│                   ├── Reports
│                   └── Settings
```

#### **State Management**

```
┌──────────────────────────────────┐
│        Component State            │
│     (useState for local)          │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│        Context API                │
│   (Global auth state)             │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│        Server State               │
│  (API responses cached locally)   │
└──────────────────────────────────┘
```

## Data Flow Architecture

### 1. Authentication Flow

```
┌────────┐
│ User   │ → enters credentials
└────┬───┘
     │
     ▼
┌────────────┐
│   Login    │ → POST /api/auth/login
│   Page     │
└────┬───────┘
     │
     ▼
┌──────────────┐
│   Backend    │ → verify credentials
│  Controller  │ → generate JWT token
└────┬─────────┘
     │
     ▼
┌────────────┐
│  Response  │ → { token, user }
└────┬───────┘
     │
     ▼
┌────────────┐
│  Frontend  │ → store in localStorage
│  Service   │ → update AuthContext
└────┬───────┘
     │
     ▼
┌────────────┐
│  Redirect  │ → navigate to Dashboard
└────────────┘
```

### 2. Data Fetching Flow

```
┌────────────┐
│  Component │ → useEffect hook
│            │ → calls API service
└────┬───────┘
     │
     ▼
┌────────────┐
│   Axios    │ → adds Authorization header
│ Interceptor│ → makes HTTP request
└────┬───────┘
     │
     ▼
┌────────────┐
│   Backend  │ → auth middleware
│   Route    │ → controller logic
│            │ → database query
└────┬───────┘
     │
     ▼
┌────────────┐
│  Response  │ → { success, data }
└────┬───────┘
     │
     ▼
┌────────────┐
│  Component │ → update state
│            │ → render UI
└────────────┘
```

### 3. Roster Generation Flow

```
User Action
    ↓
Select Month/Year/Filters
    ↓
POST /api/rosters/generate
    ↓
┌─────────────────────────────────┐
│   Scheduling Engine              │
│                                  │
│  1. Load Data                    │
│     - Employees                  │
│     - Brands                     │
│     - Processes                  │
│     - Assignments                │
│     - Leaves                     │
│     - Holidays                   │
│                                  │
│  2. Iterate Dates                │
│     For each day of month:       │
│                                  │
│  3. Process Scheduling           │
│     - Check if should operate    │
│     - Get eligible employees     │
│     - Sort by priority           │
│     - Assign employees           │
│     - Track workload             │
│                                  │
│  4. Conflict Detection           │
│     - Check coverage             │
│     - Identify gaps              │
│     - Find backups               │
│     - Record conflicts           │
│                                  │
│  5. Return Results               │
│     - Schedule array             │
│     - Conflicts array            │
│     - Validation status          │
└─────────────────────────────────┘
    ↓
Save to Database
    ↓
Return to Frontend
    ↓
Display Roster & Conflicts
```

## Database Schema Architecture

### Entity Relationship Diagram

```
┌──────────┐
│   User   │
└──────────┘
     │
     │ createdBy
     ▼
┌──────────┐      ┌───────────┐      ┌──────────┐
│   Pod    │◄─────│  Employee │─────►│  Brand   │
└──────────┘      └───────────┘      └──────────┘
     │                  │                   │
     │                  │ assignedTo        │
     │                  ▼                   │
     │            ┌─────────────┐           │
     │            │ Assignment  │───────────┘
     │            └─────────────┘
     │                  │
     │                  │ for
     │                  ▼
     │            ┌──────────┐
     └───────────►│ Process  │
                  └──────────┘
                       │
                       │ operatesOn
                       ▼
                  ┌────────────┐
                  │   Roster   │
                  └────────────┘
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
        ┌──────────┐      ┌──────────┐
        │  Roster  │      │ Conflict │
        │  Entry   │      └──────────┘
        └──────────┘
              │
              │ affected by
              ▼
        ┌──────────┐      ┌──────────────┐
        │  Leave   │      │PublicHoliday │
        └──────────┘      └──────────────┘
```

### Collection Relationships

| Collection | References | Referenced By |
|-----------|-----------|---------------|
| User | - | ActivityLog |
| Pod | Employee (lead) | Employee, Brand |
| Employee | Pod, Brand, Process | Assignment, Leave, RosterEntry |
| Brand | Pod, Employee | Process, Assignment, RosterEntry |
| Process | Brand, Employee | Assignment, RosterEntry |
| Assignment | Employee, Brand, Process | - |
| Roster | Pod, Brand, User | RosterEntry, Conflict |
| RosterEntry | Roster, Employee, Brand, Process | - |
| Conflict | Roster, Brand, Process, Employee | - |
| Leave | Employee, User (approver) | - |
| PublicHoliday | - | - |
| ActivityLog | User | - |

### Data Access Patterns

**Most Frequent Queries:**

1. **Get Dashboard Stats**
   ```javascript
   - Count employees by status
   - Count brands, processes, pods
   - Aggregate pod distribution
   - Find upcoming leaves/holidays
   ```

2. **Get Employees for Roster**
   ```javascript
   - Find by pod
   - Filter by status = active
   - Populate assignments
   - Check availability
   ```

3. **Validate Roster Entry**
   ```javascript
   - Find employee by ID
   - Check leaves for date range
   - Check holidays for date
   - Verify assignments
   ```

## API Architecture

### REST API Design

**Base URL:** `http://localhost:5000/api`

**Response Format:**
```javascript
{
  success: boolean,
  data?: any,
  message?: string,
  count?: number
}
```

**Error Format:**
```javascript
{
  success: false,
  message: string,
  stack?: string (dev only)
}
```

### Endpoint Structure

```
/api
├── /auth
│   ├── POST   /login
│   ├── POST   /register
│   └── GET    /me
├── /employees
│   ├── GET    /
│   ├── GET    /:id
│   ├── POST   /
│   ├── PUT    /:id
│   ├── DELETE /:id
│   └── PUT    /:id/availability
├── /brands
│   ├── GET    /
│   ├── GET    /:id
│   ├── POST   /
│   ├── PUT    /:id
│   └── DELETE /:id
├── /processes
│   ├── GET    /
│   ├── GET    /:id
│   ├── POST   /
│   ├── PUT    /:id
│   └── DELETE /:id
├── /pods
│   ├── GET    /
│   ├── GET    /:id
│   ├── POST   /
│   ├── PUT    /:id
│   └── DELETE /:id
├── /assignments
│   ├── GET    /
│   ├── POST   /
│   ├── PUT    /:id
│   └── DELETE /:id
├── /leaves
│   ├── GET    /
│   ├── GET    /:id
│   ├── POST   /
│   ├── PUT    /:id
│   ├── PUT    /:id/approve
│   ├── PUT    /:id/reject
│   └── DELETE /:id
├── /holidays
│   ├── GET    /
│   ├── POST   /
│   ├── PUT    /:id
│   └── DELETE /:id
├── /rosters
│   ├── POST   /generate
│   ├── GET    /
│   ├── GET    /:id
│   ├── GET    /:id/entries
│   ├── GET    /:id/conflicts
│   ├── PUT    /entries/:id
│   ├── PUT    /:id/publish
│   ├── POST   /:id/revalidate
│   └── DELETE /:id
└── /dashboard
    └── GET    /stats
```

## Security Architecture

### Authentication & Authorization

```
┌─────────────────────────────────────┐
│           Request                    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Extract Token from Header      │
│   Authorization: Bearer <token>     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         Verify JWT Token            │
│    jwt.verify(token, SECRET)        │
└──────────────┬──────────────────────┘
               │
         ┌─────┴─────┐
         │           │
         ▼           ▼
    [Valid]      [Invalid]
         │           │
         │           └──► 401 Unauthorized
         │
         ▼
┌─────────────────────────────────────┐
│      Decode & Attach User          │
│      req.user = decoded             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Check Authorization            │
│    (Role-based if needed)           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Proceed to Controller          │
└─────────────────────────────────────┘
```

### Security Layers

1. **Transport Security**
   - HTTPS in production
   - CORS configuration
   - HTTP headers

2. **Authentication**
   - JWT tokens
   - Password hashing (bcrypt)
   - Token expiration

3. **Authorization**
   - Middleware checks
   - Role-based access (future)
   - Resource ownership validation

4. **Input Validation**
   - Mongoose schema validation
   - Express validator
   - Sanitization

5. **Error Handling**
   - No stack traces in production
   - Generic error messages
   - Logging for debugging

## Deployment Architecture

### Development Environment

```
┌──────────────────────────────────────┐
│        Developer Machine              │
│                                       │
│  ┌────────────┐    ┌────────────┐   │
│  │  Frontend  │    │  Backend   │   │
│  │    :5173   │    │   :5000    │   │
│  └────────────┘    └────────────┘   │
│         │                │            │
│         └────────┬───────┘            │
│                  │                    │
│         ┌────────┴────────┐          │
│         │   MongoDB       │          │
│         │    :27017       │          │
│         └─────────────────┘          │
└──────────────────────────────────────┘
```

### Production Architecture (Proposed)

```
┌─────────────────────────────────────────────┐
│               Load Balancer                  │
│            (nginx / HAProxy)                 │
└──────────┬──────────────────────────────────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
┌─────────┐ ┌─────────┐
│  App    │ │  App    │  (Multiple instances)
│ Server 1│ │ Server 2│
└────┬────┘ └────┬────┘
     │           │
     └─────┬─────┘
           │
           ▼
┌──────────────────────┐
│   MongoDB Replica    │
│        Set           │
│                      │
│  Primary + 2 Secondary│
└──────────────────────┘
           │
           ▼
┌──────────────────────┐
│   Redis Cache        │
│  (Session/Data)      │
└──────────────────────┘
```

## Scalability Architecture

### Horizontal Scaling Strategy

```
Current (1-50 employees)
├── Single server
├── Single DB instance
└── In-memory processing

Scale 1 (50-100 employees)
├── Load balancer
├── 2-3 app servers
├── MongoDB replica set
└── Redis cache

Scale 2 (100-500 employees)
├── Auto-scaling app servers
├── MongoDB sharded cluster
├── Redis cluster
├── Background job queue
└── CDN for static assets

Scale 3 (500+ employees)
├── Microservices architecture
├── Kubernetes orchestration
├── Separate scheduling service
├── Event-driven architecture
└── Multi-region deployment
```

## Performance Optimization

### Database Optimization

```javascript
// 1. Indexes
employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ operationalPod: 1 });
rosterEntrySchema.index({ roster: 1, date: 1 });

// 2. Lean Queries
const employees = await Employee.find().lean();

// 3. Projection
const employees = await Employee.find().select('fullName email');

// 4. Pagination
const employees = await Employee.find()
  .limit(pageSize)
  .skip((page - 1) * pageSize);

// 5. Population Control
const employees = await Employee.find()
  .populate('operationalPod', 'podName');
```

### Frontend Optimization

```javascript
// 1. Code Splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));

// 2. Memoization
const memoizedValue = useMemo(() => computeExpensive(data), [data]);

// 3. Debouncing
const debouncedSearch = debounce(searchFunction, 300);

// 4. Virtual Scrolling (future)
<VirtualList items={largeList} height={600} />

// 5. Image Optimization
<img loading="lazy" src={url} alt="..." />
```

## Monitoring & Logging

### Logging Strategy

```javascript
// Development
morgan('dev') → Console output

// Production
winston → File + Cloud logging
├── error.log (errors only)
├── combined.log (all logs)
└── exceptions.log (uncaught exceptions)
```

### Metrics to Monitor

1. **Application Metrics**
   - Request rate
   - Response time
   - Error rate
   - Active users

2. **Database Metrics**
   - Query time
   - Connection pool
   - Index usage
   - Slow queries

3. **System Metrics**
   - CPU usage
   - Memory usage
   - Disk I/O
   - Network traffic

## Conclusion

This architecture is designed to:
- ✅ Scale horizontally as load increases
- ✅ Maintain clear separation of concerns
- ✅ Support independent deployment of components
- ✅ Enable easy testing and maintenance
- ✅ Provide security at multiple layers
- ✅ Optimize for performance
- ✅ Allow future enhancements

The modular design ensures that components can be replaced or upgraded without affecting the entire system.
