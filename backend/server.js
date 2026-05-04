// server.js
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// ============================================
// MIDDLEWARE SETUP
// ============================================

// CORS configuration
const FRONTEND_ORIGIN =
  process.env.BASE_URL || process.env.FRONTEND_URL || "http://localhost:3000";

const allowedOrigins = [
  FRONTEND_ORIGIN,
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:3002",
  "http://127.0.0.1:3003"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// ROUTES IMPORT
// ============================================

const voterRoutes = require("./routes/voter");
const authRoutes = require("./routes/auth");
const partyRoutes = require("./routes/party");
const constituencyRoutes = require("./routes/constituency");
const candidateRoutes = require("./routes/candidateRoutes");
const candidateProfileRoutes = require("./routes/candidate");
const adminRoutes = require("./routes/admin");
const authMiddleware = require("./middleware/auth");
const analyticsRoutes = require("./routes/analytics");
const passwordRecoveryRoutes = require("./routes/passwordRecovery");
const adminManagementRoutes = require("./routes/adminManagement");
const adminDashboardRoutes = require("./routes/adminDashboard");

// New feature routes
const electionRoutes = require("./routes/election");
const auditRoutes = require("./routes/audit");
const notificationRoutes = require("./routes/notification");

// ============================================
// ROUTE SETUP
// ============================================

app.use("/voter", authMiddleware, voterRoutes);
app.use("/auth", authRoutes);
app.use("/party", authMiddleware, partyRoutes);
app.use("/constituency", authMiddleware, constituencyRoutes);
app.use("/candidates", candidateRoutes); // Public fetching might be okay, assuming UI doesn't pass token to list candidates
app.use("/candidate", authMiddleware, candidateProfileRoutes);
app.use("/admin", authMiddleware, adminRoutes);
app.use("/analytics", authMiddleware, analyticsRoutes);
app.use("/password-recovery", passwordRecoveryRoutes);
app.use("/admin-management", authMiddleware, adminManagementRoutes);
app.use("/admin-dashboard", authMiddleware, adminDashboardRoutes);

// New feature routes
app.use("/election", authMiddleware, electionRoutes);
app.use("/audit", authMiddleware, auditRoutes);
app.use("/notifications", authMiddleware, notificationRoutes);

app.use("/", authRoutes);

// ============================================
// SPECIAL ENDPOINTS
// ============================================

// Direct /login route removed - use /auth/login instead

// Logout endpoint
app.post("/logout", (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
});

// Health check
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

// Root route
app.get("/", (req, res) => res.send("API running"));

// DB Status check
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

// Serve test login page
app.get("/test-login", (req, res) => {
  res.sendFile(path.join(__dirname, "test-login.html"));
});

// Debug routes (for development)
app.post("/debug-login", express.json(), async (req, res) => {
  try {
    const { voter_id, phone, first_name, last_name } = req.body || {};
    const db = mongoose.connection.db;
    let user = null;

    if (voter_id) user = await db.collection("voters").findOne({ voter_id });
    if (!user && phone) user = await db.collection("voters").findOne({ phone });
    if (!user && first_name && last_name)
      user = await db.collection("voters").findOne({ first_name, last_name });

    return res.json({ found: !!user, user });
  } catch (err) {
    console.error("debug-login error", err);
    return res.status(500).json({ error: err.message });
  }
});

// Test routes for development
app.get("/test-candidates", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const candidates = await db.collection("candidates").find().toArray();
    return res.json(candidates);
  } catch (err) {
    console.error("Error in /test-candidates:", err);
    return res.status(500).json({ error: err.message });
  }
});

app.get("/test-voters", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const voters = await db.collection("voters").find().toArray();
    res.json(voters);
  } catch (err) {
    console.error("Error in /test-voters:", err);
    res.status(500).json({ error: err.message });
  }
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
// DATABASE CONNECTION & SERVER STARTUP
// ============================================

const mongoUri =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  process.env.LOCAL_MONGO_URI ||
  "";

console.log("DEBUG: FRONTEND_ORIGIN =", FRONTEND_ORIGIN);
console.log("DEBUG: PORT =", process.env.PORT || 5000);
console.log("DEBUG: MONGO_URI set?", !!mongoUri);

if (mongoUri) {
  console.log(
    "DEBUG: MONGO_URI (start) =>",
    mongoUri.slice(0, 60) + (mongoUri.length > 60 ? "..." : "")
  );
} else {
  console.warn("WARN: No Mongo URI provided. Set MONGO_URI in your .env.");
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

mongoose
  .connect(mongoUri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    console.log(`📊 Database: ${mongoose.connection.name}`);
    
    app.listen(PORT, () => {
      console.log(`\n✅ Server running on port ${PORT}`);
      console.log(`🌐 Frontend URL: ${FRONTEND_ORIGIN}`);
      console.log(`📊 Health Check: http://localhost:${PORT}/health`);
      console.log(`🗄️  DB Status: http://localhost:${PORT}/db-status`);
      console.log("\n✨ System ready for requests!\n");
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down server...");
  await mongoose.disconnect();
  process.exit(0);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

module.exports = app;
