const express = require("express");
const router = express.Router();
const Voter = require("../models/Voter");
const Candidate = require("../models/Candidate");
const Party = require("../models/Party");
const Constituency = require("../models/Constituency");

// ============================================
// ADMIN DASHBOARD - VIEW ALL VOTERS
// ============================================

// GET /admin-dashboard/voters - View all voters with complete details
router.get("/voters", async (req, res) => {
  try {
    const voters = await Voter.find({});

    const votersWithDetails = await Promise.all(
      voters.map(async (voter) => {
        const constituency = await Constituency.findOne({ 
          constituency_id: voter.constituency 
        });

        return {
          voter_id: voter.voter_id,
          first_name: voter.first_name,
          last_name: voter.last_name,
          full_name: `${voter.first_name} ${voter.last_name}`,
          email: voter.email,
          gmail_id: voter.gmail_id,
          phone: voter.phone,
          address: voter.address,
          age: voter.age,
          gender: voter.gender,
          constituency_id: voter.constituency,
          constituency_name: constituency?.name || "Unknown",
          has_voted: voter.has_voted,
          voted_candidate_id: voter.voted_candidate_id,
          vote_timestamp: voter.vote_timestamp,
          is_verified: voter.is_verified,
          verification_status: voter.is_verified ? "Verified" : "Pending",
          is_active: voter.is_active,
          status: voter.is_active ? "Active" : "Inactive",
          created_at: voter.created_at,
          registration_date: voter.registration_date,
          last_login: voter.last_login
        };
      })
    );

    res.json({
      total_voters: voters.length,
      verified_voters: voters.filter(v => v.is_verified).length,
      pending_voters: voters.filter(v => !v.is_verified).length,
      active_voters: voters.filter(v => v.is_active).length,
      inactive_voters: voters.filter(v => !v.is_active).length,
      voted_voters: voters.filter(v => v.has_voted).length,
      not_voted_voters: voters.filter(v => !v.has_voted).length,
      voters: votersWithDetails
    });
  } catch (err) {
    console.error("Error fetching voters:", err);
    res.status(500).json({ error: "Failed to fetch voters", details: err.message });
  }
});

// GET /admin-dashboard/voters/:voter_id - View single voter detailed profile
router.get("/voters/:voter_id", async (req, res) => {
  try {
    const voter = await Voter.findOne({ voter_id: req.params.voter_id });
    if (!voter) {
      return res.status(404).json({ error: "Voter not found" });
    }

    const constituency = await Constituency.findOne({ 
      constituency_id: voter.constituency 
    });

    res.json({
      voter_details: {
        voter_id: voter.voter_id,
        first_name: voter.first_name,
        last_name: voter.last_name,
        full_name: `${voter.first_name} ${voter.last_name}`,
        email: voter.email,
        gmail_id: voter.gmail_id,
        phone: voter.phone,
        address: voter.address,
        age: voter.age,
        gender: voter.gender
      },
      constituency_info: {
        constituency_id: voter.constituency,
        constituency_name: constituency?.name || "Unknown"
      },
      voting_info: {
        has_voted: voter.has_voted,
        voted_candidate_id: voter.voted_candidate_id,
        vote_timestamp: voter.vote_timestamp
      },
      verification_info: {
        is_verified: voter.is_verified,
        verification_status: voter.is_verified ? "Verified" : "Pending"
      },
      status_info: {
        is_active: voter.is_active,
        status: voter.is_active ? "Active" : "Inactive"
      },
      activity_info: {
        created_at: voter.created_at,
        registration_date: voter.registration_date,
        last_login: voter.last_login
      }
    });
  } catch (err) {
    console.error("Error fetching voter:", err);
    res.status(500).json({ error: "Failed to fetch voter", details: err.message });
  }
});

// ============================================
// ADMIN DASHBOARD - VIEW ALL CANDIDATES
// ============================================

