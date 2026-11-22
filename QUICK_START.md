# Quick Start Guide - Smart Roster Management System

## 🚀 Get Started in 5 Minutes

### Option 1: Automated Start (Windows)
```powershell
# Just run this script!
./start.ps1
```

The script will:
- ✅ Check MongoDB status
- ✅ Install dependencies if needed
- ✅ Seed the database
- ✅ Start both servers
- ✅ Open in your browser

### Option 2: Manual Start

**Step 1: Start MongoDB**
```powershell
net start MongoDB
```

**Step 2: Install & Seed (First Time Only)**
```powershell
# Backend
cd backend
npm install
npm run seed

# Frontend
cd ../frontend
npm install
```

**Step 3: Start Servers**

Terminal 1:
```powershell
cd backend
npm run dev
```

Terminal 2:
```powershell
cd frontend
npm run dev
```

**Step 4: Login**
- Open: http://localhost:5173
- Username: `admin`
- Password: `admin123`

## 📋 What You'll See

### Dashboard (Home)
- 8 real-time statistics cards
- Pod employee distribution chart
- Upcoming holidays
- Upcoming leaves
- Brand coverage analysis
- Recent activity log

### Employees Page
- List of 30 employees
- Search and filter functionality
- Add/Edit/Delete operations
- Professional data table

## 🎯 Demo Scenario

**Test the scheduling conflict detection:**

1. **Navigate to Dashboard**
   - Note current statistics

2. **Check Sample Leave**
   - Employee: Amit Patel (EMP003)
   - Brand: TechGear Store
   - Leave Dates: Dec 15-20, 2024
   - Status: Approved ✅

3. **Generate Roster** (Backend API)
   ```javascript
   POST http://localhost:5000/api/rosters/generate
   Body: { month: 12, year: 2024 }
   ```

4. **Expected Result**
   - Roster generated with conflicts
   - Coverage gaps detected for Dec 15-20
   - TechGear Store requires coverage (365-day brand)
   - System suggests backup employees

## 📁 Project Structure

```
smart-roster-management-system/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── models/      # 12 Mongoose models
│   │   ├── controllers/ # 10 API controllers
│   │   ├── routes/      # 10 route modules
│   │   ├── services/    # Scheduling engine
│   │   └── tests/       # Test suite
│   └── package.json
│
├── frontend/            # React + Vite
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Route pages
│   │   ├── services/    # API layer
│   │   └── context/     # State management
│   └── package.json
│
└── Documentation/
    ├── README.md        # Main documentation
    ├── SETUP.md         # Setup guide
    ├── APPROACH.md      # Development approach
    ├── ARCHITECTURE.md  # System design
    └── SCHEDULING_LOGIC.md  # Algorithm details
```

## 🔧 Common Commands

### Backend
```powershell
cd backend
npm run dev      # Start development server
npm run seed     # Seed database
npm test         # Run tests
npm start        # Production server
```

### Frontend
```powershell
cd frontend
npm run dev      # Start development server
npm run build    # Production build
npm run preview  # Preview production build
```

## 🐛 Quick Troubleshooting

### MongoDB Not Running
```powershell
# Start MongoDB
net start MongoDB

# Or manually
mongod
```

### Port Already in Use
```powershell
# Backend (5000)
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <process_id> /F

# Frontend (5173)
# Kill process on port 5173
netstat -ano | findstr :5173
taskkill /PID <process_id> /F
```

### Login Not Working
```powershell
# Reseed database
cd backend
npm run seed
```

### Frontend Build Errors
```powershell
cd frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

## 📊 Key Features to Test

### ✅ Working Features
1. **Authentication**
   - Login/logout
   - Protected routes
   - Token management

2. **Dashboard**
   - Real-time statistics
   - Dynamic charts
   - Activity logs

3. **Employee Management**
   - Full CRUD operations
   - Search functionality
   - Modal forms

4. **Backend APIs**
   - 40+ RESTful endpoints
   - Complete data operations
   - Roster generation

### ⚠️ Pending UI (APIs Ready)
- Brands CRUD
- Processes CRUD
- Pods CRUD
- Assignments CRUD
- Roster Generator UI
- Monthly Roster View
- Leaves Management UI
- Holidays Management UI
- Conflicts Center UI
- Reports UI
- Settings UI

## 🌐 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Quick Test
```powershell
# Login
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"username":"admin","password":"admin123"}'

# Get Employees (use token from login)
curl http://localhost:5000/api/employees `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📝 Sample Data

### Users
- Username: `admin`
- Password: `admin123`
- Role: Admin

### Employees
- Total: 30 employees
- Pods: 3 operational pods
- Brands: 10 brands assigned
- Processes: 13 processes

### Brands
- Single-resource: 8 brands (80%)
- Multi-employee: 2 brands (20%)
- Operating models: 365-day, except-holidays, except-sundays-holidays

### Test Scenario
- Employee: Amit Patel (EMP003)
- Brand: TechGear Store
- Leave: Dec 15-20, 2024
- Result: Coverage conflict

## 🎓 Learning Path

### Day 1: Understand the System
1. Read README.md
2. Review ARCHITECTURE.md
3. Explore database models
4. Check API endpoints

### Day 2: Run the Application
1. Install dependencies
2. Seed database
3. Start servers
4. Login and explore

### Day 3: Test Features
1. Test authentication
2. Explore dashboard
3. Manage employees
4. Test API calls

### Day 4: Study Scheduling
1. Read SCHEDULING_LOGIC.md
2. Review scheduling engine code
3. Run tests
4. Generate rosters via API

### Day 5: Extend the System
1. Complete remaining UI pages
2. Add new features
3. Write more tests
4. Deploy to production

## 💡 Tips & Best Practices

### Development
- Keep both terminals open (backend + frontend)
- Watch for console errors
- Use browser DevTools Network tab
- Check MongoDB Compass for data

### Testing
- Test APIs with Postman/Thunder Client
- Use browser console for debugging
- Check backend terminal for errors
- Monitor network requests

### Debugging
- Backend errors: Check terminal output
- Frontend errors: Check browser console
- Database issues: Check MongoDB logs
- Network issues: Check CORS settings

## 📞 Need Help?

### Resources
- README.md - Complete documentation
- SETUP.md - Detailed setup guide
- ARCHITECTURE.md - System design
- SCHEDULING_LOGIC.md - Algorithm details
- TESTING_CHECKLIST.md - Test cases

### Common Questions

**Q: How do I add a new employee?**
A: Navigate to Employees → Click "Add Employee" → Fill form → Submit

**Q: How do I test roster generation?**
A: Use API: POST /api/rosters/generate with {month: 12, year: 2024}

**Q: Why am I seeing conflicts?**
A: Amit Patel has leave Dec 15-20, causing coverage gaps for TechGear Store

**Q: Can I change the demo data?**
A: Yes! Edit backend/src/utils/seed.js and run `npm run seed`

## 🎯 Next Steps

1. ✅ Get system running
2. ✅ Login and explore
3. ✅ Test employee management
4. ✅ Review API documentation
5. ⚠️ Complete remaining UI pages
6. ⚠️ Add export functionality
7. ⚠️ Write comprehensive tests
8. ⚠️ Deploy to production

## 🌟 You're Ready!

The system is up and running. Start exploring!

**Frontend:** http://localhost:5173  
**Backend:** http://localhost:5000  
**Username:** admin  
**Password:** admin123

Happy coding! 🚀
