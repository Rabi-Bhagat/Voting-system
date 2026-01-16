# 👨‍💼 Admin Dashboard Guide - Complete Reference

**Comprehensive guide for admin dashboard features and endpoints**

---

## 📊 Admin Dashboard Overview

The admin dashboard provides complete visibility into all system data with detailed views for voters, candidates, and parties.

---

## 🔍 Section 1: View All Voters

### Endpoint
```
GET /admin-dashboard/voters
```

### What You See
Complete list of all voters with:
- **Personal Information:** voter_id, first_name, last_name, full_name
- **Contact Details:** email, gmail_id, phone, address
- **Demographics:** age, gender
- **Constituency:** constituency_id, constituency_name
- **Voting Status:** has_voted, voted_candidate_id, vote_timestamp
- **Verification:** is_verified, verification_status (Verified/Pending)
- **Account Status:** is_active, status (Active/Inactive)
- **Activity:** created_at, registration_date, last_login

### Response Summary
```json
{
  "total_voters": 100,
  "verified_voters": 85,
  "pending_voters": 15,
  "active_voters": 98,
  "inactive_voters": 2,
  "voted_voters": 45,
  "not_voted_voters": 55,
  "voters": [
    {
      "voter_id": "V0001",
      "first_name": "Rajesh",
      "last_name": "Kumar",
      "full_name": "Rajesh Kumar",
      "email": "rajesh@example.com",
      "gmail_id": "rajesh@gmail.com",
      "phone": "9876543210",
      "address": "123 Main St",
      "age": 35,
      "gender": "Male",
      "constituency_id": "C001",
      "constituency_name": "North District",
      "has_voted": false,
      "voted_candidate_id": null,
      "vote_timestamp": null,
      "is_verified": true,
      "verification_status": "Verified",
      "is_active": true,
      "status": "Active",
      "created_at": "2026-01-15T10:00:00.000Z",
      "registration_date": "2026-01-15T10:00:00.000Z",
      "last_login": "2026-01-15T10:30:00.000Z"
    }
  ]
}
```

### Use Cases
- Monitor voter registration
- Check verification status
- Track voting participation
- Identify inactive voters
- View voter contact information

---

## 🔍 Section 2: View Single Voter Details

### Endpoint
```
GET /admin-dashboard/voters/:voter_id
```

### Example
```
GET /admin-dashboard/voters/V0001
```

### What You See
Complete detailed profile of a single voter organized in sections:

**Voter Details Section:**
- voter_id, first_name, last_name, full_name
- email, gmail_id, phone, address
- age, gender

**Constituency Info Section:**
- constituency_id, constituency_name

**Voting Info Section:**
- has_voted (true/false)
- voted_candidate_id (if voted)
- vote_timestamp (when voted)

**Verification Info Section:**
- is_verified (true/false)
- verification_status (Verified/Pending)

**Status Info Section:**
- is_active (true/false)
- status (Active/Inactive)

**Activity Info Section:**
- created_at (account creation date)
- registration_date (registration date)
- last_login (last login time)

### Use Cases
- Review individual voter profile
- Verify voter information
- Check voting history
- Monitor voter activity
- Update voter status

---

## 🎯 Section 3: View All Candidates

### Endpoint
```
GET /admin-dashboard/candidates
```

### What You See
Complete list of all candidates with:
- **Personal Information:** candidate_id, name, email, gmail_id
- **Background:** age, education, experience, bio
- **Media:** image_url
- **Party Info:** party_id, party_name, party_symbol, party_color
- **Constituency:** constituency_id, constituency_name
- **Voting Stats:** votes, vote_percentage
- **Verification:** is_verified, verification_status
- **Status:** is_active, status
- **Activity:** created_at, registration_date

