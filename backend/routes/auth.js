const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

router.post("/login", async (req, res) => {
  try {
    const { voter_id, first_name, last_name, party_id, constituency_id, password, role } = req.body || {};
    const resolvedRole = (role || "voter").toString().toLowerCase();

    console.log("DEBUG /auth/login body:", { voter_id, party_id, constituency_id, role: resolvedRole });

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
      redirect = "/voter_dashboard";
    } else if (resolvedRole === "party") {
      if (!party_id) {
        return res.status(400).json({ error: "Party ID required" });
      }
      user = await db.collection("parties").findOne({ party_id: party_id });
      redirect = "/party";
    } else if (resolvedRole === "constituency" || resolvedRole === "const") {
      if (!constituency_id) {
        return res.status(400).json({ error: "Constituency ID required" });
      }
      user = await db.collection("constituencies").findOne({ constituency_id: constituency_id });
      redirect = "/constituency_admin";
    } else if (resolvedRole === "admin") {
      // Simple admin check - password is "admin123"
      if (password === "admin123") {
        return res.json({ 
          success: true, 
          role: "admin", 
          admin: { username: "admin" },
          redirect: "/admin"
        });
      } else {
        return res.status(401).json({ error: "Invalid admin credentials" });
      }
    } else {
      return res.status(400).json({ error: "Invalid role" });
    }

    if (!user) {
      console.log("DEBUG login: user not found for", resolvedRole);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (user.password && user.password !== password) {
      console.log("DEBUG login: password mismatch");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const safeUser = { ...user };
    delete safeUser.password;

    const responseKey = resolvedRole === "voter" ? "voter" : 
                       resolvedRole === "party" ? "party" : 
                       "constituency";

    return res.json({ 
      success: true, 
      role: resolvedRole, 
      [responseKey]: safeUser,
      redirect: redirect
    });
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
