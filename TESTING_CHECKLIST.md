# Testing Checklist - Smart Roster Management System

## Pre-Testing Setup

### ✅ Environment Setup
- [ ] MongoDB installed and running
- [ ] Node.js v16+ installed
- [ ] Backend dependencies installed (`npm install` in backend/)
- [ ] Frontend dependencies installed (`npm install` in frontend/)
- [ ] Database seeded (`npm run seed` in backend/)
- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 5173

## Backend API Testing

### Authentication APIs

#### POST /api/auth/login
- [ ] Login with correct credentials (admin/admin123)
  - Expected: 200 OK, returns token and user data
- [ ] Login with incorrect password
  - Expected: 401 Unauthorized
- [ ] Login with non-existent username
  - Expected: 401 Unauthorized
- [ ] Login without username or password
  - Expected: 400 Bad Request

#### GET /api/auth/me
- [ ] Get current user with valid token
  - Expected: 200 OK, returns user data
- [ ] Get current user without token
  - Expected: 401 Unauthorized
- [ ] Get current user with invalid token
  - Expected: 401 Unauthorized

### Employee APIs

#### GET /api/employees
- [ ] Get all employees
  - Expected: 200 OK, returns array of 30 employees
- [ ] Get employees with search filter
  - Expected: 200 OK, returns filtered results
- [ ] Get employees by pod
  - Expected: 200 OK, returns employees in that pod
- [ ] Get employees without authentication
  - Expected: 401 Unauthorized

#### POST /api/employees
- [ ] Create employee with valid data
  - Expected: 201 Created
- [ ] Create employee with duplicate employeeId
  - Expected: 400 Bad Request
- [ ] Create employee with invalid email
  - Expected: 400 Bad Request
- [ ] Create employee with missing required fields
  - Expected: 400 Bad Request

#### PUT /api/employees/:id
- [ ] Update employee with valid data
  - Expected: 200 OK, returns updated employee
- [ ] Update employee with invalid ID
  - Expected: 404 Not Found

#### DELETE /api/employees/:id
- [ ] Delete employee
  - Expected: 200 OK
- [ ] Delete non-existent employee
  - Expected: 404 Not Found

### Brand APIs

#### GET /api/brands
- [ ] Get all brands
  - Expected: 200 OK, returns 10 brands
- [ ] Filter brands by status
  - Expected: 200 OK, returns filtered brands

#### POST /api/brands
- [ ] Create brand with valid data
  - Expected: 201 Created
- [ ] Create brand with duplicate brandCode
  - Expected: 400 Bad Request

### Process APIs

#### GET /api/processes
- [ ] Get all processes
  - Expected: 200 OK, returns processes
- [ ] Get processes by brand
  - Expected: 200 OK, returns processes for that brand

#### POST /api/processes
- [ ] Create process with valid data
  - Expected: 201 Created
- [ ] Create process without brand
  - Expected: 400 Bad Request

### Pod APIs

#### GET /api/pods
- [ ] Get all pods
  - Expected: 200 OK, returns 3 pods
- [ ] Get pod with populated employees
  - Expected: 200 OK, includes employee details

### Assignment APIs

#### GET /api/assignments
- [ ] Get all assignments
  - Expected: 200 OK, returns assignments
- [ ] Get assignments by employee
  - Expected: 200 OK, returns employee's assignments

#### POST /api/assignments
- [ ] Create assignment
  - Expected: 201 Created, updates employee/brand/process
- [ ] Create duplicate assignment
  - Expected: 400 Bad Request

#### DELETE /api/assignments/:id
- [ ] Delete assignment
  - Expected: 200 OK, removes from employee/brand/process

### Leave APIs

#### GET /api/leaves
- [ ] Get all leaves
  - Expected: 200 OK, returns leaves
- [ ] Get leaves by status (pending/approved/rejected)
  - Expected: 200 OK, returns filtered leaves

#### POST /api/leaves
- [ ] Create leave request
  - Expected: 201 Created

#### PUT /api/leaves/:id/approve
- [ ] Approve leave
  - Expected: 200 OK, status changed to approved

#### PUT /api/leaves/:id/reject
- [ ] Reject leave with reason
  - Expected: 200 OK, status changed to rejected

