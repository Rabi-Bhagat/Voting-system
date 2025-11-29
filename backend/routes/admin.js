//backend/routes/admin.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Candidate = require("../models/Candidate");
const Voter = require("../models/Voter");
const Party = require("../models/Party");
const Constituency = require("../models/Constituency");
const ElectionStatus = require("../models/ElectionStatus");

// POST /admin/reset-votes
router.post("/reset-votes", async (req, res) => {
  try {
    await Candidate.updateMany({}, { votes: 0 });
    await Voter.updateMany({}, { has_voted: false, voted_candidate_id: null });

    // Reset election status including resultsPublished flag
    await ElectionStatus.deleteMany({});
    await ElectionStatus.create({ conducted: false, resultsPublished: false });

    res.json({ success: true, message: "Votes and voter statuses reset." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reset votes." });
  }
});

// POST /admin/publish-results
router.post("/publish-results", async (req, res) => {
  try {
    const status = await ElectionStatus.findOne();
    if (!status || !status.conducted) {
      return res.status(400).json({ error: "No election has been conducted." });
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
      { $unwind: "$partyInfo" },
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

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to publish results." });
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
        { $unwind: "$party" },
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
      const maxVotes = Math.max(...candidates.map(c => c.votes));

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
    console.error(err);
    res.status(500).json({ error: "Failed to fetch results." });
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
    res.status(500).json({ error: "Could not fetch election status." });
  }
});

router.post("/add-voter", async (req, res) => {
  const { voter_id, first_name, last_name, password, address, phone, constituency } = req.body;

  if (!voter_id || !first_name || !last_name || !password) {
    return res.status(400).json({ error: "Required fields missing" });
  }

  try {
    const existing = await Voter.findOne({ voter_id });

    if (existing) {
      return res.status(409).json({ error: "Voter already exists" });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newVoter = new Voter({
      voter_id,
      first_name,
      last_name,
      password: hashedPassword,
      address,
      phone,
      constituency: constituency || null,
    });

    await newVoter.save();

    res.status(201).json({ success: true, message: "Voter added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Failed to add voter" });
  }
});


router.post("/add-candidate", async (req, res) => {
  const { candidate_id, name, password, party_id, constituency, background, education, experience, age } = req.body;

  if (!candidate_id || !name || !party_id || !password) {
    return res.status(400).json({ error: "Candidate ID, name, party ID, and password are required" });
  }

  try {
    const existing = await Candidate.findOne({ candidate_id });

    if (existing) {
      return res.status(409).json({ error: "Candidate ID already exists" });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newCandidate = new Candidate({
      candidate_id,
      name,
      password: hashedPassword,
      party_id,
      constituency: constituency || null,
      background: background || "",
      education: education || "",
      experience: experience || "",
      age: age || null,
      approved: true, // Auto-approve when added by admin
      votes: 0
    });

    await newCandidate.save();

    res.status(201).json({ success: true, message: "Candidate added successfully. Awaiting approval." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Failed to add candidate" });
  }
});

// Approve candidate
router.post("/approve-candidate", async (req, res) => {
  const { candidate_id } = req.body;

  if (!candidate_id) {
    return res.status(400).json({ error: "Candidate ID required" });
  }

  try {
    const candidate = await Candidate.findOne({ candidate_id });

    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    candidate.approved = true;
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


router.post("/add-party", async (req, res) => {
  const { party_id, name, password } = req.body;

  if (!party_id || !name || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const existing = await Party.findOne({ party_id, name, password });

    if (existing) {
      return res.status(409).json({ error: "Party with same details already exists" });
    }

    await Party.create({ party_id, name, password });
    res.status(201).json({ success: true, message: "Party added successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to add party" });
  }
});

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

module.exports = router;
