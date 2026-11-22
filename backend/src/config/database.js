// const mongoose = require('mongoose');
// const dns = require('dns');

// const connectDB = async () => {
//   if (!process.env.MONGODB_URI) {
//     throw new Error('MONGODB_URI is not configured');
//   }

//   if (process.env.DNS_SERVERS) {
//     const servers = process.env.DNS_SERVERS.split(',').map(server => server.trim()).filter(Boolean);
//     if (servers.length === 0) {
//       throw new Error('DNS_SERVERS must contain at least one valid DNS server address');
//     }
//     dns.setServers(servers);
//   }

//   const conn = await mongoose.connect(process.env.MONGODB_URI, {
//     serverSelectionTimeoutMS: 10000,
//     dbName: process.env.MONGODB_DB_NAME || 'smart-roster'
//   });
//   console.log(`MongoDB Connected: ${conn.connection.host}`);
//   return conn;
// };

// module.exports = connectDB;



const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    throw new Error("MONGODB_URI is not configured");
  }

  try {
    console.log("Connecting to MongoDB Atlas...");

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      retryWrites: true,
      dbName: process.env.MONGODB_DB_NAME || "smart-roster"
    });

    console.log('MongoDB Connected');

    return conn;

  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    throw error;
  }
};

module.exports = connectDB;