### Holiday APIs

#### GET /api/holidays
- [ ] Get all holidays
  - Expected: 200 OK, returns holidays
- [ ] Get holidays by year
  - Expected: 200 OK, returns holidays for that year

#### POST /api/holidays
- [ ] Create holiday
  - Expected: 201 Created

### Roster APIs

#### POST /api/rosters/generate
- [ ] Generate roster for December 2024
  - Expected: 201 Created, returns roster with entries and conflicts
- [ ] Generate roster without month/year
  - Expected: 400 Bad Request
- [ ] Generate roster for already existing month
  - Expected: 400 Bad Request

#### GET /api/rosters
- [ ] Get all rosters
  - Expected: 200 OK, returns rosters
- [ ] Get rosters by status
  - Expected: 200 OK, returns filtered rosters

#### GET /api/rosters/:id/entries
- [ ] Get roster entries
  - Expected: 200 OK, returns entries for that roster

#### GET /api/rosters/:id/conflicts
- [ ] Get roster conflicts
  - Expected: 200 OK, returns conflicts

#### PUT /api/rosters/:id/publish
- [ ] Publish roster without conflicts
  - Expected: 200 OK, status changed to published
- [ ] Publish roster with critical conflicts
  - Expected: 400 Bad Request, cannot publish

#### POST /api/rosters/:id/revalidate
- [ ] Revalidate roster after change
  - Expected: 200 OK, conflicts updated

### Dashboard APIs

#### GET /api/dashboard/stats
- [ ] Get dashboard statistics
  - Expected: 200 OK, returns comprehensive stats
  - Check: totalEmployees = 30
  - Check: activeBrands = 10
  - Check: podDistribution array present
  - Check: upcomingHolidays array present

## Frontend Testing

### Authentication Flow

#### Login Page
- [ ] Page loads without errors
- [ ] Form validation works (empty fields)
- [ ] Login with correct credentials redirects to dashboard
- [ ] Login with incorrect credentials shows error toast
- [ ] Demo credentials are displayed
- [ ] Responsive on mobile

### Dashboard Page

#### Statistics Cards
- [ ] All 8 stat cards display
- [ ] Values are numbers from backend (not hardcoded)
- [ ] Icons display correctly

#### Pod Distribution
- [ ] Chart displays with data
- [ ] Shows all 3 pods
- [ ] Employee counts are accurate

#### Upcoming Holidays
- [ ] Shows holidays in order
- [ ] Dates formatted correctly
- [ ] Empty state if no holidays

#### Upcoming Leaves
- [ ] Shows approved leaves
- [ ] Employee names display
- [ ] Date ranges correct

#### Brand Coverage
- [ ] Progress bars display
- [ ] Coverage percentages calculated
- [ ] Green for 100%+, yellow for less

#### Recent Activities
- [ ] Activity log displays
- [ ] Shows user who performed action
- [ ] Timestamps are correct

### Employees Page

#### Employee List
- [ ] Table loads with 30 employees
- [ ] Search functionality works
- [ ] Search filters in real-time
- [ ] Table is scrollable horizontally on mobile

#### Add Employee Modal
- [ ] Modal opens on "Add Employee" click
- [ ] All form fields present
- [ ] Form validation works
- [ ] Cancel button closes modal
- [ ] Create button submits and refreshes list
- [ ] Success toast shows

#### Edit Employee
- [ ] Edit button opens modal with prefilled data
- [ ] Update saves changes
- [ ] Success toast shows
- [ ] List refreshes with new data

#### Delete Employee
- [ ] Delete button shows confirmation dialog
- [ ] Cancel closes dialog
- [ ] Confirm deletes employee
- [ ] Success toast shows
- [ ] List refreshes

#### Empty State
- [ ] Delete all employees
- [ ] Empty state component shows
- [ ] "Add Employee" button in empty state works

### Layout & Navigation

#### Sidebar
- [ ] All 13 navigation items display
- [ ] Active route is highlighted
- [ ] Icons display correctly
- [ ] Click navigates to page
- [ ] Collapses on mobile