// GET /admin-dashboard/candidates - View all candidates with complete details
router.get("/candidates", async (req, res) => {
  try {
    const candidates = await Candidate.find({});

    const candidatesWithDetails = await Promise.all(
      candidates.map(async (candidate) => {
        const party = await Party.findOne({ party_id: candidate.party_id });
        const constituency = await Constituency.findOne({ 
          constituency_id: candidate.constituency 
        });

        return {
          candidate_id: candidate.candidate_id,
          name: candidate.name,
          email: candidate.email,
          gmail_id: candidate.gmail_id,
          age: candidate.age,
          education: candidate.education,
          experience: candidate.experience,
          bio: candidate.bio,
          image_url: candidate.image_url,
          party_id: candidate.party_id,
          party_name: party?.name || "Unknown",
          party_symbol: party?.symbol,
          party_color: party?.color,
          constituency_id: candidate.constituency,
          constituency_name: constituency?.name || "Unknown",
          votes: candidate.votes,
          vote_percentage: candidate.vote_percentage,
          is_verified: candidate.is_verified,
          verification_status: candidate.is_verified ? "Verified" : "Pending",
          is_active: candidate.is_active,
          status: candidate.is_active ? "Active" : "Inactive",
          created_at: candidate.created_at,
          registration_date: candidate.registration_date
        };
      })
    );

    res.json({
      total_candidates: candidates.length,
      verified_candidates: candidates.filter(c => c.is_verified).length,
      pending_candidates: candidates.filter(c => !c.is_verified).length,
      active_candidates: candidates.filter(c => c.is_active).length,
      inactive_candidates: candidates.filter(c => !c.is_active).length,
      candidates: candidatesWithDetails
    });
  } catch (err) {
    console.error("Error fetching candidates:", err);
    res.status(500).json({ error: "Failed to fetch candidates", details: err.message });
  }
});

// GET /admin-dashboard/candidates/:candidate_id - View single candidate detailed profile
router.get("/candidates/:candidate_id", async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ candidate_id: req.params.candidate_id });
    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    const party = await Party.findOne({ party_id: candidate.party_id });
    const constituency = await Constituency.findOne({ 
      constituency_id: candidate.constituency 
    });

    res.json({
      candidate_details: {
        candidate_id: candidate.candidate_id,
        name: candidate.name,
        email: candidate.email,
        gmail_id: candidate.gmail_id,
        age: candidate.age,
        education: candidate.education,
        experience: candidate.experience,
        bio: candidate.bio,
        image_url: candidate.image_url
      },
      party_info: {
        party_id: candidate.party_id,
        party_name: party?.name || "Unknown",
        party_symbol: party?.symbol,
        party_color: party?.color,
        party_description: party?.description
      },
      constituency_info: {
        constituency_id: candidate.constituency,
        constituency_name: constituency?.name || "Unknown"
      },
      voting_info: {
        votes: candidate.votes,
        vote_percentage: candidate.vote_percentage
      },
      verification_info: {
        is_verified: candidate.is_verified,
        verification_status: candidate.is_verified ? "Verified" : "Pending"
      },
      status_info: {
        is_active: candidate.is_active,
        status: candidate.is_active ? "Active" : "Inactive"
      },
      activity_info: {
        created_at: candidate.created_at,
        registration_date: candidate.registration_date
      }
    });
  } catch (err) {
    console.error("Error fetching candidate:", err);
    res.status(500).json({ error: "Failed to fetch candidate", details: err.message });
  }
});

// ============================================
// ADMIN DASHBOARD - VIEW ALL PARTIES
// ============================================

// GET /admin-dashboard/parties - View all parties with complete details
router.get("/parties", async (req, res) => {
  try {
    const parties = await Party.find({});

    const partiesWithDetails = await Promise.all(
      parties.map(async (party) => {
        const candidates = await Candidate.find({ party_id: party.party_id });
        const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);

        return {
          party_id: party.party_id,
          name: party.name,
          email: party.email,
          gmail_id: party.gmail_id,
          symbol: party.symbol,
          color: party.color,
          description: party.description,
          founded_year: party.founded_year,
          total_candidates: candidates.length,
          total_votes: totalVotes,
          is_verified: party.is_verified,
          verification_status: party.is_verified ? "Verified" : "Pending",
          is_active: party.is_active,
          status: party.is_active ? "Active" : "Inactive",
          created_at: party.created_at,
          registration_date: party.registration_date
        };
      })
    );

    res.json({
      total_parties: parties.length,
      verified_parties: parties.filter(p => p.is_verified).length,
      pending_parties: parties.filter(p => !p.is_verified).length,
      active_parties: parties.filter(p => p.is_active).length,
      inactive_parties: parties.filter(p => !p.is_active).length,
      parties: partiesWithDetails
    });
  } catch (err) {
    console.error("Error fetching parties:", err);
    res.status(500).json({ error: "Failed to fetch parties", details: err.message });
  }
});

