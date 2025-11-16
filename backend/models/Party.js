const mongoose = require('mongoose');

const PartySchema = new mongoose.Schema({
  party_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true }
});

module.exports = mongoose.model("Party", PartySchema);