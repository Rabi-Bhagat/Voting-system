const mongoose = require("mongoose");
const Party = require("./Party");
const Constituency = require("./Constituency");

const CandidateSchema = new mongoose.Schema({
  candidate_id: { type: String, required: true, unique: true },
  name: String,
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
  votes: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Candidate", CandidateSchema);