### Response Summary
```json
{
  "total_candidates": 15,
  "verified_candidates": 12,
  "pending_candidates": 3,
  "active_candidates": 14,
  "inactive_candidates": 1,
  "candidates": [
    {
      "candidate_id": "CAN001",
      "name": "Rajesh Kumar",
      "email": "candidate@example.com",
      "gmail_id": "candidate@gmail.com",
      "age": 45,
      "education": "B.Tech, MBA",
      "experience": "15 years in public service",
      "bio": "Experienced administrator",
      "image_url": "https://example.com/image.jpg",
      "party_id": "P001",
      "party_name": "Democratic Alliance",
      "party_symbol": "🦁",
      "party_color": "#FF6B6B",
      "constituency_id": "C001",
      "constituency_name": "North District",
      "votes": 150,
      "vote_percentage": 45.45,
      "is_verified": true,
      "verification_status": "Verified",
      "is_active": true,
      "status": "Active",
      "created_at": "2026-01-15T10:00:00.000Z",
      "registration_date": "2026-01-15T10:00:00.000Z"
    }
  ]
}
```

### Use Cases
- Monitor candidate registration
- Check candidate verification
- Track voting performance
- View candidate credentials
- Manage candidate status

---

## 🎯 Section 4: View Single Candidate Details

### Endpoint
```
GET /admin-dashboard/candidates/:candidate_id
```

### Example
```
GET /admin-dashboard/candidates/CAN001
```

### What You See
Complete detailed profile of a single candidate organized in sections:

**Candidate Details Section:**
- candidate_id, name, email, gmail_id
- age, education, experience, bio, image_url

**Party Info Section:**
- party_id, party_name, party_symbol, party_color, party_description

**Constituency Info Section:**
- constituency_id, constituency_name

**Voting Info Section:**
- votes (total votes received)
- vote_percentage (percentage of votes)

**Verification Info Section:**
- is_verified (true/false)
- verification_status (Verified/Pending)

**Status Info Section:**
- is_active (true/false)
- status (Active/Inactive)

**Activity Info Section:**
- created_at (registration date)
- registration_date (registration date)

### Use Cases
- Review candidate credentials
- Verify candidate information
- Check voting performance
- Monitor candidate status
- View party affiliation

---

## 🏛️ Section 5: View All Parties

### Endpoint
```
GET /admin-dashboard/parties
```

### What You See
Complete list of all parties with:
- **Party Info:** party_id, name, email, gmail_id
- **Branding:** symbol, color
- **Details:** description, founded_year
- **Statistics:** total_candidates, total_votes
- **Verification:** is_verified, verification_status
- **Status:** is_active, status
- **Activity:** created_at, registration_date

### Response Summary
```json
{
  "total_parties": 4,
  "verified_parties": 3,
  "pending_parties": 1,
  "active_parties": 4,
  "inactive_parties": 0,
  "parties": [
    {
      "party_id": "P001",
      "name": "Democratic Alliance",
      "email": "party@example.com",
      "gmail_id": "party@gmail.com",
      "symbol": "🦁",
      "color": "#FF6B6B",
      "description": "Progressive and inclusive party",
      "founded_year": 2010,
      "total_candidates": 5,
      "total_votes": 750,
      "is_verified": true,
      "verification_status": "Verified",
      "is_active": true,
      "status": "Active",
      "created_at": "2026-01-15T10:00:00.000Z",
      "registration_date": "2026-01-15T10:00:00.000Z"
    }
  ]
}
```

### Use Cases
- Monitor party registration
- Check party verification
- Track party performance
- View party statistics
- Manage party status

---

## 🏛️ Section 6: View Single Party Details

### Endpoint
```
GET /admin-dashboard/parties/:party_id
```

### Example
```
GET /admin-dashboard/parties/P001
```

### What You See
Complete detailed profile of a single party organized in sections:

**Party Details Section:**
- party_id, name, email, gmail_id
- symbol, color, description, founded_year

**Statistics Section:**
- total_candidates (number of candidates)
- total_votes (total votes received)
- verified_candidates (number of verified candidates)
- active_candidates (number of active candidates)

**Verification Info Section:**
- is_verified (true/false)
- verification_status (Verified/Pending)

**Status Info Section:**
- is_active (true/false)
- status (Active/Inactive)

**Activity Info Section:**
- created_at (registration date)
- registration_date (registration date)