// GET /admin-dashboard/parties/:party_id - View single party detailed profile
router.get("/parties/:party_id", async (req, res) => {
  try {
    const party = await Party.findOne({ party_id: req.params.party_id });
    if (!party) {
      return res.status(404).json({ error: "Party not found" });
    }

    const candidates = await Candidate.find({ party_id: party.party_id });
    const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);

    const candidatesWithDetails = await Promise.all(
      candidates.map(async (candidate) => {
        const constituency = await Constituency.findOne({ 
          constituency_id: candidate.constituency 
        });

        return {
          candidate_id: candidate.candidate_id,
          name: candidate.name,
          constituency_id: candidate.constituency,
          constituency_name: constituency?.name || "Unknown",
          votes: candidate.votes,
          is_verified: candidate.is_verified
        };
      })
    );

    res.json({
      party_details: {
        party_id: party.party_id,
        name: party.name,
        email: party.email,
        gmail_id: party.gmail_id,
        symbol: party.symbol,
        color: party.color,
        description: party.description,
        founded_year: party.founded_year
      },
      statistics: {
        total_candidates: candidates.length,
        total_votes: totalVotes,
        verified_candidates: candidates.filter(c => c.is_verified).length,
        active_candidates: candidates.filter(c => c.is_active).length
      },
      verification_info: {
        is_verified: party.is_verified,
        verification_status: party.is_verified ? "Verified" : "Pending"
      },
      status_info: {
        is_active: party.is_active,
        status: party.is_active ? "Active" : "Inactive"
      },
      activity_info: {
        created_at: party.created_at,
        registration_date: party.registration_date
      },
      candidates: candidatesWithDetails
    });
  } catch (err) {
    console.error("Error fetching party:", err);
    res.status(500).json({ error: "Failed to fetch party", details: err.message });
  }
});

// ============================================
// ADMIN DASHBOARD - SUMMARY STATISTICS
// ============================================

// GET /admin-dashboard/summary - Get dashboard summary statistics
router.get("/summary", async (req, res) => {
  try {
    const voters = await Voter.find({});
    const candidates = await Candidate.find({});
    const parties = await Party.find({});
    const constituencies = await Constituency.find({});

    const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);

    res.json({
      summary: {
        total_voters: voters.length,
        verified_voters: voters.filter(v => v.is_verified).length,
        active_voters: voters.filter(v => v.is_active).length,
        voted_voters: voters.filter(v => v.has_voted).length,
        voter_turnout: voters.length > 0 ? ((voters.filter(v => v.has_voted).length / voters.length) * 100).toFixed(2) : 0
      },
      candidates_summary: {
        total_candidates: candidates.length,
        verified_candidates: candidates.filter(c => c.is_verified).length,
        active_candidates: candidates.filter(c => c.is_active).length
      },
      parties_summary: {
        total_parties: parties.length,
        verified_parties: parties.filter(p => p.is_verified).length,
        active_parties: parties.filter(p => p.is_active).length
      },
      constituencies_summary: {
        total_constituencies: constituencies.length
      },
      voting_summary: {
        total_votes_cast: totalVotes,
        average_votes_per_candidate: candidates.length > 0 ? (totalVotes / candidates.length).toFixed(2) : 0
      }
    });
  } catch (err) {
    console.error("Error fetching summary:", err);
    res.status(500).json({ error: "Failed to fetch summary", details: err.message });
  }
});

module.exports = router;
