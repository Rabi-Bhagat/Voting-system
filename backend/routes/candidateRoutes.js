const express = require("express");
const router = express.Router();
const Candidate = require("../models/Candidate");
const Party = require("../models/Party");

// GET /candidates/:constituencyId
router.get("/:constituencyId", async (req, res) => {
  const { constituencyId } = req.params;

  try {
    const candidates = await Candidate.aggregate([
      { $match: { constituency: constituencyId } },
      {
        $lookup: {
          from: "parties", // collection name in MongoDB
          localField: "party_id",
          foreignField: "party_id",
          as: "partyInfo"
        }
      },
      {
        $unwind: "$partyInfo"
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
