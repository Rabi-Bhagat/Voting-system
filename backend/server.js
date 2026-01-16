const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

const app = express();

// ============================================
// MIDDLEWARE SETUP
// ============================================

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// GLOBAL MONGODB CONNECTION
// ============================================

const connectMongoDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI not found in environment variables");
    }

    console.log("🔄 Connecting to MongoDB Atlas...");

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });

    console.log("✅ MongoDB Atlas connected successfully!");
    console.log(`📊 Database: voting_system`);
    console.log(`🔐 User: rabibhagat`);
    console.log(`🌐 Cluster: cluster0.grzsv45.mongodb.net`);

    return mongoose.connection;
  } catch (error) {
    console.error("❌ MongoDB connection error:");
    console.error(`   Error: ${error.message}`);
    console.error(`   Type: ${error.name}`);

    if (error.name === "MongooseServerSelectionError") {
      console.error("   💡 Troubleshooting:");
      console.error("      1. Check if your IP is whitelisted in MongoDB Atlas");
      console.error("      2. Verify credentials: rabibhagat / 1r2a3b4i123");
      console.error("      3. Check internet connection");
      console.error("      4. Verify cluster URL is correct");
    }

    throw error;
  }
};

// Connect to MongoDB on startup
connectMongoDB().catch(err => {
  console.error("Failed to connect to MongoDB. Exiting...");
  process.exit(1);
});

// ============================================
// ROUTES IMPORT
// ============================================

const voterRoutes = require("./routes/voter");
const authRoutes = require("./routes/auth");
const partyRoutes = require("./routes/party");
const constituencyRoutes = require("./routes/constituency");
const candidateRoutes = require("./routes/candidateRoutes");
const adminRoutes = require("./routes/admin");
const analyticsRoutes = require("./routes/analytics");
const passwordRecoveryRoutes = require("./routes/passwordRecovery");
const adminManagementRoutes = require("./routes/adminManagement");
const adminDashboardRoutes = require("./routes/adminDashboard");

// ============================================
// ROUTE SETUP
// ============================================

app.use("/voter", voterRoutes);
app.use("/auth", authRoutes);
app.use("/party", partyRoutes);
app.use("/constituency", constituencyRoutes);
app.use("/candidates", candidateRoutes);
app.use("/admin", adminRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/password-recovery", passwordRecoveryRoutes);
app.use("/admin-management", adminManagementRoutes);
app.use("/admin-dashboard", adminDashboardRoutes);
app.use("/", authRoutes);

// ============================================
// SPECIAL ENDPOINTS
// ============================================

app.post("/logout", (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
});

app.get("/health", (req, res) => {
  const PORT = process.env.PORT || 5000;
  const dbStatus = mongoose.connection.readyState === 1 ? "✅ Connected" : "❌ Disconnected";
  
  res.json({
    status: "Backend is running",
    port: PORT,
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

app.get("/db-status", (req, res) => {
  const states = {
    0: "Disconnected",
    1: "Connected",
    2: "Connecting",
    3: "Disconnecting",
  };
  
  res.json({
    connection: {
      status: states[mongoose.connection.readyState],
      readyState: mongoose.connection.readyState,
      database: mongoose.connection.name,
    },
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.path} not found`,
  });
});

app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// SERVER STARTUP
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n✅ Server running on port ${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/health`);
  console.log(`🗄️  DB Status: http://localhost:${PORT}/db-status`);
  console.log("\n✨ System ready for requests!\n");
});

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n\n🛑 Shutting down server...");
  await mongoose.disconnect();
  process.exit(0);
});

module.exports = app;
