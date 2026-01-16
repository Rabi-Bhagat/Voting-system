const express = require("express");
const router = express.Router();
const Voter = require("../models/Voter");
const Candidate = require("../models/Candidate");
const ElectionStatus = require("../models/ElectionStatus");

// GET /voter/profile/:voter_id - Get voter profile with detailed information
router.get("/profile/:voter_id", async (req, res) => {
  try {
    const voter = await Voter.findOne({ voter_id: req.params.voter_id });
    if (!voter) {
      return res.status(404).json({ error: "Voter not found" });
    }

    const Constituency = require("../models/Constituency");
    const constituency = await Constituency.findOne({ constituency_id: voter.constituency });

    // Get voting statistics
    const totalVoters = await Voter.countDocuments({ constituency: voter.constituency });
    const votedCount = await Voter.countDocuments({ 
      constituency: voter.constituency, 
      has_voted: true 
    });

    // Update last login
    voter.last_login = new Date();
    await voter.save();

    res.json({
      profile: {
        voter_id: voter.voter_id,
        name: `${voter.first_name} ${voter.last_name}`,
        email: voter.email,
        phone: voter.phone,
        address: voter.address,
        age: voter.age,
        gender: voter.gender,
        constituency: {
          id: voter.constituency,
          name: constituency?.name || "Unknown"
        },
        is_verified: voter.is_verified,
        verification_status: voter.is_verified ? "Verified" : "Pending",
        created_at: voter.created_at,
        last_login: voter.last_login
      },
      voting_info: {
        has_voted: voter.has_voted,
        voted_candidate_id: voter.voted_candidate_id,
        vote_timestamp: voter.vote_timestamp
      },
      constituency_stats: {
        total_voters: totalVoters,
        voted_count: votedCount,
        turnout_percentage: totalVoters > 0 ? ((votedCount / totalVoters) * 100).toFixed(2) : 0
      }
    });
  } catch (err) {
    console.error("Error fetching voter profile:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Get voter by voter_id
router.get("/:voter_id", async (req, res) => {
  try {
    const voter = await Voter.findOne({ voter_id: req.params.voter_id });

    const Constituency = require("../models/Constituency");
    if (voter) {
      const constituency = await Constituency.findOne({ constituency_id: voter.constituency });
      // Update last login
      voter.last_login = new Date();
      await voter.save();
      return res.json({ ...voter.toObject(), constituency });
    }

    if (!voter) return res.status(404).json({ error: "Voter not found" });
    res.json(voter);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get voter voting history
router.get("/history/:voter_id", async (req, res) => {
  try {
    const voter = await Voter.findOne({ voter_id: req.params.voter_id });
    if (!voter) return res.status(404).json({ error: "Voter not found" });

    if (!voter.has_voted) {
      return res.json({ 
        has_voted: false, 
        message: "You have not voted yet" 
      });
    }

    const candidate = await Candidate.findOne({ candidate_id: voter.voted_candidate_id });
    const party = candidate && candidate.party_id ? 
      await require("../models/Party").findOne({ party_id: candidate.party_id }) : 
      null;

    res.json({
      has_voted: true,
      voted_candidate: candidate ? candidate.name : "NOTA",
      voted_party: party ? party.name : "N/A",
      vote_timestamp: voter.vote_timestamp,
      constituency: voter.constituency
    });
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

// Get candidates for voter's constituency (ballot)
router.get("/ballot/:voterId", async (req, res) => {
    try {
        const voter = await Voter.findOne({ voter_id: req.params.voterId });
        if (!voter) return res.status(404).json({ error: "Voter not found." });

        const candidates = await Candidate.aggregate([
          { $match: { constituency: voter.constituency } },
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
      if (candidate.constituency !== voter.constituency) {
        return res.status(400).json({ error: "Invalid constituency." });
      }

      candidate.votes = (candidate.votes || 0) + 1;
      await candidate.save();
    } else {
      const notaEntry = await Candidate.findOne({ candidate_id: "NOTA", constituency: voter.constituency });
      if (notaEntry) {
        notaEntry.votes = (notaEntry.votes || 0) + 1;
        await notaEntry.save();
      } else {
        await Candidate.create({
          candidate_id: "NOTA",
          name: "None of the Above",
          constituency: voter.constituency,
          votes: 1,
          party_id: null
        });
      }
    }

    voter.has_voted = true;
    voter.voted_candidate_id = candidate_id;
    voter.vote_timestamp = new Date();
    await voter.save();

    // Mark election as conducted
    await ElectionStatus.deleteMany({});
    await ElectionStatus.create({ conducted: true });

    return res.json({ 
      message: "Vote cast successfully!",
      timestamp: voter.vote_timestamp
    });
  } catch (err) {
    console.error("Vote error:", err);
    return res.status(500).json({ error: "Server error while voting." });
  }
});


module.exports = router;