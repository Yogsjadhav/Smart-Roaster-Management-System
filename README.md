# Smart Roster Management System

A comprehensive, production-quality workforce management system built for the DataStraw Tech Internship Assessment.

## 🎯 Project Overview

The Smart Roster Management System is a full-stack MERN application that helps operations managers efficiently manage employees, brands, processes, operational pods, and generate optimized monthly rosters using deterministic scheduling logic.

## ✨ Key Features

### Core Functionality
- **Employee Management**: Complete CRUD operations with profile management
- **Brand Management**: Multi-brand support with different operating calendars
- **Process Management**: Configurable processes with individual operating rules
- **Pod Management**: Operational pod organization with pod leads
- **Assignment Management**: Flexible employee-to-brand-to-process assignments

### Roster Management
- **Intelligent Roster Generation**: Deterministic scheduling engine with optimization
- **Conflict Detection**: Automatic identification of scheduling conflicts
- **Coverage Analysis**: Real-time staffing requirement validation
- **Manual Overrides**: Manager-controlled schedule adjustments
- **Revalidation**: Dynamic roster validation after changes

### Leave & Availability
- **Leave Requests**: Planned leave, comp-off, sick leave management
- **Leave Approval Workflow**: Manager approval/rejection
- **Public Holiday Calendar**: Configurable holiday management
- **Employee Availability Tracking**: Date-specific availability

### Analytics & Reporting
- **Real-time Dashboard**: Live statistics and metrics
- **Pod Distribution Analysis**: Employee distribution across pods
- **Brand Coverage Reports**: Staffing adequacy tracking
- **Activity Logs**: Complete audit trail

## 🏗️ System Architecture

### Technology Stack

**Frontend:**
- React 18 with Vite
- React Router DOM for navigation
- Tailwind CSS for styling
- Axios for API communication
- React Hot Toast for notifications
- Lucide React for icons
- date-fns for date manipulation

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcrypt for password hashing
- Express Validator for input validation

**Development Tools:**
- Nodemon for hot reloading
- Morgan for logging
- CORS for cross-origin requests

### Project Structure

```
smart-roster-management-system/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, error handling
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic (Scheduling Engine)
│   │   ├── utils/           # Helpers, seed scripts
│   │   └── server.js        # Entry point
│   ├── .env                 # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React Context (Auth)
│   │   ├── pages/           # Route components
│   │   ├── services/        # API services
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd smart-roster-management-system
```

2. **Install Backend Dependencies:**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies:**
```bash
cd ../frontend
npm install
```

4. **Configure Environment Variables:**

