# 🗳️ Premium Online Voting Management System v3.0

**Professional-Grade, Secure, and Architecturally Robust Voting Platform**

This is a premium-grade MERN stack application designed for national-level election management. It features a stunning glassmorphic UI, multi-factor biometric authentication, and granular administrative controls for professional election orchestration.

---

## 💎 Premium Features & Innovations

### 🎨 State-of-the-Art Glassmorphic UI
*   **Deep Dark Aesthetics:** Optimized for high-end displays using `#0a0a0f` deep backgrounds and emerald-green highlights.
*   **Interactive Design:** Dynamic glowing orbs, blur-backdrop panels, and micro-animations for a premium feel.
*   **Initials-based Avatars:** Sophisticated, WhatsApp-inspired dynamic avatar system for all user roles.
*   **Responsive Excellence:** Fully optimized for mobile, tablet, and desktop viewing.

### 🔐 Multi-Factor Security System
*   **Biometric Identity Verification:** Industry-standard biometric scan simulation at critical steps:
    *   Secure User Login
    *   Voter Dashboard Access
    *   Final Vote Submission (Double-layer verification)
*   **Email OTP Verification:** Optional Gmail-based OTP verification for Login and Signup flows using **Nodemailer**.
*   **JWT Authentication:** Stateless session management with secure JSON Web Tokens.
*   **Password Hashing:** Industry-standard `bcrypt` protection for all credentials.

### 🏛️ Professional Election Orchestration
*   **Granular Participant Selection:** Admins can selectively assign specific **Approved Candidates** and **Parties** to individual elections.
*   **Constituency Mapping:** Automated restriction of voters to their respective participating constituencies.
*   **Live Analytics:** Real-time dashboards for Admins and Candidates with 30-second auto-refresh for live vote tracking.
*   **Audit Logging:** Comprehensive security tracking of every administrative and voting action.

---

## 🛠️ Technical Stack

| Layer | Technologies |
|---|-|
| **Frontend** | React.js, Lucide React, Axios, React Router, Vanilla CSS (Glassmorphism) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Authentication** | JWT, Biometric API (Simulation), Nodemailer (OTP) |
| **Dev Tools** | Git, Postman, npm |

---

## 📡 Core API Architecture (High-Level)

### 🔐 Authentication Flow
- `POST /auth/login` - Centralized role validation and JWT generation (Corrected).
- `POST /auth/otp/send-otp` - Generates and emails a 6-digit code.
- `POST /auth/otp/verify-otp` - Validates OTP against MongoDB with TTL index.

### 🗳️ Voting Flow
- `GET /voter/ballot/:id` - Fetches candidates restricted by the **Active Election**.
- `POST /voter/vote` - Records vote, updates candidate counts, and generates a **Vote Receipt**.
- `POST /voter/verify-receipt` - Cryptographic verification of cast ballots.

### ⚙️ Admin Flow
- `POST /election/create` - Creates election with specific `candidates`, `parties`, and `constituencies`.
- `POST /admin/add-voter` - Secure onboarding of new voters with constituency assignment.
- `PUT /admin/update-voter/:voter_id` - Manage and update voter profiles and district mapping.
- `GET /analytics/dashboard` - Aggregates real-time turnout and distribution statistics.

---

## 🛠️ Recent Optimizations (May 2026)

The following critical updates have been implemented to ensure a production-ready demonstration:
*   **Session Persistence Fix**: Resolved an issue where the JWT token was not being saved for Administrators, ensuring the dashboard loads correctly upon login.
*   **Data Integrity**: Added constituency selection to the Voter Registration flow, ensuring all new participants are correctly mapped to their districts.
*   **Secure Session Termination**: Standardized logout logic across all 5 dashboard roles to properly clear JWT tokens and user information.
*   **UI Resilience**: Added null-safe guards to the Ballot and Admin Management screens to prevent crashes during data lookups.

---

## 🚀 Quick Installation Guide

### 1. Prerequisites
- Node.js v16+
- MongoDB Atlas Account
- Gmail account with **App Password** (for OTP features)

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in `backend/`:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_gmail_app_password
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```
Create a `.env` file in `frontend/`:
```env
REACT_APP_API_URL=http://localhost:5000
```

### 4. Run the Application
Start Backend: `npm start` (inside /backend)  
Start Frontend: `npm start` (inside /frontend)

---

## 📈 System Flow for Interviewers

### Q: How is the security of a vote ensured?
**A:** We use a three-layer verification process. First, the user logs in with their ID and password. Second, a Biometric Scan is required before accessing the ballot. Third, a Final Biometric Confirmation is required at the moment the vote is cast. Additionally, the backend generates a unique cryptographic **Vote Receipt** for auditability.

### Q: How does the Admin manage different types of elections?
**A:** Unlike basic systems, our Admin can orchestrate professional elections by selecting specific participants. They can define which constituencies are active and which candidates/parties are allowed to compete, ensuring the platform can handle multiple localized or national elections seamlessly.

### Q: What is the benefit of the OTP system?
**A:** The optional OTP system provides Multi-Factor Authentication (MFA). By using Nodemailer and Gmail's secure transport, we ensure that the person logging in or signing up has access to the registered email address, preventing automated bot registrations and unauthorized access.

---

© 2026 Premium Voting Management System - Built for Excellence.