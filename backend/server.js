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

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
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
app.use("/candidate", candidateProfileRoutes);
app.use("/admin", adminRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/password-recovery", passwordRecoveryRoutes);
app.use("/admin-management", adminManagementRoutes);
app.use("/admin-dashboard", adminDashboardRoutes);
app.use("/", authRoutes);

// ============================================
// SPECIAL ENDPOINTS
// ============================================

// Direct /login route
app.post("/login", async (req, res) => {
  const bcrypt = require("bcrypt");
  const { adminCredentials } = require("./config/admin");
  
  try {
    const { voter_id, first_name, last_name, party_id, candidate_id, password, role, username } = req.body || {};
    const resolvedRole = (role || "voter").toString().toLowerCase();

    console.log("DEBUG /login body:", { voter_id, party_id, candidate_id, role: resolvedRole });

    if (!password) {
      return res.status(400).json({ error: "Password required" });
    }

    const db = mongoose.connection.db;
    let user = null;
    let redirect = "/";

    if (resolvedRole === "voter") {
      if (!voter_id || !first_name || !last_name) {
        return res.status(400).json({ error: "Voter ID, first name, and last name required" });
      }
      user = await db.collection("voters").findOne({ 
        voter_id: voter_id,
        first_name: first_name,
        last_name: last_name
      });
      
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      redirect = "/voter_dashboard";
      const safeUser = { ...user };
      delete safeUser.password;
      
      return res.json({ 
        success: true, 
        role: "voter", 
        voter: safeUser,
        redirect: redirect
      });
      
    } else if (resolvedRole === "admin") {
      const adminUsername = username || "admin";
      
      if (adminUsername === adminCredentials.username && password === adminCredentials.password) {
        return res.json({ 
          success: true, 
          role: "admin", 
          admin: { username: adminCredentials.username },
          redirect: "/admin"
        });
      } else {
        return res.status(401).json({ error: "Invalid admin credentials" });
      }
      
    } else if (resolvedRole === "candidate") {
      if (!candidate_id) {
        return res.status(400).json({ error: "Candidate ID required" });
      }
      user = await db.collection("candidates").findOne({ candidate_id: candidate_id });
      
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      if (!user.approved) {
        return res.status(403).json({ error: "Your account is pending admin approval" });
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      redirect = "/candidate_dashboard";
      const safeUser = { ...user };
      delete safeUser.password;
      
      return res.json({ 
        success: true, 
        role: "candidate", 
        candidate: safeUser,
        redirect: redirect
      });
      
    } else if (resolvedRole === "party") {
      if (!party_id) {
        return res.status(400).json({ error: "Party ID required" });
      }
      user = await db.collection("parties").findOne({ party_id: party_id });
      
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      if (user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      redirect = "/party";
      const safeUser = { ...user };
      delete safeUser.password;
      
      return res.json({ 
        success: true, 
        role: "party", 
        party: safeUser,
        redirect: redirect
      });
    }
    
    return res.status(400).json({ error: "Invalid role" });
    
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

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
