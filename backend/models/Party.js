const mongoose = require('mongoose');

const PartySchema = new mongoose.Schema({
  party_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  symbol: { type: String, default: null },
  color: { type: String, default: null },
  description: { type: String, default: null },
  founded_year: { type: Number, default: null },
  total_votes: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Party", PartySchema);