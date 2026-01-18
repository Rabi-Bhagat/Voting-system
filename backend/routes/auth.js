const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Voter = require("../models/Voter");
const Candidate = require("../models/Candidate");
const Party = require("../models/Party");
const Constituency = require("../models/Constituency");
const { adminCredentials } = require("../config/admin");

// Register Voter
router.post("/register-voter", async (req, res) => {
  try {
    const { voter_id, first_name, last_name, password, confirm_password, phone, address, constituency } = req.body;

    // Validation
    if (!voter_id || !first_name || !last_name || !password || !phone || !address) {
      return res.status(400).json({ error: "All required fields must be filled" });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Check if voter already exists
    const existingVoter = await Voter.findOne({ voter_id });
    if (existingVoter) {
      return res.status(409).json({ error: "Voter ID already exists" });
    }

    // Check if constituency exists (only if provided)
    if (constituency) {
      const constituencyExists = await Constituency.findOne({ constituency_id: constituency });
      if (!constituencyExists) {
        return res.status(400).json({ error: "Invalid constituency" });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new voter
    const newVoter = new Voter({
      voter_id,
      first_name,
      last_name,
      password: hashedPassword,
      phone,
      address,
      constituency: constituency || null,
      has_voted: false,
      voted_candidate_id: null
    });

    await newVoter.save();

    return res.status(201).json({ 
      success: true, 
      message: "Voter registered successfully! You can now login." 
    });
  } catch (err) {
    console.error("Voter registration error:", err);
    return res.status(500).json({ error: "Server error during registration" });
  }
});

// Register Candidate
router.post("/register-candidate", async (req, res) => {
  try {
    const { 
      candidate_id, name, password, confirm_password, party_id, constituency,
      age, education, experience, background 
    } = req.body;

    // Validation
    if (!candidate_id || !name || !password || !party_id || !constituency) {
      return res.status(400).json({ error: "All required fields must be filled" });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Check if candidate already exists
    const existingCandidate = await Candidate.findOne({ candidate_id });
    if (existingCandidate) {
      return res.status(409).json({ error: "Candidate ID already exists" });
    }

    // Check if party exists
    const partyExists = await Party.findOne({ party_id });
    if (!partyExists) {
      return res.status(400).json({ error: "Invalid party" });
    }

    // Check if constituency exists
    const constituencyExists = await Constituency.findOne({ constituency_id: constituency });
    if (!constituencyExists) {
      return res.status(400).json({ error: "Invalid constituency" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new candidate
    const newCandidate = new Candidate({
      candidate_id,
      name,
      password: hashedPassword,
      party_id,
      constituency,
      age: age || null,
      education: education || "",
      experience: experience || "",
      background: background || "",
      approved: false, // Requires admin approval
      votes: 0
    });

    await newCandidate.save();

    return res.status(201).json({ 
      success: true, 
      message: "Candidate registered successfully! Awaiting admin approval before you can login." 
    });
  } catch (err) {
    console.error("Candidate registration error:", err);
    return res.status(500).json({ error: "Server error during registration" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { voter_id, first_name, last_name, party_id, constituency_id, candidate_id, password, role } = req.body || {};
    const resolvedRole = (role || "voter").toString().toLowerCase();

    console.log("DEBUG /auth/login body:", { voter_id, party_id, constituency_id, candidate_id, role: resolvedRole });

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
    } else if (resolvedRole === "candidate") {
      if (!candidate_id) {
        return res.status(400).json({ error: "Candidate ID required" });
      }
      user = await db.collection("candidates").findOne({ candidate_id: candidate_id });
      
      // Check if candidate is approved
      if (user && !user.approved) {
        return res.status(403).json({ error: "Your account is pending admin approval" });
      }
      
      redirect = "/candidate_dashboard";
    } else if (resolvedRole === "party") {
      if (!party_id) {
        return res.status(400).json({ error: "Party ID required" });
      }
      user = await db.collection("parties").findOne({ party_id: party_id });
      redirect = "/party";
    } else if (resolvedRole === "constituency") {
      if (!constituency_id) {
        return res.status(400).json({ error: "Constituency ID required" });
      }
      const constituency = await Constituency.findOne({ constituency_id, password });
      if (constituency) {
        return res.json({
          success: true,
          redirect: "/constituency_admin",
          constituency: {
            constituency_id: constituency.constituency_id,
            name: constituency.name
          }
        });
      }
      return res.status(401).json({ error: "Invalid Constituency credentials" });
    } else if (resolvedRole === "admin") {
      // Admin authentication
      const username = req.body.username || req.body.admin_username || "admin";
      
      console.log("DEBUG admin login attempt:", { username, password, expected_user: adminCredentials.username, expected_pass: adminCredentials.password });
      
      if (username === adminCredentials.username && password === adminCredentials.password) {
        return res.json({ 
          success: true, 
          role: "admin", 
          admin: { username: adminCredentials.username },
          redirect: "/admin"
        });
      } else {
        console.log("DEBUG admin login failed - credentials mismatch");
        return res.status(401).json({ error: "Invalid admin credentials" });
      }
    } else {
      return res.status(400).json({ error: "Invalid role" });
    }

    if (!user) {
      console.log("DEBUG login: user not found for", resolvedRole);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password using bcrypt for voter and candidate
    if (resolvedRole === "voter" || resolvedRole === "candidate") {
      if (!user.password) {
        console.log("DEBUG login: no password stored for user");
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log("DEBUG login: password mismatch (bcrypt)");
        return res.status(401).json({ error: "Invalid credentials" });
      }
    } else if (resolvedRole === "party") {
      // Party uses plain text password (for now)
      if (user.password && user.password !== password) {
        console.log("DEBUG login: party password mismatch");
        return res.status(401).json({ error: "Invalid credentials" });
      }
    }

    const safeUser = { ...user };
    delete safeUser.password;

    const responseKey = resolvedRole === "voter" ? "voter" : 
                       resolvedRole === "candidate" ? "candidate" :
                       "party";

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
