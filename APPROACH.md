# Approach Document - Smart Roster Management System

## Development Methodology

### 1. Requirements Analysis

The project requirements specified building a comprehensive roster management system with:
- Multi-entity management (employees, brands, processes, pods)
- Intelligent roster generation with conflict detection
- Support for single-resource and multi-employee brands
- Realistic scheduling constraints
- Production-quality architecture

### 2. System Design Decisions

#### **Backend Architecture**

**Chosen Approach: Modular MVC Pattern**

```
Models → Controllers → Services → Routes
```

**Rationale:**
- Clear separation of concerns
- Easy to test individual components
- Scalable for future features
- Standard pattern familiar to teams

**Key Design Decisions:**

1. **Mongoose Models with Schemas**
   - Strict schema validation
   - Indexes for performance
   - Population for relationships
   - Timestamps for audit trail

2. **Service Layer for Business Logic**
   - SchedulingEngine as separate service
   - Reusable across different contexts
   - Testable independently
   - Can be moved to microservice if needed

3. **JWT Authentication**
   - Stateless authentication
   - Scalable across multiple servers
   - Standard industry practice
   - Easy token refresh implementation

4. **RESTful API Design**
   - Standard HTTP methods
   - Resource-based URLs
   - Consistent response format
   - Error handling middleware

#### **Frontend Architecture**

**Chosen Approach: Component-Based React with Context API**

```
Pages → Components → Services → Context
```

**Rationale:**
- Component reusability
- Simple state management with Context API
- No need for Redux complexity for this scale
- Fast development with Vite

**Key Design Decisions:**

1. **Vite over Create React App**
   - Faster hot module replacement
   - Better development experience
   - Optimized production builds
   - Modern tooling

2. **Tailwind CSS**
   - Rapid UI development
   - Consistent design system
   - Small production bundle
   - Utility-first approach

3. **Route-Based Code Splitting**
   - Better performance
   - Load only what's needed
   - Built-in with React Router

4. **Service Layer for API Calls**
   - Centralized API logic
   - Easy to mock for testing
   - Consistent error handling
   - Token management

### 3. Database Design

#### **Entity Relationship Model**

```
User ──────────────────────────┐
                                │
Pod ────┬─ Employees ──┬─ Assignments ──┬─ RosterEntry
        │               │                 │
        └─ Brands ──────┴─ Processes ─────┘
                                │
                        PublicHolidays
                                │
        Leaves ─────────────────┘
                                │
        Roster ─────────────────┴─ Conflicts
```

**Normalization Strategy:**
- 3NF for most entities
- Denormalization for performance (embedded arrays)
- References for many-to-many relationships
- Computed fields for aggregates

**Index Strategy:**
```javascript
// Frequently queried fields
- employeeId (unique, indexed)
- brand + process (compound index)
- roster + date (compound index)
- employee + date (compound index)
```

### 4. Scheduling Algorithm Design

#### **Algorithm Choice: Greedy with Backtracking**

**Why Not:**
- ❌ Brute Force: Too slow for 30+ employees
- ❌ Genetic Algorithm: Overkill for deterministic rules
- ❌ Integer Linear Programming: Too complex to maintain

**Why Greedy + Backtracking:**
- ✅ Fast for small-medium datasets
- ✅ Deterministic results
- ✅ Easy to understand and maintain
- ✅ Can handle hard constraints
- ✅ Optimizes soft constraints

#### **Scheduling Flow**

```
1. Load Data
   ↓
2. For each date in month:
   ↓
3. For each brand-process combination:
   ↓
4. Check if process operates this day
   ├─ Yes → Continue
   └─ No → Mark as not-required
   ↓
5. Get eligible employees:
   - Assigned to this process
   - Not on leave
   - Available
   - Under workload limit
   - Not already scheduled
   ↓
6. Sort by priority:
   - Non-weekly-off days first
   - Lower current workload first
   ↓
7. Assign employees until minimum met
   ↓
8. If insufficient:
   └─ Create conflict with:
      - Clear explanation
      - Backup suggestions
      - Resolution guidance
   ↓
9. Update workload tracking
```