#### Mobile Menu
- [ ] Hamburger icon shows on mobile
- [ ] Sidebar slides in from left
- [ ] Backdrop appears
- [ ] Click outside closes menu
- [ ] X button closes menu

#### User Profile
- [ ] User initials display in sidebar
- [ ] User name displays
- [ ] Role displays
- [ ] Logout button works
- [ ] Logout redirects to login

## Scheduling Engine Testing

### Single-Resource Brand Scheduling

Test Case 1: Normal Working Day
- [ ] Run scheduling for December 2024
- [ ] Verify single employee scheduled for Monday-Saturday
- [ ] Verify Sunday marked as weekly-off
- [ ] No conflicts generated

Test Case 2: Employee on Leave
- [ ] Employee has approved leave Dec 15-20
- [ ] Run scheduling
- [ ] Verify conflicts detected for those dates
- [ ] Verify conflict type is "insufficient-staffing"
- [ ] Verify backup employees suggested (if available)

Test Case 3: Public Holiday
- [ ] Public holiday on Dec 25
- [ ] Run scheduling
- [ ] Verify Dec 25 marked as "public-holiday"
- [ ] No conflicts if brand policy is "closed"

### Multi-Employee Brand Scheduling

Test Case 4: Multiple Processes
- [ ] Brand has 3 processes (CS, ACC, NDR)
- [ ] Each has assigned employee
- [ ] Run scheduling
- [ ] Verify each process scheduled with correct employee
- [ ] No overlapping assignments

Test Case 5: Shared Process
- [ ] Process has 2 assigned employees
- [ ] Run scheduling
- [ ] Verify workload distributed fairly
- [ ] Both employees get working days
- [ ] No employee exceeds workload limit

Test Case 6: Backup Coverage
- [ ] Primary employee on leave
- [ ] Backup employee available
- [ ] Run scheduling
- [ ] Verify backup scheduled automatically
- [ ] No conflict generated

### 365-Day Operation

Test Case 7: Always-On Brand
- [ ] Brand operates 365 days
- [ ] Run scheduling
- [ ] Verify employee scheduled all days (including Sun/holidays)
- [ ] If workload limit reached, conflict generated

### Conflict Detection

Test Case 8: No Employee Available
- [ ] All assigned employees on leave
- [ ] Run scheduling
- [ ] Verify "no-employee-available" conflict
- [ ] Severity is "critical"
- [ ] Clear explanation provided

Test Case 9: Insufficient Staffing
- [ ] Minimum requirement: 2
- [ ] Available: 1
- [ ] Run scheduling
- [ ] Verify "insufficient-staffing" conflict
- [ ] Shows required vs available

Test Case 10: Revalidation
- [ ] Generate roster
- [ ] Approve new leave for employee
- [ ] Revalidate roster
- [ ] Verify new conflicts detected
- [ ] Old conflicts cleared if resolved

## Integration Testing

### End-to-End Flow 1: New Employee Onboarding
1. [ ] Login to system
2. [ ] Navigate to Employees
3. [ ] Add new employee
4. [ ] Navigate to Assignments
5. [ ] Create assignment for new employee
6. [ ] Navigate to Roster Generator
7. [ ] Generate new roster
8. [ ] Verify new employee appears in schedule

### End-to-End Flow 2: Leave Approval Impact
1. [ ] Login to system
2. [ ] Navigate to Dashboard
3. [ ] Note current conflict count
4. [ ] Navigate to Leaves
5. [ ] Approve pending leave
6. [ ] Navigate to Monthly Roster
7. [ ] Revalidate roster
8. [ ] Verify new conflicts appear
9. [ ] Check dashboard conflict count increased

### End-to-End Flow 3: Brand Configuration
1. [ ] Login to system
2. [ ] Navigate to Brands
3. [ ] Edit brand operating calendar
4. [ ] Change from "except-sundays" to "365-days"
5. [ ] Navigate to Roster Generator
6. [ ] Regenerate roster
7. [ ] Verify brand now scheduled on Sundays

## Performance Testing

### Backend Performance
- [ ] Dashboard stats load in < 1 second
- [ ] Employee list (30) loads in < 500ms
- [ ] Roster generation completes in < 5 seconds
- [ ] No memory leaks during extended use

