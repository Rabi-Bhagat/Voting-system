const mongoose = require('mongoose');

const PartySchema = new mongoose.Schema({
  party_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  approved: { type: Boolean, default: true }, // Admin can approve/reject parties
  approved_by: { type: String, default: null }, // Admin username who approved
  approved_at: { type: Date, default: null } // When approved
});

module.exports = mongoose.model("Party", PartySchema);