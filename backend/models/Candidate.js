const mongoose = require("mongoose");
const Party = require("./Party");
const Constituency = require("./Constituency");

const CandidateSchema = new mongoose.Schema({
  candidate_id: { type: String, required: true, unique: true },
  name: String,
  password: String, // For candidate login
  party_id: {
    type: String,
    required: function () {
      return this.candidate_id !== "NOTA";
    },
    validate: {
      validator: async function (value) {
        if (this.candidate_id === "NOTA") return true; // skip validation for NOTA
        const exists = await Party.exists({ party_id: value });
        return exists !== null;
      },
      message: "Party ID does not exist."
    }
  },
  constituency: String, // Optional, no validation
  background: { type: String, default: "" }, // Candidate background/bio
  education: { type: String, default: "" },
  experience: { type: String, default: "" },
  age: { type: Number, default: null },
  approved: { type: Boolean, default: false }, // Admin approval
  approved_by: { type: String, default: null }, // Admin username who approved
  approved_at: { type: Date, default: null }, // When approved
  votes: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Candidate", CandidateSchema);