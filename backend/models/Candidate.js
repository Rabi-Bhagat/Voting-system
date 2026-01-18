const mongoose = require("mongoose");
const Party = require("./Party");
const Constituency = require("./Constituency");

const CandidateSchema = new mongoose.Schema({
  candidate_id: { type: String, required: true, unique: true },
  name: String,
<<<<<<< HEAD
  email: { type: String, default: null, sparse: true },
  gmail_id: { type: String, default: null, sparse: true },
  age: { type: Number, default: null },
  education: { type: String, default: null },
  experience: { type: String, default: null },
  bio: { type: String, default: null },
  image_url: { type: String, default: null },
=======
  password: String, // For candidate login
>>>>>>> de1eb099c1c79e86bfb60c7b38aab150f1945dd7
  party_id: {
    type: String,
    required: function () {
      return this.candidate_id !== "NOTA";
    },
    validate: {
      validator: async function (value) {
<<<<<<< HEAD
        if (this.candidate_id === "NOTA") return true;
=======
        if (this.candidate_id === "NOTA") return true; // skip validation for NOTA
>>>>>>> de1eb099c1c79e86bfb60c7b38aab150f1945dd7
        const exists = await Party.exists({ party_id: value });
        return exists !== null;
      },
      message: "Party ID does not exist."
    }
  },
<<<<<<< HEAD
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
=======
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
>>>>>>> de1eb099c1c79e86bfb60c7b38aab150f1945dd7
});

module.exports = mongoose.model("Candidate", CandidateSchema);