// server.js
require("dotenv").config(); // MUST be first

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// CORS config: Allow both local and production URLs
const allowedOrigins = [
  "http://localhost:3000",
  "https://onlinevotingsystem-5u2f86nzo-rabi-bhagats-projects.vercel.app",
  process.env.BASE_URL,
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.some(allowed => origin.includes(allowed.replace('https://', '').replace('http://', '')))) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all for now, restrict later if needed
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Import routes (keep names same as in your repo)
const voterRoutes = require("./routes/voter");
const authRoutes = require("./routes/auth");
const partyRoutes = require("./routes/party");
const constituencyRoutes = require("./routes/constituency");
const candidateRoutes = require("./routes/candidateRoutes");
const adminRoutes = require("./routes/admin");

// Mount routes
app.use("/voter", voterRoutes);
app.use("/auth", authRoutes);
app.use("/party", partyRoutes);
app.use("/constituency", constituencyRoutes);
app.use("/candidates", candidateRoutes);
app.use("/admin", adminRoutes);

// Root auth route (your repo used this previously)
app.use("/", authRoutes);

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