**Candidates Section:**
- List of all candidates with:
  - candidate_id, name
  - constituency_id, constituency_name
  - votes, is_verified

### Use Cases
- Review party information
- Verify party details
- Check party performance
- Monitor candidate list
- View party statistics

---

## 📊 Section 7: Dashboard Summary

### Endpoint
```
GET /admin-dashboard/summary
```

### What You See
Overall dashboard statistics:

**Voters Summary:**
- total_voters (total registered voters)
- verified_voters (number of verified voters)
- active_voters (number of active voters)
- voted_voters (number of voters who voted)
- voter_turnout (percentage of voters who voted)

**Candidates Summary:**
- total_candidates (total registered candidates)
- verified_candidates (number of verified candidates)
- active_candidates (number of active candidates)

**Parties Summary:**
- total_parties (total registered parties)
- verified_parties (number of verified parties)
- active_parties (number of active parties)

**Constituencies Summary:**
- total_constituencies (total constituencies)

**Voting Summary:**
- total_votes_cast (total votes cast)
- average_votes_per_candidate (average votes per candidate)

### Response Example
```json
{
  "summary": {
    "total_voters": 100,
    "verified_voters": 85,
    "active_voters": 98,
    "voted_voters": 45,
    "voter_turnout": "45.00"
  },
  "candidates_summary": {
    "total_candidates": 15,
    "verified_candidates": 12,
    "active_candidates": 14
  },
  "parties_summary": {
    "total_parties": 4,
    "verified_parties": 3,
    "active_parties": 4
  },
  "constituencies_summary": {
    "total_constituencies": 5
  },
  "voting_summary": {
    "total_votes_cast": 330,
    "average_votes_per_candidate": "22.00"
  }
}
```

### Use Cases
- Get quick overview of system status
- Monitor election progress
- Check voter turnout
- View overall statistics
- Dashboard home page

---

## 🔐 Gmail Field in Voter Login

### When Voter Registers
```
POST /admin/add-voter
{
  "voter_id": "V0001",
  "first_name": "John",
  "last_name": "Doe",
  "password": "pass123",
  "email": "john@example.com",
  "gmail_id": "john@gmail.com",  // Optional
  "phone": "9876543210",
  "address": "123 Main St",
  "age": 30,
  "gender": "Male",
  "constituency": "C001"
}
```

### When Voter Logs In
- Voter uses voter_id and password
- Gmail is optional field for password recovery
- If voter forgets password, they can use Gmail to reset

### Password Recovery with Gmail
```
POST /password-recovery/request-otp
{
  "user_id": "V0001",
  "user_type": "voter",
  "email": "john@gmail.com"  // Gmail address
}
```

---

## ✅ Complete Admin Dashboard Checklist

- [x] View all voters with complete details
- [x] View single voter profile
- [x] View all candidates with complete details
- [x] View single candidate profile
- [x] View all parties with complete details
- [x] View single party profile
- [x] View dashboard summary statistics
- [x] Gmail field for password recovery
- [x] Verification status tracking
- [x] Activity logging

---

## 🎯 Admin Dashboard Workflow

### 1. Login as Admin
```
POST /login
{
  "role": "admin",
  "password": "admin123"
}
```

### 2. View Dashboard Summary
```
GET /admin-dashboard/summary
```

### 3. View All Voters
```
GET /admin-dashboard/voters
```

### 4. View Specific Voter
```
GET /admin-dashboard/voters/V0001
```

### 5. View All Candidates
```
GET /admin-dashboard/candidates
```

### 6. View Specific Candidate
```
GET /admin-dashboard/candidates/CAN001
```

### 7. View All Parties
```
GET /admin-dashboard/parties
```

### 8. View Specific Party
```
GET /admin-dashboard/parties/P001
```

### 9. Verify Users
```
PUT /admin/verify/voter/V0001
{
  "is_verified": true
}
```

### 10. Launch Election
```
POST /admin/launch-election
{
  "constituency_id": "C001"
}
```

---

**Version:** 2.1  
**Status:** ✅ Complete  
**Last Updated:** January 2026  

🗳️ **Admin Dashboard Ready for Use!**