### Frontend Performance
- [ ] Initial page load < 2 seconds
- [ ] Route navigation < 500ms
- [ ] Search filtering responds instantly
- [ ] Large tables scroll smoothly

## Security Testing

### Authentication
- [ ] Cannot access protected routes without token
- [ ] Expired token redirects to login
- [ ] Invalid token returns 401
- [ ] Token stored securely in localStorage

### Authorization
- [ ] API endpoints require authentication
- [ ] Cannot access other users' data
- [ ] Admin actions require admin role (if implemented)

### Input Validation
- [ ] XSS attempts are sanitized
- [ ] SQL injection attempts fail (MongoDB protection)
- [ ] File upload limits enforced (if implemented)
- [ ] Special characters handled correctly

## Browser Compatibility

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari (latest) - if on Mac

### Mobile Browsers
- [ ] Chrome Mobile
- [ ] Safari Mobile
- [ ] Firefox Mobile

### Responsive Breakpoints
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

## Error Handling

### Network Errors
- [ ] Backend down - shows error message
- [ ] Slow network - shows loading state
- [ ] API timeout - shows timeout message

### User Errors
- [ ] Invalid form input - shows validation errors
- [ ] Duplicate entries - shows clear error
- [ ] Missing required fields - highlights fields

### System Errors
- [ ] Database error - shows user-friendly message
- [ ] Unhandled exception - caught by error boundary
- [ ] 404 routes - redirects appropriately

## Accessibility

### Keyboard Navigation
- [ ] Can tab through form fields
- [ ] Can submit forms with Enter
- [ ] Can close modals with Escape
- [ ] Focus visible on interactive elements

### Screen Reader
- [ ] Form labels present
- [ ] Buttons have descriptive text
- [ ] Images have alt text
- [ ] ARIA labels where needed

## Data Integrity

### Database Consistency
- [ ] No orphaned references
- [ ] Cascading deletes work correctly
- [ ] Unique constraints enforced
- [ ] Required fields enforced

### Data Validation
- [ ] Date ranges validated
- [ ] Email format validated
- [ ] Phone format validated
- [ ] Numeric fields validated

## Deployment Testing

### Production Build
- [ ] Backend builds without errors
- [ ] Frontend builds without errors
- [ ] Environment variables loaded correctly
- [ ] Static assets load correctly

### Environment Variables
- [ ] .env.example present
- [ ] All required variables documented
- [ ] No secrets in code
- [ ] Connection strings configurable

## Testing Results Template

```
Date Tested: _____________
Tester: _____________
Environment: Development / Staging / Production

Results:
- Tests Passed: ___ / ___
- Tests Failed: ___ / ___
- Critical Issues: ___
- Minor Issues: ___

Critical Issues:
1. _______________________
2. _______________________

Notes:
_________________________
_________________________
```

## Known Issues (As of Current Build)

### Frontend
1. ⚠️ Brands, Processes, Pods pages are stubs
2. ⚠️ Assignments page is stub
3. ⚠️ Roster Generator UI not implemented
4. ⚠️ Monthly Roster view not implemented
5. ⚠️ Leaves management page is stub
6. ⚠️ Holidays page is stub
7. ⚠️ Conflicts page is stub
8. ⚠️ Reports page is stub
9. ⚠️ Settings page is stub

### Backend
1. ✅ All APIs functional
2. ✅ No known issues

### Testing Coverage
1. ⚠️ Only scheduling engine has unit tests
2. ⚠️ No integration tests
3. ⚠️ No E2E tests
4. ⚠️ No frontend tests

## Priority Testing Order

1. **P0 (Critical):** Authentication, Scheduling Engine
2. **P1 (High):** Employee CRUD, Roster APIs, Dashboard
3. **P2 (Medium):** Brands, Processes, Leaves APIs
4. **P3 (Low):** Reports, Settings, Performance

## Sign-off

- [ ] All P0 tests passed
- [ ] All P1 tests passed
- [ ] Critical issues resolved
- [ ] System ready for demo/review

**Tested by:** _________________
**Date:** _________________
**Approved by:** _________________
**Date:** _________________
