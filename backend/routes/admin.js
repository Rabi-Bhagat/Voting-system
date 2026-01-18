//backend/routes/admin.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Candidate = require("../models/Candidate");
const Voter = require("../models/Voter");
const Party = require("../models/Party");
const Constituency = require("../models/Constituency");
const ElectionStatus = require("../models/ElectionStatus");

// ============================================
// VERIFICATION ENDPOINTS
// ============================================

// GET /admin/verify/voters - List all voters with verification status
router.get("/verify/voters", async (req, res) => {
  try {
    const voters = await Voter.find({}).select(
      "voter_id first_name last_name email phone constituency is_verified created_at has_voted"
    );

    const votersWithStats = voters.map(voter => ({
      ...voter.toObject(),
      verification_status: voter.is_verified ? "Verified" : "Pending",
      voting_status: voter.has_voted ? "Voted" : "Not Voted"
    }));

    res.json({
      total: voters.length,
      verified: voters.filter(v => v.is_verified).length,
      pending: voters.filter(v => !v.is_verified).length,
      voters: votersWithStats
    });
  } catch (err) {
    console.error("Error fetching voters:", err);
    res.status(500).json({ error: "Failed to fetch voters", details: err.message });
  }
});

// GET /admin/verify/candidates - List all candidates with verification status
router.get("/verify/candidates", async (req, res) => {
  try {
    const candidates = await Candidate.aggregate([
      {
        $lookup: {
          from: "parties",
          localField: "party_id",
          foreignField: "party_id",
          as: "partyInfo"
        }
      },
      {
        $lookup: {
          from: "constituencies",
          localField: "constituency",
          foreignField: "constituency_id",
          as: "constituencyInfo"
        }
      },
      {
        $unwind: {
          path: "$partyInfo",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$constituencyInfo",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          candidate_id: 1,
          name: 1,
          age: 1,
          education: 1,
          experience: 1,
          votes: 1,
          party_name: "$partyInfo.name",
          constituency_name: "$constituencyInfo.name",
          created_at: 1
        }
      }
    ]);

    res.json({
      total: candidates.length,
      candidates
    });
  } catch (err) {
    console.error("Error fetching candidates:", err);
    res.status(500).json({ error: "Failed to fetch candidates", details: err.message });
  }
});

// GET /admin/verify/parties - List all parties with verification status
router.get("/verify/parties", async (req, res) => {
  try {
    const parties = await Party.find({});

    const partiesWithStats = await Promise.all(
      parties.map(async (party) => {
        const candidateCount = await Candidate.countDocuments({ party_id: party.party_id });
        const totalVotes = await Candidate.aggregate([
          { $match: { party_id: party.party_id } },
          { $group: { _id: null, total: { $sum: "$votes" } } }
        ]);

        return {
          ...party.toObject(),
          candidate_count: candidateCount,
          total_votes: totalVotes[0]?.total || 0,
          created_at: party.created_at
        };
      })
    );

    res.json({
      total: parties.length,
      parties: partiesWithStats
    });
  } catch (err) {
    console.error("Error fetching parties:", err);
    res.status(500).json({ error: "Failed to fetch parties", details: err.message });
  }
});

// PUT /admin/verify/voter/:voter_id - Verify or reject a voter
router.put("/verify/voter/:voter_id", async (req, res) => {
  try {
    const { voter_id } = req.params;
    const { is_verified, notes } = req.body;

    if (typeof is_verified !== "boolean") {
      return res.status(400).json({ error: "is_verified must be a boolean" });
    }

    const voter = await Voter.findOne({ voter_id });
    if (!voter) {
      return res.status(404).json({ error: "Voter not found" });
    }

    voter.is_verified = is_verified;
    await voter.save();

    res.json({
      success: true,
      message: `Voter ${is_verified ? "verified" : "rejected"} successfully`,
      voter: {
        voter_id: voter.voter_id,
        name: `${voter.first_name} ${voter.last_name}`,
        is_verified: voter.is_verified,
        verification_status: is_verified ? "Verified" : "Rejected"
      }
    });
  } catch (err) {
    console.error("Error verifying voter:", err);
    res.status(500).json({ error: "Failed to verify voter", details: err.message });
  }
});

