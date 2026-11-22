# Setup Guide - Smart Roster Management System

## Quick Start (Windows)

### 1. Install Prerequisites

**Node.js:**
```powershell
# Download from https://nodejs.org/ (v16 or higher)
# Or using winget:
winget install OpenJS.NodeJS
```

**MongoDB:**
```powershell
# Download from https://www.mongodb.com/try/download/community
# Or using winget:
winget install MongoDB.Server

# Start MongoDB service
net start MongoDB
```

### 2. Project Setup

```powershell
# Navigate to project directory
cd "d:\React\Smart Roaster Management System"

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ..\frontend
npm install
```

### 3. Database Setup

```powershell
# Make sure MongoDB is running
# From backend directory:
cd backend
npm run seed
```

Expected output:
```
MongoDB Connected: localhost:27017
Existing data cleared
User created
Pods created
Employees created
Brands created
Processes created
Assignments created
Public holidays created
Sample leave created
✅ Database seeded successfully!
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

You should see:
```
Server running in development mode on port 5000
MongoDB Connected: localhost
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 5. Access Application

Open browser: `http://localhost:5173`

**Login credentials:**
- Username: `admin`
- Password: `admin123`

## Troubleshooting

### MongoDB Connection Issues

**Error:** `MongoServerError: connect ECONNREFUSED`

**Solution:**
```powershell
# Check if MongoDB is running
Get-Process mongod

# If not running, start it:
net start MongoDB

# Or start manually:
mongod --dbpath="C:\data\db"
```

### Port Already in Use

**Error:** `Port 5000 is already in use`

**Solution:**
```powershell
# Find and kill the process using port 5000
netstat -ano | findstr :5000
taskkill /PID <process_id> /F

# Or change port in backend/.env:
PORT=5001
```

### Frontend Build Issues

**Error:** `Failed to resolve import`

**Solution:**
```powershell
# Clear node_modules and reinstall
cd frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Database Seed Issues

**Error:** `Duplicate key error`

**Solution:**
```powershell
# Drop the database and reseed
mongo
use smart-roster
db.dropDatabase()
exit

# Then run seed again
npm run seed
```

## Production Build

### Backend Production

```powershell
cd backend
# Set environment
$env:NODE_ENV="production"

# Run production server
npm start
```

### Frontend Production

```powershell
cd frontend

# Build for production
npm run build

# Preview production build
npm run preview
```

The production build will be in `frontend/dist` directory.

### Deploy to Production

**Option 1: Traditional Server**
1. Copy `backend` and `frontend/dist` to server
2. Install dependencies on server
3. Set up PM2 for process management
4. Configure nginx as reverse proxy

**Option 2: Cloud Platform (Heroku, Railway, Render)**
1. Create MongoDB Atlas database
2. Update MONGODB_URI in environment variables
3. Push code to platform
4. Platform auto-deploys

## Environment Variables

### Backend (.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/smart-roster

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

## Database Backup & Restore

### Backup

```powershell
# Backup entire database
mongodump --db=smart-roster --out=./backup

# Backup specific collection
mongodump --db=smart-roster --collection=employees --out=./backup
```

### Restore

```powershell
# Restore database
mongorestore --db=smart-roster ./backup/smart-roster

# Restore specific collection
mongorestore --db=smart-roster --collection=employees ./backup/smart-roster/employees.bson
```

## Testing

### Backend Tests

```powershell
cd backend
npm test
```

### API Testing

Use tools like:
- Postman
- Thunder Client (VS Code extension)
- curl

Example API test:
```powershell
# Login
$response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -Body '{"username":"admin","password":"admin123"}' -ContentType "application/json"
$token = ($response.Content | ConvertFrom-Json).data.token

# Get employees
Invoke-WebRequest -Uri "http://localhost:5000/api/employees" -Headers @{"Authorization"="Bearer $token"}
```

## Development Tips

### Hot Reload

Both servers support hot reload:
- Backend: Nodemon watches for file changes
- Frontend: Vite HMR for instant updates

### Debug Mode

**Backend (VS Code):**
```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Backend",
  "program": "${workspaceFolder}/backend/src/server.js",
  "envFile": "${workspaceFolder}/backend/.env"
}
```

**Frontend (Browser DevTools):**
- Open Chrome DevTools (F12)
- Source maps enabled by default in Vite

### Database GUI

Install MongoDB Compass:
```powershell
winget install MongoDB.Compass
```

Connection string: `mongodb://localhost:27017/smart-roster`

## Next Steps

After setup:

1. Explore the Dashboard
2. Create/edit employees
3. Set up brands and processes
4. Create assignments
5. Generate a roster for current month
6. Review conflicts (if any)
7. Approve sample leave and revalidate roster

## Support

If you encounter issues:

1. Check this guide
2. Review error messages in terminal
3. Check browser console for frontend errors
4. Verify MongoDB is running
5. Ensure ports 5000 and 5173 are available

## Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
