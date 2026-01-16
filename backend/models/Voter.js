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
  email: { type: String, default: null, sparse: true },
  gmail_id: { type: String, default: null, sparse: true },
  age: { type: Number, default: null },
  gender: { type: String, enum: ["Male", "Female", "Other"], default: null },
  constituency: {
    type: String,
    required: true,
    validate: {
      validator: async function (value) {
        const exists = await Constituency.exists({ constituency_id: value });
        return exists !== null;
      },
      message: "Constituency ID does not exist."
    }
  },
  has_voted: { type: Boolean, default: false },
  voted_candidate_id: { type: String, default: null },
  vote_timestamp: { type: Date, default: null },
  is_verified: { type: Boolean, default: false },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  last_login: { type: Date, default: null },
  registration_date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Voter", VoterSchema);