// PUT /admin/verify/candidate/:candidate_id - Verify or reject a candidate
router.put("/verify/candidate/:candidate_id", async (req, res) => {
  try {
    const { candidate_id } = req.params;
    const { is_verified } = req.body;

    if (typeof is_verified !== "boolean") {
      return res.status(400).json({ error: "is_verified must be a boolean" });
    }

    const candidate = await Candidate.findOne({ candidate_id });
    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    candidate.is_verified = is_verified;
    await candidate.save();

    res.json({
      success: true,
      message: `Candidate ${is_verified ? "verified" : "rejected"} successfully`,
      candidate: {
        candidate_id: candidate.candidate_id,
        name: candidate.name,
        is_verified: candidate.is_verified
      }
    });
  } catch (err) {
    console.error("Error verifying candidate:", err);
    res.status(500).json({ error: "Failed to verify candidate", details: err.message });
  }
});

// ============================================
// DELETE ENDPOINTS
// ============================================

// DELETE /admin/delete/voter/:voter_id - Delete a voter
router.delete("/delete/voter/:voter_id", async (req, res) => {
  try {
    const { voter_id } = req.params;

    const voter = await Voter.findOneAndDelete({ voter_id });
    if (!voter) {
      return res.status(404).json({ error: "Voter not found" });
    }

    res.json({
      success: true,
      message: "Voter deleted successfully",
      deleted_voter: {
        voter_id: voter.voter_id,
        name: `${voter.first_name} ${voter.last_name}`
      }
    });
  } catch (err) {
    console.error("Error deleting voter:", err);
    res.status(500).json({ error: "Failed to delete voter", details: err.message });
  }
});

// DELETE /admin/delete/candidate/:candidate_id - Delete a candidate
router.delete("/delete/candidate/:candidate_id", async (req, res) => {
  try {
    const { candidate_id } = req.params;

    const candidate = await Candidate.findOneAndDelete({ candidate_id });
    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    res.json({
      success: true,
      message: "Candidate deleted successfully",
      deleted_candidate: {
        candidate_id: candidate.candidate_id,
        name: candidate.name
      }
    });
  } catch (err) {
    console.error("Error deleting candidate:", err);
    res.status(500).json({ error: "Failed to delete candidate", details: err.message });
  }
});

// DELETE /admin/delete/party/:party_id - Delete a party
router.delete("/delete/party/:party_id", async (req, res) => {
  try {
    const { party_id } = req.params;

    const party = await Party.findOneAndDelete({ party_id });
    if (!party) {
      return res.status(404).json({ error: "Party not found" });
    }

    // Also delete all candidates of this party
    await Candidate.deleteMany({ party_id });

    res.json({
      success: true,
      message: "Party and associated candidates deleted successfully",
      deleted_party: {
        party_id: party.party_id,
        name: party.name
      }
    });
  } catch (err) {
    console.error("Error deleting party:", err);
    res.status(500).json({ error: "Failed to delete party", details: err.message });
  }
});

// ============================================
// ADD DATA ENDPOINTS
// ============================================

// POST /admin/add-voter - Add a new voter
router.post("/add-voter", async (req, res) => {
  const { voter_id, first_name, last_name, password, address, phone, email, gmail_id, age, gender, constituency } = req.body;

  // Validation
  if (!voter_id || !first_name || !last_name || !password) {
    return res.status(400).json({ 
      error: "Validation Error",
      message: "Required fields missing: voter_id, first_name, last_name, password",
      required_fields: ["voter_id", "first_name", "last_name", "password"]
    });
  }

  // Validate email format if provided
  if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return res.status(400).json({ 
      error: "Invalid Email",
      message: "Please provide a valid email address"
    });
  }

  // Validate Gmail format if provided
  if (gmail_id && !gmail_id.match(/^[^\s@]+@gmail\.com$/)) {
    return res.status(400).json({ 
      error: "Invalid Gmail",
      message: "Please provide a valid Gmail address (must end with @gmail.com)"
    });
  }

  try {
    // Check if voter already exists
    const existing = await Voter.findOne({ voter_id });
    if (existing) {
      return res.status(409).json({ 
        error: "Conflict",
        message: "Voter with this ID already exists" 
      });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newVoter = new Voter({
      voter_id,
      first_name,
      last_name,
      password: hashedPassword,
      address: address || "",
      phone: phone || "",
      email: email || null,
      gmail_id: gmail_id || null,
      age: age || null,
      gender: gender || null,
      constituency: constituency || null,
      is_verified: false,
      is_active: true,
      created_at: new Date(),
      registration_date: new Date()
    });

    await newVoter.save();

    res.status(201).json({ 
      success: true, 
      message: "Voter added successfully",
      voter: {
        voter_id: newVoter.voter_id,
        name: `${newVoter.first_name} ${newVoter.last_name}`,
        email: newVoter.email,
        gmail_id: newVoter.gmail_id,
        constituency: newVoter.constituency,
        is_verified: newVoter.is_verified,
        registration_date: newVoter.registration_date
      }
    });
  } catch (err) {
    console.error("Error adding voter:", err);
    res.status(500).json({ 
      error: "Server Error",
      message: err.message || "Failed to add voter" 
    });
  }
});