#### **Constraint Hierarchy**

**Hard Constraints (Cannot be violated):**
1. Employee availability
2. Approved leaves
3. Assignment requirements
4. Operating calendar rules
5. No overlapping assignments

**Soft Constraints (Optimized):**
1. Weekly off preferences
2. Workload distribution
3. Minimize consecutive working days
4. Prefer experienced employees

### 5. Conflict Detection Strategy

#### **Types of Conflicts Detected**

1. **insufficient-staffing** (Critical)
   - Required: X, Available: Y (Y < X)
   - Blocks roster publication

2. **no-employee-available** (Critical)
   - Required: X, Available: 0
   - Blocks roster publication

3. **leave-coverage-gap** (High)
   - Key employee on leave
   - May have backups

4. **weeklyoff-coverage-gap** (Medium)
   - Weekly offs causing gaps
   - Usually acceptable

5. **violated-availability** (High)
   - Scheduling unavailable employee
   - Should never happen in production

#### **Backup Employee Logic**

```javascript
findBackupEmployees(brand, process, date) {
  // 1. Same pod employees
  // 2. Not assigned to this process
  // 3. Not on leave
  // 4. Available
  // 5. Under workload limit
  return eligibleBackups;
}
```

### 6. Data Modeling Decisions

#### **Single-Resource vs Multi-Employee Brands**

**Problem:** How to differentiate brands where:
- One employee handles all processes (80%)
- Multiple employees share processes (20%)

**Solution:** Assignment-based approach
```javascript
// Single-resource brand
Assignment {
  employee: EMP001,
  brand: BRAND_A,
  process: CS
}

// Multi-employee brand
Assignment { employee: EMP001, brand: BRAND_B, process: CS }
Assignment { employee: EMP002, brand: BRAND_B, process: ACC }
Assignment { employee: EMP003, brand: BRAND_B, process: NDR }
Assignment { employee: EMP004, brand: BRAND_B, process: CS } // Backup
```

**Benefits:**
- Flexible assignment
- Easy to add/remove employees
- Clear responsibility tracking
- Supports shared processes

#### **Availability Tracking**

**Chosen:** Map of dates to boolean
```javascript
availability: Map<string, boolean>
// e.g., { '2024-12-15': false, '2024-12-16': false }
```

**Why not array of unavailable dates:**
- Map allows quick lookups
- Can store both available and unavailable
- Easy to update

**Why not separate availability collection:**
- Would need joins
- More complex queries
- Embedded is faster for this use case

### 7. Scalability Considerations

#### **Current Architecture (30-50 employees)**

```
Single Server
    ↓
MongoDB (single instance)
    ↓
In-memory scheduling
```

#### **2x Scale (60-100 employees)**

**Required Changes:**

1. **Database:**
```
MongoDB Replica Set
- Primary for writes
- Secondaries for reads
- Automatic failover
```

2. **Scheduling:**
```javascript
// Parallel processing
async generateScheduleParallel(brands) {
  const chunks = chunkArray(brands, 5);
  const results = await Promise.all(
    chunks.map(chunk => scheduleChunk(chunk))
  );
  return mergeResults(results);
}
```

3. **Caching:**
```javascript
// Redis cache
const cachedData = await redis.get(`roster:${month}:${year}`);
if (cachedData) return cachedData;
```

4. **Incremental Updates:**
```javascript
// Only revalidate affected dates
async revalidateAffectedDates(employeeId, startDate, endDate) {
  // Get affected brands/processes
  // Regenerate only those entries
  // Much faster than full regeneration
}
```

#### **10x Scale (300-500 employees)**

**Required Architecture:**

```
Load Balancer
    ↓
API Servers (multiple instances)
    ↓
Queue System (RabbitMQ/Bull)
    ↓
Worker Processes (scheduling)
    ↓
MongoDB Cluster + Redis Cache
```