Create `.env` file in backend directory (or copy from `.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/smart-roster
JWT_SECRET=smart-roster-secret-key-2024-datastraw-assessment
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

The registration form lets a new user choose Employee or Manager. Only one Manager account is allowed; if a manager already exists, another manager registration is rejected. On startup, existing duplicate manager and legacy roles are normalized so one manager remains and other accounts are employees.

5. **Start MongoDB:**
```bash
# Make sure MongoDB is running
mongod
```

6. **Seed the Database:**
```bash
cd backend
npm run seed
```

This will create:
- 30 employees across 3 operational pods
- 10 brands (8 single-resource, 2 multi-employee)
- Multiple processes with different operating calendars
- Realistic assignments
- Public holidays for 2024-2025
- Sample approved leave (creates demo conflict scenario)
- Demo employee user (username: admin, password: admin123)

7. **Start the Backend Server:**
```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:5000`

8. **Start the Frontend Development Server:**
```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

9. **Access the Application:**

Open your browser and navigate to `http://localhost:5173`

**Login Credentials:**
- Username: `admin`
- Password: `admin123`

The seeded `admin` login has the Employee role. The current API authenticates both roles but does not yet limit individual features by role.

## 📊 Scheduling Engine

### How It Works

The scheduling engine implements a deterministic algorithm with hard and soft constraints:

#### Hard Constraints (Must be satisfied):
1. Unavailable employees cannot be scheduled
2. Approved leaves must be respected
3. No overlapping shift assignments
4. Only qualified/assigned employees can cover processes
5. Minimum coverage requirements must be met
6. Employee availability rules are mandatory

#### Soft Constraints (Optimized where possible):
1. Respect preferred weekly offs
2. Distribute weekly offs fairly
3. Balance workload among employees
4. Consider employee preferences
5. Avoid repeatedly assigning undesirable days

### Scheduling Process:

1. **Data Loading**: Loads employees, brands, processes, leaves, holidays, assignments
2. **Date Iteration**: Processes each day of the month
3. **Process Analysis**: Checks if process should operate based on:
   - Brand operating calendar (365-days, except-holidays, except-sundays-holidays)
   - Process-specific operating days
   - Public holiday policy
   - Sunday policy
4. **Employee Eligibility**: Filters employees based on:
   - Active assignments to the brand-process combination
   - No approved leave
   - Available (not marked unavailable)
   - Within workload limits
   - Not already scheduled for another process that day
5. **Priority Assignment**: Sorts eligible employees by:
   - Priority (non-weekly-off days first)
   - Current workload (distribute fairly)
6. **Conflict Detection**: Identifies when:
   - No eligible employees available
   - Insufficient staffing for minimum requirements
   - Coverage gaps due to leaves/unavailability
7. **Backup Recommendations**: Suggests alternative employees from same pod

### Conflict Resolution:

When conflicts are detected, the system:
1. Records the conflict with detailed explanation
2. Identifies severity level (critical, high, medium, low)
3. Suggests backup employees if available
4. Provides resolution guidance
5. Allows manual override by manager
6. Revalidates after any changes

## 📋 Data Models

### Employee
- Personal information (name, email, phone)
- Employment details (ID, designation, department, joining date)
- Pod assignment
- Brand and process assignments
- Weekly off preferences
- Availability tracking
- Workload limits

### Brand
- Brand details (name, code, description)
- Operating calendar configuration
- Holiday and Sunday policies
- Pod assignment
- Minimum staffing requirements
- Assigned employees

### Process
- Process details (name, code)
- Brand association
- Operating days configuration
- Holiday and Sunday policies
- Shift requirements
- Assigned employees
- Minimum staffing requirements

### Pod
- Pod name and description
- Pod lead assignment
- Member employees
- Assigned brands

### Assignment
- Employee-Brand-Process linkage
- Working rules (max days per week, weekly off preferences)
- Active status

### Roster
- Month and year
- Pod and brand filters
- Generation metadata
- Publish status
- Conflict count
- Validity flag

### RosterEntry
- Roster reference
- Employee, brand, process assignments
- Date and shift
- Status (working, weekly-off, leave, holiday)
- Manual override flag

### Conflict
- Roster reference
- Conflict type and severity
- Affected date, brand, process, employee
- Detailed explanation
- Backup employee suggestions
- Resolution status

## 🧪 Testing the Demo Scenario

The seed data includes a pre-configured scenario to demonstrate the system's capabilities:

**Scenario:**
1. Employee "Amit Patel" (EMP003) manages TechGear Store
2. TechGear Store operates 365 days (including Sundays and holidays)
3. Amit has approved leave from December 15-20, 2024

**To Test:**
1. Login to the system
2. Navigate to "Roster Generator"
3. Select Month: December, Year: 2024
4. Generate roster
5. System will detect coverage gaps for TechGear Store during Dec 15-20
6. Navigate to "Conflict Center" to view detected conflicts
7. System shows backup employee recommendations
8. Manager can manually reassign or acknowledge the conflict

## 🎨 Design Philosophy

### UI/UX Approach:
- **Clean Enterprise Design**: Professional SaaS-style interface
- **Consistent Color Scheme**: Navy sidebar, blue accents, light backgrounds
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Loading States**: Skeleton loaders and spinners for better UX
- **Empty States**: Helpful guidance when no data exists
- **Error Handling**: Clear error messages and recovery options
- **Confirmation Dialogs**: Prevent accidental destructive actions

### Component Architecture:
- **Reusable Components**: Modal, ConfirmDialog, EmptyState, LoadingSpinner
- **Layout System**: Persistent sidebar navigation with responsive mobile menu
- **Protected Routes**: Authentication-based access control
- **Context API**: Global state management for auth
- **Service Layer**: Centralized API communication

## 📈 Scalability Considerations

### Current Implementation:
- Handles 30-50 employees efficiently
- Supports 10-20 brands
- Processes up to 50 processes
- Generates rosters for 100+ daily assignments

### Scaling to 2x (60-100 employees, 20-40 brands):

**Database Optimizations:**
- Indexes on frequently queried fields (already implemented)
- Compound indexes for roster queries
- Pagination for large datasets

**Scheduling Engine Improvements:**
- Parallel processing for independent brands
- Caching of frequently accessed data
- Incremental roster updates instead of full regeneration
- Background job processing for large rosters

**Frontend Enhancements:**
- Virtual scrolling for large tables
- Infinite scroll with pagination
- Filter caching and debouncing
- Web workers for client-side processing

**Infrastructure:**
- Database replication for read scaling
- Redis caching layer
- Load balancer for backend instances
- CDN for frontend assets

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Protected API Routes**: Middleware-based auth checking
- **CORS Configuration**: Whitelist frontend origin
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: MongoDB parameterized queries
- **XSS Protection**: React's built-in escaping

## 🐛 Known Limitations

1. **Frontend Pages**: Due to time constraints, some modules (Brands, Processes, Pods, etc.) have stub implementations. The architecture and API are complete, but UI needs full implementation.

2. **Export Functionality**: Excel/CSV export is architecturally planned but not yet implemented.

3. **Advanced Reporting**: Report generation module needs implementation.

4. **Real-time Updates**: WebSocket support for live roster updates not implemented.

5. **Email Notifications**: Leave approval notifications not implemented.

## 🚧 Future Enhancements

### Short-term (1 week):
- Complete all frontend CRUD pages
- Implement Excel/CSV export
- Add advanced filters and search
- Build comprehensive report generation
- Mobile app responsive improvements

### Medium-term (1 month):
- Employee shift management
- Multi-shift roster support
- Skill-based assignment matching
- Automated conflict resolution suggestions
- Email notification system
- Roster template management

### Long-term (3 months):
- AI-powered schedule optimization
- Predictive analytics for staffing needs
- Mobile application (React Native)
- Integration with HR systems
- Advanced reporting dashboards
- Multi-tenant support for multiple companies

## 📝 API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Employees
- `GET /api/employees` - Get all employees (with filters)
- `GET /api/employees/:id` - Get single employee
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `PUT /api/employees/:id/availability` - Update availability

### Brands
- `GET /api/brands` - Get all brands
- `GET /api/brands/:id` - Get single brand
- `POST /api/brands` - Create brand
- `PUT /api/brands/:id` - Update brand
- `DELETE /api/brands/:id` - Delete brand

### Processes
- `GET /api/processes` - Get all processes
- `GET /api/processes/:id` - Get single process
- `POST /api/processes` - Create process
- `PUT /api/processes/:id` - Update process
- `DELETE /api/processes/:id` - Delete process

### Pods
- `GET /api/pods` - Get all pods
- `GET /api/pods/:id` - Get single pod
- `POST /api/pods` - Create pod
- `PUT /api/pods/:id` - Update pod
- `DELETE /api/pods/:id` - Delete pod

### Assignments
- `GET /api/assignments` - Get all assignments
- `POST /api/assignments` - Create assignment
- `PUT /api/assignments/:id` - Update assignment
- `DELETE /api/assignments/:id` - Delete assignment

### Leaves
- `GET /api/leaves` - Get all leaves
- `GET /api/leaves/:id` - Get single leave
- `POST /api/leaves` - Create leave
- `PUT /api/leaves/:id` - Update leave
- `PUT /api/leaves/:id/approve` - Approve leave
- `PUT /api/leaves/:id/reject` - Reject leave
- `DELETE /api/leaves/:id` - Delete leave

### Public Holidays
- `GET /api/holidays` - Get all holidays
- `POST /api/holidays` - Create holiday
- `PUT /api/holidays/:id` - Update holiday
- `DELETE /api/holidays/:id` - Delete holiday

### Rosters
- `POST /api/rosters/generate` - Generate new roster
- `GET /api/rosters` - Get all rosters
- `GET /api/rosters/:id` - Get single roster
- `GET /api/rosters/:id/entries` - Get roster entries
- `GET /api/rosters/:id/conflicts` - Get roster conflicts
- `PUT /api/rosters/entries/:id` - Update roster entry
- `PUT /api/rosters/:id/publish` - Publish roster
- `POST /api/rosters/:id/revalidate` - Revalidate roster
- `DELETE /api/rosters/:id` - Delete roster

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🤝 Contributing

This is an assessment project, but contributions and suggestions are welcome:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - feel free to use this project for learning and development.

## 👨‍💻 Developer

Built with ❤️ for the DataStraw Tech Internship Assessment

## 📞 Support

For questions or issues:
- Create an issue in the repository
- Contact the development team

---

**Note**: This system demonstrates enterprise-grade architecture, clean code practices, and scalable design patterns suitable for production workforce management applications.