// POST /admin/add-candidate - Add a new candidate
router.post("/add-candidate", async (req, res) => {
  const { candidate_id, name, password, party_id, constituency, email, gmail_id, age, education, experience, bio, background } = req.body;

  // Validation
  if (!candidate_id || !name || !party_id || !password) {
    return res.status(400).json({ 
      error: "Validation Error",
      message: "Required fields missing: candidate_id, name, party_id, password",
      required_fields: ["candidate_id", "name", "party_id", "password"]
    });
  }

  // Validate email format if provided
  if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return res.status(400).json({ 
      error: "Invalid Email",
      message: "Please provide a valid email address"
    });
  }

  // Validate Gmail format if provided
  if (gmail_id && !gmail_id.match(/^[^\s@]+@gmail\.com$/)) {
    return res.status(400).json({ 
      error: "Invalid Gmail",
      message: "Please provide a valid Gmail address (must end with @gmail.com)"
    });
  }

  try {
    // Check if candidate already exists
    const existing = await Candidate.findOne({ candidate_id });
    if (existing) {
      return res.status(409).json({ 
        error: "Conflict",
        message: "Candidate with this ID already exists" 
      });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newCandidate = new Candidate({
      candidate_id,
      name,
      password: hashedPassword,
      party_id,
      constituency: constituency || null,
      email: email || null,
      gmail_id: gmail_id || null,
      age: age || null,
      education: education || "",
      experience: experience || "",
      bio: bio || null,
      background: background || "",
      votes: 0,
      is_verified: false,
      is_active: true,
      approved: true, // Auto-approve when added by admin
      created_at: new Date(),
      registration_date: new Date()
    });

    await newCandidate.save();

    res.status(201).json({ 
      success: true, 
      message: "Candidate added successfully",
      candidate: {
        candidate_id: newCandidate.candidate_id,
        name: newCandidate.name,
        email: newCandidate.email,
        gmail_id: newCandidate.gmail_id,
        party_id: newCandidate.party_id,
        constituency: newCandidate.constituency,
        registration_date: newCandidate.registration_date
      }
    });
  } catch (err) {
    console.error("Error adding candidate:", err);
    res.status(500).json({ 
      error: "Server Error",
      message: err.message || "Failed to add candidate" 
    });
  }
});

// POST /admin/add-party - Add a new party
router.post("/add-party", async (req, res) => {
  const { party_id, name, password, email, gmail_id, symbol, color, description, founded_year } = req.body;

  // Validation
  if (!party_id || !name || !password) {
    return res.status(400).json({ 
      error: "Validation Error",
      message: "Required fields missing: party_id, name, password",
      required_fields: ["party_id", "name", "password"]
    });
  }

  // Validate email format if provided
  if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return res.status(400).json({ 
      error: "Invalid Email",
      message: "Please provide a valid email address"
    });
  }

  // Validate Gmail format if provided
  if (gmail_id && !gmail_id.match(/^[^\s@]+@gmail\.com$/)) {
    return res.status(400).json({ 
      error: "Invalid Gmail",
      message: "Please provide a valid Gmail address (must end with @gmail.com)"
    });
  }

  try {
    // Check if party already exists
    const existing = await Party.findOne({ party_id });
    if (existing) {
      return res.status(409).json({ 
        error: "Conflict",
        message: "Party with this ID already exists" 
      });
    }

    const newParty = new Party({
      party_id,
      name,
      password,
      email: email || null,
      gmail_id: gmail_id || null,
      symbol: symbol || null,
      color: color || null,
      description: description || null,
      founded_year: founded_year || null,
      is_verified: false,
      is_active: true,
      created_at: new Date(),
      registration_date: new Date()
    });

    await newParty.save();

    res.status(201).json({ 
      success: true, 
      message: "Party added successfully",
      party: {
        party_id: newParty.party_id,
        name: newParty.name,
        email: newParty.email,
        gmail_id: newParty.gmail_id,
        registration_date: newParty.registration_date
      }
    });
  } catch (err) {
    console.error("Error adding party:", err);
    res.status(500).json({ 
      error: "Server Error",
      message: err.message || "Failed to add party" 
    });
  }
});

