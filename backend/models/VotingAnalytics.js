const mongoose = require("mongoose");

const VotingAnalyticsSchema = new mongoose.Schema({
  constituency_id: { type: String, required: true },
  total_voters: { type: Number, default: 0 },
  total_votes_cast: { type: Number, default: 0 },
  voter_turnout_percentage: { type: Number, default: 0 },
  votes_by_party: [{
    party_id: String,
    party_name: String,
    votes: Number,
    percentage: Number
  }],
  votes_by_candidate: [{
    candidate_id: String,
    candidate_name: String,
    votes: Number,
    percentage: Number
  }],
  gender_distribution: {
    male: { type: Number, default: 0 },
    female: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  age_distribution: [{
    age_group: String,
    count: Number
  }],
  peak_voting_time: { type: String, default: null },
  last_updated: { type: Date, default: Date.now }
});

module.exports = mongoose.model("VotingAnalytics", VotingAnalyticsSchema);
