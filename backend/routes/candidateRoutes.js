const express = require("express");
const router = express.Router();
const Candidate = require("../models/Candidate");
const Party = require("../models/Party");

// GET /candidates/profile/:candidate_id - Get candidate profile with detailed information
router.get("/profile/:candidate_id", async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ candidate_id: req.params.candidate_id });
    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    const party = await Party.findOne({ party_id: candidate.party_id });
    const Constituency = require("../models/Constituency");
    const constituency = await Constituency.findOne({ constituency_id: candidate.constituency });

    // Get constituency statistics
    const totalCandidates = await Candidate.countDocuments({ constituency: candidate.constituency });
    const totalVotes = await Candidate.aggregate([
      { $match: { constituency: candidate.constituency } },
      { $group: { _id: null, total: { $sum: "$votes" } } }
    ]);

    const totalVotesInConstituency = totalVotes[0]?.total || 0;
    const votePercentage = totalVotesInConstituency > 0 
      ? ((candidate.votes / totalVotesInConstituency) * 100).toFixed(2) 
      : 0;

    res.json({
      profile: {
        candidate_id: candidate.candidate_id,
        name: candidate.name,
        age: candidate.age,
        education: candidate.education,
        experience: candidate.experience,
        bio: candidate.bio,
        background: candidate.background,
        image_url: candidate.image_url,
        created_at: candidate.created_at,
        approved: candidate.approved
      },
      party_info: {
        party_id: candidate.party_id,
        party_name: party?.name || "Unknown",
        party_symbol: party?.symbol,
        party_color: party?.color
      },
      constituency_info: {
        constituency_id: candidate.constituency,
        constituency_name: constituency?.name || "Unknown"
      },
      voting_stats: {
        votes: candidate.votes,
        vote_percentage: `${votePercentage}%`,
        total_candidates_in_constituency: totalCandidates,
        total_votes_in_constituency: totalVotesInConstituency
      }
    });
  } catch (err) {
    console.error("Error fetching candidate profile:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// GET /candidates/:constituencyId
router.get("/:constituencyId", async (req, res) => {
  const { constituencyId } = req.params;

  try {
    const candidates = await Candidate.aggregate([
      { $match: { constituency: constituencyId } },
      {
        $lookup: {
          from: "parties",
          localField: "party_id",
          foreignField: "party_id",
          as: "partyInfo"
        }
      },
      {
        $unwind: { path: "$partyInfo", preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          _id: 0,
          candidate_id: 1,
          name: 1,
          votes: 1,
          party_name: "$partyInfo.name"
        }
      }
    ]);

    res.json(candidates);
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
