const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const Voter = require("./models/Voter");
const Candidate = require("./models/Candidate");
const Party = require("./models/Party");
const Constituency = require("./models/Constituency");

const MONGODB_URI = process.env.MONGODB_URI;

async function fixCredentials() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const hashedPass = await bcrypt.hash("pass123", 10);

    // 1. Fix Voter Arjun Singh
    const arjun = {
      voter_id: "V0057",
      first_name: "Arjun",
      last_name: "Singh",
      password: hashedPass,
      constituency: "C001",
      is_verified: true,
      verified: true
    };
    await Voter.findOneAndUpdate({ voter_id: "V0057" }, arjun, { upsert: true, new: true });
    console.log("Voter V0057 (Arjun Singh) ensured.");

    // 2. Fix Candidate Rajesh Kumar
    const rajesh = {
      candidate_id: "CAN001",
      name: "Rajesh Kumar",
      password: hashedPass,
      party_id: "P001",
      constituency: "C001",
      approved: true,
      is_verified: true
    };
    await Candidate.findOneAndUpdate({ candidate_id: "CAN001" }, rajesh, { upsert: true, new: true });
    console.log("Candidate CAN001 (Rajesh Kumar) ensured.");

    // 3. Fix Party Democratic Alliance
    const party = {
      party_id: "P001",
      name: "Democratic Alliance",
      password: hashedPass,
      approved: true,
      is_verified: true
    };
    await Party.findOneAndUpdate({ party_id: "P001" }, party, { upsert: true, new: true });
    console.log("Party P001 (Democratic Alliance) ensured.");

    // 4. Fix Constituency North District
    const consti = {
      constituency_id: "C001",
      name: "North District",
      password: hashedPass
    };
    await Constituency.findOneAndUpdate({ constituency_id: "C001" }, consti, { upsert: true, new: true });
    console.log("Constituency C001 (North District) ensured.");

    console.log("All test credentials fixed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error fixing credentials:", err);
    process.exit(1);
  }
}

fixCredentials();