// POST /admin/add-constituency - Add a new constituency
router.post("/add-constituency", async (req, res) => {
  const { constituency_id, name, password } = req.body;

  // Validation
  if (!constituency_id || !name || !password) {
    return res.status(400).json({ 
      error: "Validation Error",
      message: "Required fields missing: constituency_id, name, password",
      required_fields: ["constituency_id", "name", "password"]
    });
  }

  try {
    // Check if constituency already exists
    const existing = await Constituency.findOne({ constituency_id });
    if (existing) {
      return res.status(409).json({ 
        error: "Conflict",
        message: "Constituency with this ID already exists" 
      });
    }

    const newConstituency = new Constituency({
      constituency_id,
      name,
      password
    });

    await newConstituency.save();

    res.status(201).json({ 
      success: true, 
      message: "Constituency added successfully",
      constituency: {
        constituency_id: newConstituency.constituency_id,
        name: newConstituency.name
      }
    });
  } catch (err) {
    console.error("Error adding constituency:", err);
    res.status(500).json({ 
      error: "Server Error",
      message: err.message || "Failed to add constituency",
      details: err.message
    });
  }
});

// ============================================
// ELECTION MANAGEMENT ENDPOINTS
// ============================================

// POST /admin/reset-votes
router.post("/reset-votes", async (req, res) => {
  try {
    await Candidate.updateMany({}, { votes: 0 });
    await Voter.updateMany({}, { has_voted: false, voted_candidate_id: null, vote_timestamp: null });

    // Reset election status including resultsPublished flag
    await ElectionStatus.deleteMany({});
    await ElectionStatus.create({ conducted: false, resultsPublished: false });

    res.json({ 
      success: true, 
      message: "Votes and voter statuses reset successfully" 
    });
  } catch (err) {
    console.error("Error resetting votes:", err);
    res.status(500).json({ error: "Failed to reset votes", details: err.message });
  }
});

// POST /admin/publish-results
router.post("/publish-results", async (req, res) => {
  try {
    const status = await ElectionStatus.findOne();
    if (!status || !status.conducted) {
      return res.status(400).json({ error: "No election has been conducted yet" });
    }

    // Mark results as published
    status.resultsPublished = true;
    await status.save();

    // Aggregate results with constituency name
    const results = await Candidate.aggregate([
      {
        $group: {
          _id: "$constituency",
          maxVotes: { $max: "$votes" }
        }
      },
      {
        $lookup: {
          from: "candidates",
          let: { constituencyId: "$_id", maxVotes: "$maxVotes" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$constituency", "$$constituencyId"] },
                    { $eq: ["$votes", "$$maxVotes"] }
                  ]
                }
              }
            }
          ],
          as: "winners"
        }
      },
      { $unwind: "$winners" },
      {
        $lookup: {
          from: "parties",
          localField: "winners.party_id",
          foreignField: "party_id",
          as: "partyInfo"
        }
      },
      { $unwind: { path: "$partyInfo", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "constituencies",
          localField: "_id",
          foreignField: "constituency_id",
          as: "constituencyInfo"
        }
      },
      { $unwind: { path: "$constituencyInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          constituency: {
            id: "$_id",
            name: "$constituencyInfo.name"
          },
          winner: {
            candidate_id: "$winners.candidate_id",
            name: "$winners.name",
            votes: "$winners.votes",
            party_name: "$partyInfo.name"
          }
        }
      }
    ]);

    res.json({ 
      success: true, 
      message: "Results published successfully",
      results 
    });
  } catch (err) {
    console.error("Error publishing results:", err);
    res.status(500).json({ error: "Failed to publish results", details: err.message });
  }
});

