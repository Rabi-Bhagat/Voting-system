const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Import models
const Voter = require("../models/Voter"); 
const Party = require("../models/Party");
const Constituency = require("../models/Constituency");

// POST /login
router.post("/login", async (req, res) => {
  const { role } = req.body;

  try {
    if (role === "admin") {
      const { password } = req.body;
      if (password === "admin123") {
        return res.json({ success: true, redirect: "/admin", admin: { role: "admin" } });
      }
      return res.status(401).json({ error: "Invalid Admin credentials" });
    }

  if (role === "voter") {
    const { voter_id, password } = req.body;

    // Find voter by voter_id and password
    const voter = await Voter.findOne({ voter_id, password });
    
    if (voter) {
      return res.json({
        success: true,
        redirect: "/voter_dashboard",
        voter: {
          voter_id: voter.voter_id,
          first_name: voter.first_name,
          last_name: voter.last_name,
          address: voter.address,
          phone: voter.phone,
          constituency: voter.constituency,
          has_voted: voter.has_voted,
          voted_candidate_id: voter.voted_candidate_id,
        }
      });
    }
    return res.status(401).json({ error: "Invalid Voter credentials" });
  }

    if (role === "party") {
      const { party_id, password } = req.body;

      const party = await Party.findOne({ party_id, password });
      if (party) {
        return res.json({
          success: true,
          redirect: "/party",
          party: {
            party_id: party.party_id,
            password: party.password
          }
        });
      }
      return res.status(401).json({ error: "Invalid Party credentials" });
    }

    if (role === "constituency") {
      const { constituency_id, password } = req.body;

      const constituency = await Constituency.findOne({ constituency_id, password });
      if (constituency) {
        return res.json({
          success: true,
          redirect: "/constituency_admin",
          constituency: {
            constituency_id: constituency.constituency_id,
            password: constituency.password
          }
        });
      }
      return res.status(401).json({ error: "Invalid Constituency credentials" });
    }

    res.status(400).json({ error: "Invalid role" });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
