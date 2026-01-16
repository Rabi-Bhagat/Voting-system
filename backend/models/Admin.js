const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  admin_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, default: null, sparse: true },
  gmail_id: { type: String, default: null, sparse: true },
  phone: { type: String, default: null },
  role: { type: String, enum: ["super_admin", "admin"], default: "admin" },
  permissions: [String], // Array of permissions
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  registration_date: { type: Date, default: Date.now },
  last_login: { type: Date, default: null },
  last_password_change: { type: Date, default: null }
});

module.exports = mongoose.model("Admin", AdminSchema);
