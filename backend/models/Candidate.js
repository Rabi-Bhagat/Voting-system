const mongoose = require("mongoose");
const Party = require("./Party");
const Constituency = require("./Constituency");

const CandidateSchema = new mongoose.Schema({
  candidate_id: { type: String, required: true, unique: true },
  name: String,
  email: { type: String, default: null, sparse: true },
  gmail_id: { type: String, default: null, sparse: true },
  age: { type: Number, default: null },
  education: { type: String, default: null },
  experience: { type: String, default: null },
  bio: { type: String, default: null },
  image_url: { type: String, default: null },
  party_id: {
    type: String,
    required: function () {
      return this.candidate_id !== "NOTA";
    },
    validate: {
      validator: async function (value) {
        if (this.candidate_id === "NOTA") return true;
        const exists = await Party.exists({ party_id: value });
        return exists !== null;
      },
      message: "Party ID does not exist."
    }
  },
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
  votes: {
    type: Number,
    default: 0
  },
  vote_percentage: { type: Number, default: 0 },
  is_verified: { type: Boolean, default: false },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  registration_date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Candidate", CandidateSchema);