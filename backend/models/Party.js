const mongoose = require('mongoose');

const PartySchema = new mongoose.Schema({
  party_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
<<<<<<< HEAD
  email: { type: String, default: null, sparse: true },
  gmail_id: { type: String, default: null, sparse: true },
  symbol: { type: String, default: null },
  color: { type: String, default: null },
  description: { type: String, default: null },
  founded_year: { type: Number, default: null },
  total_votes: { type: Number, default: 0 },
  is_verified: { type: Boolean, default: false },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  registration_date: { type: Date, default: Date.now }
=======
  approved: { type: Boolean, default: true }, // Admin can approve/reject parties
  approved_by: { type: String, default: null }, // Admin username who approved
  approved_at: { type: Date, default: null } // When approved
>>>>>>> de1eb099c1c79e86bfb60c7b38aab150f1945dd7
});

module.exports = mongoose.model("Party", PartySchema);