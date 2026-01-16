const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");

// GET /admin-management/profile/:admin_id - Get admin profile
router.get("/profile/:admin_id", async (req, res) => {
  try {
    const admin = await Admin.findOne({ admin_id: req.params.admin_id }).select("-password");

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json({
      profile: {
        admin_id: admin.admin_id,
        name: admin.name,
        email: admin.email,
        gmail_id: admin.gmail_id,
        phone: admin.phone,
        role: admin.role,
        permissions: admin.permissions,
        is_active: admin.is_active,
        created_at: admin.created_at,
        registration_date: admin.registration_date,
        last_login: admin.last_login,
        last_password_change: admin.last_password_change
      }
    });
  } catch (err) {
    console.error("Error fetching admin profile:", err);
    res.status(500).json({ error: "Failed to fetch admin profile", details: err.message });
  }
});

// PUT /admin-management/update-gmail/:admin_id - Update admin Gmail
router.put("/update-gmail/:admin_id", async (req, res) => {
  const { admin_id } = req.params;
  const { gmail_id } = req.body;

  if (!gmail_id) {
    return res.status(400).json({ error: "Gmail ID is required" });
  }

  // Validate Gmail format
  if (!gmail_id.match(/^[^\s@]+@gmail\.com$/)) {
    return res.status(400).json({
      error: "Invalid Gmail format",
      message: "Gmail must end with @gmail.com"
    });
  }

  try {
    // Check if Gmail already registered
    const existingAdmin = await Admin.findOne({ gmail_id });
    if (existingAdmin && existingAdmin.admin_id !== admin_id) {
      return res.status(409).json({
        error: "Gmail already registered",
        message: "This Gmail is already associated with another admin"
      });
    }

    const admin = await Admin.findOne({ admin_id });
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    admin.gmail_id = gmail_id;
    await admin.save();

    res.json({
      success: true,
      message: "Gmail updated successfully",
      admin: {
        admin_id: admin.admin_id,
        name: admin.name,
        gmail_id: admin.gmail_id
      }
    });
  } catch (err) {
    console.error("Error updating Gmail:", err);
    res.status(500).json({ error: "Failed to update Gmail", details: err.message });
  }
});

// PUT /admin-management/update-email/:admin_id - Update admin email
router.put("/update-email/:admin_id", async (req, res) => {
  const { admin_id } = req.params;
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  // Validate email format
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return res.status(400).json({
      error: "Invalid email format"
    });
  }

  try {
    // Check if email already registered
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin && existingAdmin.admin_id !== admin_id) {
      return res.status(409).json({
        error: "Email already registered",
        message: "This email is already associated with another admin"
      });
    }

    const admin = await Admin.findOne({ admin_id });
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    admin.email = email;
    await admin.save();

    res.json({
      success: true,
      message: "Email updated successfully",
      admin: {
        admin_id: admin.admin_id,
        name: admin.name,
        email: admin.email
      }
    });
  } catch (err) {
    console.error("Error updating email:", err);
    res.status(500).json({ error: "Failed to update email", details: err.message });
  }
});

// PUT /admin-management/update-phone/:admin_id - Update admin phone
router.put("/update-phone/:admin_id", async (req, res) => {
  const { admin_id } = req.params;
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: "Phone is required" });
  }

  try {
    const admin = await Admin.findOne({ admin_id });
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    admin.phone = phone;
    await admin.save();

    res.json({
      success: true,
      message: "Phone updated successfully",
      admin: {
        admin_id: admin.admin_id,
        name: admin.name,
        phone: admin.phone
      }
    });
  } catch (err) {
    console.error("Error updating phone:", err);
    res.status(500).json({ error: "Failed to update phone", details: err.message });
  }
});

// GET /admin-management/list - List all admins (super admin only)
router.get("/list", async (req, res) => {
  try {
    const admins = await Admin.find({}).select("-password");

    res.json({
      total: admins.length,
      admins: admins.map(admin => ({
        admin_id: admin.admin_id,
        name: admin.name,
        email: admin.email,
        gmail_id: admin.gmail_id,
        role: admin.role,
        is_active: admin.is_active,
        created_at: admin.created_at,
        last_login: admin.last_login
      }))
    });
  } catch (err) {
    console.error("Error listing admins:", err);
    res.status(500).json({ error: "Failed to list admins", details: err.message });
  }
});

// PUT /admin-management/change-password/:admin_id - Change admin password
router.put("/change-password/:admin_id", async (req, res) => {
  const { admin_id } = req.params;
  const { old_password, new_password } = req.body;

  if (!old_password || !new_password) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["old_password", "new_password"]
    });
  }

  if (new_password.length < 6) {
    return res.status(400).json({
      error: "New password must be at least 6 characters"
    });
  }

  try {
    const admin = await Admin.findOne({ admin_id });
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Verify old password
    if (admin.password !== old_password) {
      return res.status(400).json({ error: "Old password is incorrect" });
    }

    admin.password = new_password;
    admin.last_password_change = new Date();
    await admin.save();

    res.json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ error: "Failed to change password", details: err.message });
  }
});

module.exports = router;
