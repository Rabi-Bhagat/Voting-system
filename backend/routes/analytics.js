const express = require("express");
const router = express.Router();
const Voter = require("../models/Voter");
const Candidate = require("../models/Candidate");
const Party = require("../models/Party");
const Constituency = require("../models/Constituency");
const VotingAnalytics = require("../models/VotingAnalytics");

// GET /analytics/dashboard - Get overall voting statistics
router.get("/dashboard", async (req, res) => {
  try {
    const totalVoters = await Voter.countDocuments();
    const totalVotesCast = await Voter.countDocuments({ has_voted: true });
    const voterTurnout = totalVoters > 0 ? ((totalVotesCast / totalVoters) * 100).toFixed(2) : 0;

    const totalConstituencies = await Constituency.countDocuments();
    const totalParties = await Party.countDocuments();
    const totalCandidates = await Candidate.countDocuments();

    const genderStats = await Voter.aggregate([
      {
        $group: {
          _id: "$gender",
          count: { $sum: 1 }
        }
      }
    ]);

    const ageStats = await Voter.aggregate([
      {
        $bucket: {
          groupBy: "$age",
          boundaries: [18, 25, 35, 45, 55, 65, 100],
          default: "Unknown",
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    res.json({
      totalVoters,
      totalVotesCast,
      voterTurnout: `${voterTurnout}%`,
      totalConstituencies,
      totalParties,
      totalCandidates,
      genderDistribution: genderStats,
      ageDistribution: ageStats
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// GET /analytics/constituency/:constituencyId - Get constituency-specific analytics
router.get("/constituency/:constituencyId", async (req, res) => {
  try {
    const { constituencyId } = req.params;

    const totalVoters = await Voter.countDocuments({ constituency: constituencyId });
    const totalVotesCast = await Voter.countDocuments({ 
      constituency: constituencyId, 
      has_voted: true 
    });
    const turnout = totalVoters > 0 ? ((totalVotesCast / totalVoters) * 100).toFixed(2) : 0;

    const candidates = await Candidate.find({ constituency: constituencyId })
      .populate("party_id", "name");

    const candidateStats = candidates.map(c => ({
      candidate_id: c.candidate_id,
      name: c.name,
      votes: c.votes,
      percentage: totalVotesCast > 0 ? ((c.votes / totalVotesCast) * 100).toFixed(2) : 0
    }));

    const partyStats = await Candidate.aggregate([
      { $match: { constituency: constituencyId } },
      {
        $group: {
          _id: "$party_id",
          totalVotes: { $sum: "$votes" }
        }
      },
      {
        $lookup: {
          from: "parties",
          localField: "_id",
          foreignField: "party_id",
          as: "partyInfo"
        }
      },
      { $unwind: "$partyInfo" },
      {
        $project: {
          party_id: "$_id",
          party_name: "$partyInfo.name",
          votes: "$totalVotes",
          percentage: {
            $cond: [
              { $eq: [totalVotesCast, 0] },
              0,
              { $multiply: [{ $divide: ["$totalVotes", totalVotesCast] }, 100] }
            ]
          }
        }
      }
    ]);

    res.json({
      constituency: constituencyId,
      totalVoters,
      totalVotesCast,
      turnout: `${turnout}%`,
      candidates: candidateStats,
      parties: partyStats
    });
  } catch (err) {
    console.error("Constituency analytics error:", err);
    res.status(500).json({ error: "Failed to fetch constituency analytics" });
  }
});

// GET /analytics/party/:partyId - Get party-specific analytics
router.get("/party/:partyId", async (req, res) => {
  try {
    const { partyId } = req.params;

    const party = await Party.findOne({ party_id: partyId });
    if (!party) {
      return res.status(404).json({ error: "Party not found" });
    }

    const candidates = await Candidate.find({ party_id: partyId });
    const totalVotes = candidates.reduce((sum, c) => c.votes + sum, 0);

    const candidateStats = candidates.map(c => ({
      candidate_id: c.candidate_id,
      name: c.name,
      constituency: c.constituency,
      votes: c.votes
    }));

    const constituencyBreakdown = await Candidate.aggregate([
      { $match: { party_id: partyId } },
      {
        $group: {
          _id: "$constituency",
          votes: { $sum: "$votes" }
        }
      },
      {
        $lookup: {
          from: "constituencies",
          localField: "_id",
          foreignField: "constituency_id",
          as: "constituencyInfo"
        }
      },
      { $unwind: "$constituencyInfo" },
      {
        $project: {
          constituency_id: "$_id",
          constituency_name: "$constituencyInfo.name",
          votes: 1
        }
      }
    ]);

    res.json({
      party_id: partyId,
      party_name: party.name,
      totalVotes,
      candidates: candidateStats,
      constituencyBreakdown
    });
  } catch (err) {
    console.error("Party analytics error:", err);
    res.status(500).json({ error: "Failed to fetch party analytics" });
  }
});

// GET /analytics/live-updates - Get real-time voting updates
router.get("/live-updates", async (req, res) => {
  try {
    const recentVotes = await Voter.find({ has_voted: true })
      .sort({ vote_timestamp: -1 })
      .limit(10)
      .select("voter_id voted_candidate_id vote_timestamp");

    const totalVotesCast = await Voter.countDocuments({ has_voted: true });
    const totalVoters = await Voter.countDocuments();

    res.json({
      totalVotesCast,
      totalVoters,
      turnout: totalVoters > 0 ? ((totalVotesCast / totalVoters) * 100).toFixed(2) : 0,
      recentVotes
    });
  } catch (err) {
    console.error("Live updates error:", err);
    res.status(500).json({ error: "Failed to fetch live updates" });
  }
});

module.exports = router;
