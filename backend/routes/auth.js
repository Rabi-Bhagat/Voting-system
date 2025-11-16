const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Adjust to your exported router structure. This snippet is the handler only.
router.post("/login", async (req, res) => {
  try {
    const { voter_id, password, role } = req.body || {};
    const resolvedRole = (role || "voter").toString().toLowerCase();

    console.log("DEBUG /auth/login body:", { voter_id, role: resolvedRole });

    if (!voter_id || !password) {
      return res.status(400).json({ error: "voter_id and password required" });
    }

    const db = mongoose.connection.db;
    let user = null;

    if (resolvedRole === "voter") {
      user = await db.collection("voters").findOne({ voter_id: voter_id });
    } else if (resolvedRole === "party") {
      user = await db.collection("parties").findOne({ party_id: voter_id });
    } else if (resolvedRole === "constituency" || resolvedRole === "const") {
      user = await db
        .collection("constituencies")
        .findOne({ constituency_id: voter_id });
    } else if (resolvedRole === "admin") {
      // If admin stored in collection 'admin' or in some config, change accordingly
      user =
        (await db.collection("admins").findOne({ admin_id: voter_id })) ||
        (await db.collection("admins").findOne({ username: voter_id }));
    } else {
      return res.status(400).json({ error: "Invalid role" });
    }

    if (!user) {
      console.log("DEBUG login: user not found for", resolvedRole, voter_id);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Plain-text compare (matches your seeded data). If you use hashed passwords, replace with bcrypt.compare.
    if (user.password && user.password !== password) {
      console.log("DEBUG login: password mismatch for", voter_id);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Remove sensitive fields before returning
    const safeUser = { ...user };
    delete safeUser.password;
    // Optionally delete tokens or other sensitive fields
    delete safeUser.token;

    // Success: return something your frontend expects (adjust shape if needed)
    return res.json({ success: true, role: resolvedRole, user: safeUser });
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
