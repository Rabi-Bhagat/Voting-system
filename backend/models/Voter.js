// const mongoose = require("mongoose");

// const VoterSchema = new mongoose.Schema({
//   voter_id: { type: String, required: true, unique: true },
//   first_name: String,
//   last_name: String,
//   password: String,
//   address: String,
//   phone: String,
//   constituency: String,
//   has_voted: { type: Boolean, default: false },
//   voted_candidate_id: { type: String, default: null },
// });

// module.exports = mongoose.model("Voter", VoterSchema);

const mongoose = require("mongoose");
const Constituency = require("./Constituency");

const VoterSchema = new mongoose.Schema({
  voter_id: { type: String, required: true, unique: true },
  first_name: String,
  last_name: String,
  password: String,
  address: String,
  phone: String,
  constituency: String, // Optional, no validation
  has_voted: { type: Boolean, default: false },
  voted_candidate_id: { type: String, default: null },
});

module.exports = mongoose.model("Voter", VoterSchema);