// GET /admin/results
router.get("/results", async (req, res) => {
  try {
    const status = await ElectionStatus.findOne();
    if (!status || !status.resultsPublished) {
      return res.json([]);
    }

    // Get all constituencies
    const constituencies = await Candidate.aggregate([
      {
        $group: {
          _id: "$constituency"
        }
      }
    ]);

    const results = [];

    for (const item of constituencies) {
      const constituencyId = item._id;

      // Fetch constituency name
      const constituencyInfo = await Candidate.aggregate([
        { $match: { constituency: constituencyId } },
        {
          $lookup: {
            from: "constituencies",
            localField: "constituency",
            foreignField: "constituency_id",
            as: "constituencyData"
          }
        },
        { $unwind: "$constituencyData" },
        {
          $project: {
            name: "$constituencyData.name"
          }
        },
        { $limit: 1 }
      ]);

      const constituencyName = constituencyInfo[0]?.name || "Unknown";

      // Get all candidates of the constituency with party info
      const candidates = await Candidate.aggregate([
        { $match: { constituency: constituencyId } },
        {
          $lookup: {
            from: "parties",
            localField: "party_id",
            foreignField: "party_id",
            as: "party"
          }
        },
        { $unwind: { path: "$party", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            candidate_id: 1,
            name: 1,
            votes: 1,
            party_name: "$party.name",
            party_id: "$party.party_id"
          }
        }
      ]);

      // Determine the maximum vote count
      const maxVotes = candidates.length > 0 ? Math.max(...candidates.map(c => c.votes)) : 0;

      // Add isWinner flag to each candidate
      const candidatesWithFlags = candidates.map(c => ({
        ...c,
        isWinner: maxVotes > 0 && c.votes === maxVotes
      }));

      results.push({
        constituency: {
          id: constituencyId,
          name: constituencyName
        },
        candidates: candidatesWithFlags
      });
    }
    
    res.json(results);
  } catch (err) {
    console.error("Error fetching results:", err);
    res.status(500).json({ error: "Failed to fetch results", details: err.message });
  }
});

// GET /admin/election-status
router.get("/election-status", async (req, res) => {
  try {
    const status = await ElectionStatus.findOne({});
    res.json({ 
      conducted: status?.conducted || false,
      resultsPublished: status?.resultsPublished || false
    });
  } catch (err) {
    console.error("Error fetching election status:", err);
    res.status(500).json({ error: "Could not fetch election status", details: err.message });
  }
});

// ============================================
// ADMIN MANAGEMENT ENDPOINTS
// ============================================

