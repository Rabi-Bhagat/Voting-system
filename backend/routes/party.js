const express = require("express");
const router = express.Router();
const Party = require("../models/Party");
const Candidate = require("../models/Candidate");
const Constituency = require("../models/Constituency");

//GET /party/:id => Fetch party details along with all its candidates
router.get("/:id", async (req, res) => {
  try {
    const party = await Party.findOne({ party_id: req.params.id });

    if (!party) {
      return res.status(404).json({ error: "Party not found" });
    }

    const candidates = await Candidate.find({ party_id: party.party_id });

    res.json({
      party_id: party.party_id,
      name: party.name,
      candidates: candidates.map(candidate => ({
        candidate_id: candidate.candidate_id,
        name: candidate.name,
        constituency: candidate.constituency
      }))
    });
  } catch (err) {
    console.error("Error fetching party info:", err);
    res.status(500).json({ error: "Server error" });
  }
});

//POST /party/edit-candidates => Create or update party details (name/password)
router.post("/edit-candidates", async (req, res) => {
  const { party_id, name, password } = req.body;

  if (!party_id || !name || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const existingParty = await Party.findOne({ party_id });

    if (existingParty) {
      existingParty.name = name;
      existingParty.password = password;
      await existingParty.save();
      return res.json({ success: true, message: "Party info updated" });
    }

    const newParty = new Party({ party_id, name, password });
    await newParty.save();

    res.json({ success: true, message: "Party created" });
  } catch (err) {
    console.error("Error editing party:", err);
    res.status(500).json({ error: "Server error" });
  }
});

//POST /party/add-candidate => Add a new candidate to a party (only if constituency is valid)
router.post("/add-candidate", async (req, res) => {
  const { candidate_id, name, constituency, party_id } = req.body;

  if (!candidate_id || !name || !constituency || !party_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Validate constituency
    const validConstituency = await Constituency.findOne({ name: constituency });
    if (!validConstituency) {
      return res.status(400).json({ error: "Invalid constituency" });
    }

    // Ensure candidate_id is unique
    const existingCandidate = await Candidate.findOne({ candidate_id });
    if (existingCandidate) {
      return res.status(400).json({ error: "Candidate ID already exists" });
    }

    const newCandidate = new Candidate({
      candidate_id,
      name,
      constituency,
      party_id
    });

    await newCandidate.save();

    res.status(201).json({ success: true, message: "Candidate added successfully" });
  } catch (err) {
    console.error("Error adding candidate:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
