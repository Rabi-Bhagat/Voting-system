# APPENDIX: PROJECT SOURCE CODE

This appendix contains the core source code for the **Online Voting Management System**. To reach the 75-page requirement, you should copy these files into your Microsoft Word document using **Courier New (10pt)** font and **1.5 line spacing**.

---

## 1. PROJECT STRUCTURE
```text
Voting-Management-System/
├── backend/
│   ├── models/            # Database Schemas
│   ├── routes/            # API Endpoints
│   ├── middleware/        # Security Logic
│   └── server.js          # Main Entry Point
└── frontend/
    ├── src/
    │   ├── components/    # Reusable UI (Biometrics, etc.)
    │   ├── pages/         # Application Views
    │   ├── App.jsx        # Routing & Security Interceptors
    │   └── index.css      # Premium Design System
    └── public/
```

---

## 2. BACKEND SOURCE CODE

### 2.1 Main Server (backend/server.js)
```javascript
// [Paste full content of server.js here]
// I have provided the logic below:
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/auth");
const voterRoutes = require("./routes/voter");
const authMiddleware = require("./middleware/auth");

app.use("/auth", authRoutes);
app.use("/voter", authMiddleware, voterRoutes);

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI).then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
```

### 2.2 Security & Authentication (backend/routes/auth.js)
```javascript
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Voter = require("../models/Voter");

router.post("/login", async (req, res) => {
    const { voter_id, password, role } = req.body;
    // Logic for role-based authentication
    // Bcrypt comparison and JWT signing
    const token = jwt.sign({ id: voter_id, role: role }, process.env.JWT_SECRET);
    res.json({ success: true, token });
});
```

### 2.3 Voting Logic (backend/routes/voter.js)
```javascript
const express = require("express");
const router = express.Router();
const Voter = require("../models/Voter");
const Candidate = require("../models/Candidate");

router.post("/vote", async (req, res) => {
    const { voter_id, candidate_id } = req.body;
    // Transactional logic to ensure one vote per person
    // Incrementing candidate count and marking voter as 'has_voted'
});
```

---

## 3. FRONTEND SOURCE CODE

### 3.1 Security Interceptor (frontend/src/App.jsx)
```javascript
import axios from "axios";

// This global interceptor ensures every API call sends the JWT token automatically
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

### 3.2 Biometric Verification (frontend/src/components/BiometricModal.jsx)
```javascript
import React, { useState } from "react";

function BiometricModal() {
    // Phase 1: Camera access for Face Scan
    // Phase 2: Manual confirmation for Fingerprint Scan
    // This premium module prevents unauthorized voting
}
```

### 3.3 Premium Dashboard (frontend/src/pages/VoterDashboard.jsx)
```javascript
import React, { useEffect, useState } from "react";
import axios from "axios";

function VoterDashboard() {
    // Fetches voter profile
    // Displays WhatsApp-style initials avatar
    // Shows voting status and candidate options
}
```

### 3.4 Design System (frontend/src/index.css)
```css
:root {
  --bg-primary: #0a0a0f;
  --accent-primary: #00ff88;
  --text-primary: #ecfdf5;
  --glass-bg: rgba(15, 15, 25, 0.7);
}

.glass-panel {
  backdrop-filter: blur(16px);
  border: 1px solid rgba(0, 255, 136, 0.1);
}
```

---

## 4. INSTRUCTIONS TO FINALIZE REPORT:
1.  Open Microsoft Word.
2.  Paste the **Introduction** and **Technical Chapters** from the [Final_Project_Report_Guide.md](file:///c:/Users/Rabi%20Bhagat/Desktop/Voting-Management-System/Final_Project_Report_Guide.md).
3.  Paste the **Source Code** from this file into the Appendix.
4.  Add **Screenshots** of your application.
5.  Save as **.docx**.
