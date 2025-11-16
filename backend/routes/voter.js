const express = require("express");
const router = express.Router();
const Voter = require("../models/Voter");
const Candidate = require("../models/Candidate");
const ElectionStatus = require("../models/ElectionStatus");

// Get voter by voter_id
router.get("/:voter_id", async (req, res) => {
  try {
    const voter = await Voter.findOne({ voter_id: req.params.voter_id });

    const Constituency = require("../models/Constituency");
    if (voter) {
      const constituency = await Constituency.findOne({ constituency_id: voter.constituency });
      return res.json({ ...voter.toObject(), constituency });
    }

    if (!voter) return res.status(404).json({ error: "Voter not found" });
    res.json(voter);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update voter by voter_id
router.put("/:voter_id", async (req, res) => {
  try {
    const voter = await Voter.findOne({ voter_id: req.params.voter_id });
    if (!voter) return res.status(404).json({ error: "Voter not found" });

    const { address, phone, password } = req.body;

    if (address !== undefined) voter.address = address;
    if (phone !== undefined) voter.phone = phone;
    if (password !== undefined) voter.password = password;

    await voter.save();

    res.json({ message: "Profile updated successfully!" });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Server error while updating profile." });
  }
});

// Get all candidates (ballot)
router.get("/ballot/:voterId", async (req, res) => {
    try {
        const voter = await Voter.findOne({ voter_id: req.params.voterId });
        if (!voter) return res.status(404).json({ error: "Voter not found." });

        const candidates = await Candidate.aggregate([
          { $match: { candidate_id: { $ne: "NOTA" } } }, // Exclude NOTA from initial list
          {
            $lookup: {
              from: "parties",
              localField: "party_id",
              foreignField: "party_id",
              as: "partyInfo"
            }
          },
          { $unwind: "$partyInfo" },
          {
            $project: {
              candidate_id: 1,
              name: 1,
              party_id: 1,
              constituency: 1,
              votes: 1,
              party_name: "$partyInfo.name"
            }
          }
        ]);

        res.json({ voter, candidates });
    } catch (err) {
        console.error("Ballot fetch error:", err);
        res.status(500).json({ error: "Failed to fetch ballot data." });
    }
});


router.post("/vote", async (req, res) => {
  const { voter_id, candidate_id } = req.body;
  console.log("Vote received:", req.body);

  try {
    const voter = await Voter.findOne({ voter_id });
    if (!voter) return res.status(404).json({ error: "Voter not found." });
    if (voter.has_voted) return res.status(400).json({ error: "You have already voted." });

    if (candidate_id !== "NOTA") {
      const candidate = await Candidate.findOne({ candidate_id });
      if (!candidate) return res.status(404).json({ error: "Candidate not found." });

      candidate.votes = (candidate.votes || 0) + 1;
      await candidate.save();
    } else {
      // Handle NOTA vote
      const notaEntry = await Candidate.findOne({ candidate_id: "NOTA" });
      if (notaEntry) {
        notaEntry.votes = (notaEntry.votes || 0) + 1;
        await notaEntry.save();
      } else {
        await Candidate.create({
          candidate_id: "NOTA",
          name: "None of the Above",
          votes: 1,
          party_id: null
        });
      }
    }

    voter.has_voted = true;
    voter.voted_candidate_id = candidate_id;
    await voter.save();

    // Mark election as conducted
    await ElectionStatus.deleteMany({});
    await ElectionStatus.create({ conducted: true });

    return res.json({ message: "Vote cast successfully!" });
  } catch (err) {
    console.error("Vote error:", err);
    return res.status(500).json({ error: "Server error while voting." });
  }
});


module.exports = router;