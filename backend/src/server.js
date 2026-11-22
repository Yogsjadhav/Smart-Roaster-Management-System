const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const User = require('./models/User');
const dns = require("node:dns");

// Configure Google DNS for MongoDB Atlas SRV lookup
dns.setServers([
    "8.8.8.8",
    "8.8.4.4"
]);

// Load env vars
dotenv.config();

const app = express();

// Body parser
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/brands', require('./routes/brands'));
app.use('/api/processes', require('./routes/processes'));
app.use('/api/pods', require('./routes/pods'));
app.use('/api/leaves', require('./routes/leaves'));
app.use('/api/rosters', require('./routes/rosters'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/holidays', require('./routes/holidays'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;

const prepareUserRoles = async () => {
  await User.updateMany(
    { role: { $nin: ['manager', 'employee'] } },
    { $set: { role: 'employee' } }
  );

  const managers = await User.find({ role: 'manager' })
    .sort({ createdAt: 1, _id: 1 })
    .select('_id')
    .lean();

  if (managers.length > 1) {
    await User.updateMany(
      { role: 'manager', _id: { $ne: managers[0]._id } },
      { $set: { role: 'employee' } }
    );
  }

  await User.createIndexes();
};

// Error handler
app.use(errorHandler);

const startServer = async () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters');
  }
  await connectDB();
  await prepareUserRoles();
  return app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'production'} mode on port ${PORT}`);
  });
};

if (require.main === module) {
  startServer().catch(error => {
    console.error(`Application startup failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = app;
module.exports.startServer = startServer;
