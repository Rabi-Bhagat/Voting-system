const express = require("express");
const router = express.Router();
const Voter = require("../models/Voter");
const Candidate = require("../models/Candidate");
const ElectionStatus = require("../models/ElectionStatus");
const VoteReceipt = require("../models/VoteReceipt");
const AuditLog = require("../models/AuditLog");

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
          { 
            $match: { 
              constituency: voter.constituency,
              candidate_id: { $ne: "NOTA" }
            } 
          },
          {
            $lookup: {
              from: "parties",
              localField: "party_id",
              foreignField: "party_id",
              as: "partyInfo"
            }
          },
          { $unwind: { path: "$partyInfo", preserveNullAndEmptyArrays: true } },
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

        const Constituency = require("../models/Constituency");
        const constituencyData = await Constituency.findOne({ constituency_id: voter.constituency });
        
        const voterObj = voter.toObject();
        voterObj.constituency_name = constituencyData ? constituencyData.name : voter.constituency;

        res.json({ voter: voterObj, candidates });
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

    // Generate vote receipt
    let voteReceipt = null;
    try {
      voteReceipt = await VoteReceipt.createReceipt(
        voter_id,
        'current',
        voter.constituency,
        candidate_id
      );
    } catch (receiptError) {
      console.error('Receipt generation error:', receiptError);
    }

    // Log the vote action
    await AuditLog.log({
      action: 'VOTE_CAST',
      performed_by: voter_id,
      user_role: 'voter',
      target_type: 'vote',
      target_id: candidate_id,
      details: { constituency: voter.constituency }
    });

    return res.json({ 
      message: "Vote cast successfully!",
      timestamp: voter.vote_timestamp,
      receipt: voteReceipt ? {
        receipt_id: voteReceipt.receipt_id,
        verification_code: voteReceipt.verification_code
      } : null
    });
  } catch (err) {
    console.error("Vote error:", err);
    return res.status(500).json({ error: "Server error while voting." });
  }
});


// Verify vote receipt
router.post("/verify-receipt", async (req, res) => {
  try {
    const { verification_code } = req.body;
    
    if (!verification_code) {
      return res.status(400).json({ error: "Verification code is required" });
    }
    
    const result = await VoteReceipt.verifyReceipt(verification_code);
    res.json(result);
  } catch (err) {
    console.error("Receipt verification error:", err);
    res.status(500).json({ error: "Failed to verify receipt" });
  }
});

// Get vote receipt by receipt ID
router.get("/receipt/:receipt_id", async (req, res) => {
  try {
    const receipt = await VoteReceipt.getByReceiptId(req.params.receipt_id);
    
    if (!receipt) {
      return res.status(404).json({ error: "Receipt not found" });
    }
    
    res.json({
      receipt_id: receipt.receipt_id,
      timestamp: receipt.timestamp,
      constituency: receipt.constituency,
      vote_hash: receipt.vote_hash.substring(0, 16) + '...', // Partial for privacy
      is_verified: receipt.is_verified
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch receipt" });
  }
});


module.exports = router;