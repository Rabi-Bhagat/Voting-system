const express = require("express");
const router = express.Router();
const Voter = require("../models/Voter");
const Candidate = require("../models/Candidate");

// Get candidate profile
router.get("/:candidate_id", async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ candidate_id: req.params.candidate_id });
    
    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    // Get party info
    const Party = require("../models/Party");
    const party = await Party.findOne({ party_id: candidate.party_id });

    const candidateInfo = {
      ...candidate.toObject(),
      party_name: party ? party.name : "Unknown"
    };

    delete candidateInfo.password;

    res.json(candidateInfo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all voters (for candidate to view)
router.get("/voters/list", async (req, res) => {
  try {
    const voters = await Voter.find({}, { password: 0 }); // Exclude passwords
    res.json(voters);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch voters" });
  }
});

// Update candidate profile
router.put("/:candidate_id", async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ candidate_id: req.params.candidate_id });
    
    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    const { background, education, experience, age, password } = req.body;

    if (background !== undefined) candidate.background = background;
    if (education !== undefined) candidate.education = education;
    if (experience !== undefined) candidate.experience = experience;
    if (age !== undefined) candidate.age = age;
    
    // Hash password if provided
    if (password !== undefined && password.length > 0) {
      const bcrypt = require("bcrypt");
      candidate.password = await bcrypt.hash(password, 10);
    }

    await candidate.save();

    res.json({ message: "Profile updated successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