**Key Changes:**
- Async roster generation with queues
- Background jobs for heavy operations
- Horizontal scaling of API servers
- Database sharding by month/year
- CDN for static assets
- Microservices for scheduling

### 8. Security Approach

**Authentication:**
```
Login → JWT Token → Store in localStorage
         ↓
    Axios Interceptor
         ↓
    Authorization Header
         ↓
    Backend Middleware
         ↓
    Verify & Decode
         ↓
    req.user populated
```

**Password Security:**
- bcrypt with 10 salt rounds
- Never log passwords
- Hash before storage
- Compare hashed values

**API Security:**
- All routes except auth require token
- Token expiry (7 days default)
- HTTP-only cookies in production
- CORS whitelist
- Rate limiting (future)

### 9. Testing Strategy

**Backend Testing:**
```
Unit Tests → Integration Tests → E2E Tests
```

**Test Coverage Goals:**
- SchedulingEngine: 80%+
- Controllers: 70%+
- Models: 60%+

**Critical Test Scenarios:**
1. Single employee scheduling
2. Multi-employee scheduling
3. Leave conflict detection
4. Holiday handling
5. Workload distribution
6. Backup employee selection
7. Invalid data handling

**Frontend Testing:**
- Component unit tests
- Integration tests for critical flows
- E2E tests with Cypress (future)

### 10. Performance Optimizations

**Database:**
- Indexes on frequently queried fields
- Pagination for large lists
- Lean queries (skip Mongoose getters)
- Connection pooling

**API:**
- Response compression
- Caching headers
- Batch operations
- Parallel requests

**Frontend:**
- Code splitting by route
- Lazy loading components
- Debounced search
- Optimistic updates
- Virtual scrolling (future)

### 11. Error Handling Philosophy

**Backend:**
```javascript
try {
  // Operation
} catch (error) {
  // Log error
  // Return user-friendly message
  // Include context for debugging
}
```

**Frontend:**
```javascript
try {
  // API call
} catch (error) {
  // Show toast notification
  // Log to error tracking (future)
  // Allow retry
}
```

### 12. Trade-offs Made

**Decisions and Reasoning:**

1. **Context API vs Redux**
   - Chose: Context API
   - Trade-off: Less powerful, but simpler
   - Reasoning: Sufficient for this scale

2. **Embedded Arrays vs Separate Collections**
   - Chose: Mix of both
   - Trade-off: Some data duplication
   - Reasoning: Performance over normalization

3. **Synchronous vs Asynchronous Roster Generation**
   - Chose: Synchronous
   - Trade-off: Request blocks while generating
   - Reasoning: Faster development, good for <100 employees

4. **Full Frontend CRUD vs API-Complete Backend**
   - Chose: Complete backend, partial frontend
   - Trade-off: Some UI is stub
   - Reasoning: Backend is the hard part, UI can be expanded

5. **Custom Scheduling vs Library**
   - Chose: Custom implementation
   - Trade-off: More code to maintain
   - Reasoning: Full control, meets exact requirements

### 13. Future Improvements

**Technical Debt to Address:**

1. Complete remaining frontend modules
2. Add comprehensive test coverage
3. Implement export functionality
4. Add email notifications
5. Real-time updates with WebSockets
6. Advanced reporting dashboards
7. Mobile-responsive improvements
8. Accessibility enhancements
9. Performance monitoring
10. Error tracking (Sentry)

**Feature Enhancements:**

1. Multi-shift support
2. Skill-based matching
3. AI-powered optimization
4. Predictive analytics
5. Template management
6. Bulk operations
7. Advanced filters
8. Custom reports
9. API webhooks
10. Third-party integrations

## Conclusion

This approach prioritizes:
- ✅ Working software over perfect architecture
- ✅ Scalability paths over premature optimization
- ✅ Maintainability over cleverness
- ✅ Pragmatism over perfectionism

The system is built to be extended, not replaced, as requirements grow.