// Get all constituencies (for registration dropdown)
router.get("/constituencies", async (req, res) => {
  try {
    const constituencies = await Constituency.find({}, { constituency_id: 1, name: 1, _id: 0 });
    res.json(constituencies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch constituencies" });
  }
});

// Get all parties (for registration dropdown)
router.get("/parties", async (req, res) => {
  try {
    const parties = await Party.find({}, { party_id: 1, name: 1, _id: 0 });
    res.json(parties);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch parties" });
  }
});

// Get all voters for admin management
router.get("/voters", async (req, res) => {
  try {
    const voters = await Voter.find({}, { password: 0 });
    res.json(voters);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch voters" });
  }
});

// Get all candidates with party info for admin management
router.get("/candidates", async (req, res) => {
  try {
    const candidates = await Candidate.aggregate([
      {
        $lookup: {
          from: "parties",
          localField: "party_id",
          foreignField: "party_id",
          as: "party"
        }
      },
      { $unwind: { path: "$party", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "constituencies",
          localField: "constituency",
          foreignField: "constituency_id",
          as: "constituencyInfo"
        }
      },
      { $unwind: { path: "$constituencyInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          candidate_id: 1,
          name: 1,
          party_id: 1,
          party_name: "$party.name",
          constituency: 1,
          constituency_name: "$constituencyInfo.name",
          age: 1,
          education: 1,
          experience: 1,
          background: 1,
          approved: 1,
          approved_by: 1,
          approved_at: 1,
          votes: 1
        }
      }
    ]);
    res.json(candidates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch candidates" });
  }
});

// Get all parties with full details for admin management
router.get("/all-parties", async (req, res) => {
  try {
    const parties = await Party.find({}, { password: 0 });
    res.json(parties);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch parties" });
  }
});

// Delete voter
router.delete("/voter/:voter_id", async (req, res) => {
  try {
    const result = await Voter.deleteOne({ voter_id: req.params.voter_id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Voter not found" });
    }
    res.json({ success: true, message: "Voter deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete voter" });
  }
});

// Delete candidate
router.delete("/candidate/:candidate_id", async (req, res) => {
  try {
    const result = await Candidate.deleteOne({ candidate_id: req.params.candidate_id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Candidate not found" });
    }
    res.json({ success: true, message: "Candidate deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete candidate" });
  }
});

// Delete party
router.delete("/party/:party_id", async (req, res) => {
  try {
    const result = await Party.deleteOne({ party_id: req.params.party_id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Party not found" });
    }
    res.json({ success: true, message: "Party deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete party" });
  }
});

// ============================================
// APPROVAL ENDPOINTS
// ============================================

// Approve candidate
router.post("/approve-candidate", async (req, res) => {
  const { candidate_id, admin_username } = req.body;

  if (!candidate_id) {
    return res.status(400).json({ error: "Candidate ID required" });
  }

  try {
    const candidate = await Candidate.findOne({ candidate_id });

    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    candidate.approved = true;
    candidate.approved_by = admin_username || "admin";
    candidate.approved_at = new Date();
    await candidate.save();

    res.json({ success: true, message: "Candidate approved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to approve candidate" });
  }
});

// Reject/Remove candidate approval
router.post("/reject-candidate", async (req, res) => {
  const { candidate_id } = req.body;

  if (!candidate_id) {
    return res.status(400).json({ error: "Candidate ID required" });
  }

  try {
    const candidate = await Candidate.findOne({ candidate_id });

    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    candidate.approved = false;
    candidate.approved_by = null;
    candidate.approved_at = null;
    await candidate.save();

    res.json({ success: true, message: "Candidate approval removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reject candidate" });
  }
});

// Get all candidates for admin approval
router.get("/candidates-pending", async (req, res) => {
  try {
    const candidates = await Candidate.find({}).populate('party_id');
    res.json(candidates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch candidates" });
  }
});

// Verify/Approve voter
router.post("/verify-voter", async (req, res) => {
  const { voter_id, verified, admin_username } = req.body;

  if (!voter_id || verified === undefined) {
    return res.status(400).json({ error: "Voter ID and verified status required" });
  }

  try {
    const voter = await Voter.findOne({ voter_id });

    if (!voter) {
      return res.status(404).json({ error: "Voter not found" });
    }

    voter.verified = verified;
    voter.is_verified = verified;
    if (verified) {
      voter.verified_by = admin_username || "admin";
      voter.verified_at = new Date();
    } else {
      voter.verified_by = null;
      voter.verified_at = null;
    }
    await voter.save();

    res.json({ 
      success: true, 
      message: verified ? "Voter verified successfully" : "Voter verification removed" 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update voter verification" });
  }
});

// Approve party
router.post("/approve-party", async (req, res) => {
  const { party_id, admin_username } = req.body;

  if (!party_id) {
    return res.status(400).json({ error: "Party ID required" });
  }

  try {
    const party = await Party.findOne({ party_id });

    if (!party) {
      return res.status(404).json({ error: "Party not found" });
    }

    party.approved = true;
    party.approved_by = admin_username || "admin";
    party.approved_at = new Date();
    await party.save();

    res.json({ success: true, message: "Party approved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to approve party" });
  }
});

// Reject party
router.post("/reject-party", async (req, res) => {
  const { party_id } = req.body;

  if (!party_id) {
    return res.status(400).json({ error: "Party ID required" });
  }

  try {
    const party = await Party.findOne({ party_id });

    if (!party) {
      return res.status(404).json({ error: "Party not found" });
    }

    party.approved = false;
    party.approved_by = null;
    party.approved_at = null;
    await party.save();

    res.json({ success: true, message: "Party approval removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reject party" });
  }
});

// ============================================
// ELECTION LAUNCH ENDPOINTS
// ============================================

// POST /admin/launch-election - Launch/start election
router.post("/launch-election", async (req, res) => {
  try {
    const { constituency_id } = req.body;

    if (!constituency_id) {
      return res.status(400).json({ error: "constituency_id is required" });
    }

    // Verify constituency exists
    const constituency = await Constituency.findOne({ constituency_id });
    if (!constituency) {
      return res.status(404).json({ error: "Constituency not found" });
    }

    // Check if election already conducted
    const status = await ElectionStatus.findOne();
    if (status && status.conducted) {
      return res.status(400).json({ error: "Election already conducted. Reset votes first." });
    }

    // Create or update election status
    await ElectionStatus.deleteMany({});
    await ElectionStatus.create({ 
      conducted: true, 
      resultsPublished: false,
      launched_at: new Date(),
      constituency_id: constituency_id
    });

    res.json({
      success: true,
      message: `Election launched for ${constituency.name}`,
      election_info: {
        constituency_id: constituency_id,
        constituency_name: constituency.name,
        launched_at: new Date(),
        status: "Active"
      }
    });
  } catch (err) {
    console.error("Error launching election:", err);
    res.status(500).json({ error: "Failed to launch election", details: err.message });
  }
});

// GET /admin/election-info - Get current election information
router.get("/election-info", async (req, res) => {
  try {
    const status = await ElectionStatus.findOne();
    
    if (!status) {
      return res.json({
        election_active: false,
        message: "No election is currently active"
      });
    }

    // Get election statistics
    const totalVoters = await Voter.countDocuments();
    const totalVotesCast = await Voter.countDocuments({ has_voted: true });
    const totalCandidates = await Candidate.countDocuments();

    res.json({
      election_active: status.conducted,
      results_published: status.resultsPublished,
      launched_at: status.launched_at,
      statistics: {
        total_voters: totalVoters,
        votes_cast: totalVotesCast,
        turnout_percentage: totalVoters > 0 ? ((totalVotesCast / totalVoters) * 100).toFixed(2) : 0,
        total_candidates: totalCandidates
      }
    });
  } catch (err) {
    console.error("Error fetching election info:", err);
    res.status(500).json({ error: "Failed to fetch election info", details: err.message });
  }
});

// ============================================
// ADMIN CAST VOTE ENDPOINT
// ============================================

// POST /admin/cast-vote - Admin can cast vote for a voter
router.post("/cast-vote", async (req, res) => {
  const { voter_id, candidate_id } = req.body;

  if (!voter_id || !candidate_id) {
    return res.status(400).json({ error: "voter_id and candidate_id are required" });
  }

  try {
    const voter = await Voter.findOne({ voter_id });
    if (!voter) {
      return res.status(404).json({ error: "Voter not found" });
    }

    if (voter.has_voted) {
      return res.status(400).json({ error: "This voter has already voted" });
    }

    if (!voter.is_verified) {
      return res.status(400).json({ error: "Voter is not verified. Cannot cast vote." });
    }

    // Verify election is active
    const status = await ElectionStatus.findOne();
    if (!status || !status.conducted) {
      return res.status(400).json({ error: "No active election. Launch election first." });
    }

    if (candidate_id !== "NOTA") {
      const candidate = await Candidate.findOne({ candidate_id });
      if (!candidate) {
        return res.status(404).json({ error: "Candidate not found" });
      }

      if (candidate.constituency !== voter.constituency) {
        return res.status(400).json({ error: "Candidate not from voter's constituency" });
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

    res.json({
      success: true,
      message: "Vote cast successfully by admin",
      vote_info: {
        voter_id: voter.voter_id,
        voter_name: `${voter.first_name} ${voter.last_name}`,
        candidate_id: candidate_id,
        vote_timestamp: voter.vote_timestamp
      }
    });
  } catch (err) {
    console.error("Error casting vote:", err);
    res.status(500).json({ error: "Failed to cast vote", details: err.message });
  }
});

module.exports = router;
