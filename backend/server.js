// server.js
require("dotenv").config(); // MUST be first

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// CORS config: prefer BASE_URL from your .env, fallback to http://localhost:3000
const FRONTEND_ORIGIN =
  process.env.BASE_URL || process.env.FRONTEND_URL || "http://localhost:3000";
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());

// Import routes (keep names same as in your repo)
const voterRoutes = require("./routes/voter");
const authRoutes = require("./routes/auth");
const partyRoutes = require("./routes/party");

const candidateRoutes = require("./routes/candidateRoutes");
const candidateProfileRoutes = require("./routes/candidate");
const adminRoutes = require("./routes/admin");

// Mount routes
app.use("/voter", voterRoutes);
app.use("/party", partyRoutes);
app.use("/candidates", candidateRoutes);
app.use("/candidate", candidateProfileRoutes);
app.use("/admin", adminRoutes);

// Auth routes - includes /auth/login
app.use("/auth", authRoutes);

// Direct /login route that forwards to /auth/login
app.post("/login", async (req, res) => {
  // Import auth logic directly
  const bcrypt = require("bcrypt");
  const mongoose = require("mongoose");
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

// app.post("/logout", (req, res) => {
//   res.json({ success: true });
// });

// === DEBUG ROUTE - remove before final submission ===
app.post("/debug-login", express.json(), async (req, res) => {
  try {
    const { voter_id, phone, first_name, last_name } = req.body || {};
    const db = require("mongoose").connection.db;
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
// === end debug route ===

// Health route
app.get("/", (req, res) => res.send("API running"));

// Serve test login page
const path = require("path");
app.get("/test-login", (req, res) => {
  res.sendFile(path.join(__dirname, "test-login.html"));
});

// Temporary test route to verify DB seed (reads from 'candidates' collection)
app.get("/test-candidates", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    // if the collection doesn't exist it will return []
    const candidates = await db.collection("candidates").find().toArray();
    return res.json(candidates);
  } catch (err) {
    console.error("Error in /test-candidates:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Choose mongo URI: use MONGO_URI (from your .env). If not present, try LOCAL_MONGO_URI.
const mongoUri =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  process.env.LOCAL_MONGO_URI ||
  "";

// Helpful debug output (first 60 chars only, to avoid printing secrets)
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

// Connect to Mongo and then start server
const PORT = process.env.PORT || 5000;
mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ API available at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });

// Gracefully handle app termination
process.on("SIGINT", async () => {
  console.log("SIGINT received — closing Mongo connection");
  await mongoose.disconnect();
  process.exit(0);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

// Temporary test route to verify DB seed (reads from 'voters' collection)
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
