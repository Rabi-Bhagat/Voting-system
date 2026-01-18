<<<<<<< HEAD
// In routes/constituency.js
const express = require('express');
const router = express.Router();
const Constituency = require('../models/Constituency');

router.get('/:id', async (req, res) => {
  try {
    const constituency = await Constituency.findOne({ constituency_id: req.params.id });
    if (!constituency) {
      return res.status(404).json({ message: 'Constituency not found' });
    }
    res.json({ name: constituency.name });
  } catch (err) {
    console.error('Error fetching constituency:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
=======
// backend/routes/constituency.js
const express = require("express");
const router = express.Router();
const Constituency = require("../models/Constituency");

// GET /constituency        -> list all constituencies
router.get("/", async (req, res) => {
  try {
    const list = await Constituency.find({}, { _id: 0, __v: 0 }).lean();
    // return empty array if none found
    return res.json(list || []);
  } catch (err) {
    console.error("Error fetching constituencies:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /constituency/:id   -> get a single constituency by constituency_id
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!id)
      return res.status(400).json({ message: "Constituency id is required" });

    const constituency = await Constituency.findOne(
      { constituency_id: id },
      { _id: 0, __v: 0 } // hide internal fields
    ).lean();

    if (!constituency) {
      return res.status(404).json({ message: "Constituency not found" });
    }
    return res.json(constituency);
  } catch (err) {
    console.error("Error fetching constituency:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
>>>>>>> de1eb099c1c79e86bfb60c7b38aab150f1945dd7
