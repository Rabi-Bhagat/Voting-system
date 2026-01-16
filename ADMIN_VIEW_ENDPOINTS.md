# 👨‍💼 Admin View Endpoints - Complete Testing Guide

**All endpoints for admin to view voter, candidate, and party details**

---

## 🎯 Quick Reference - All Admin View Endpoints

### View All Voters
```
GET http://localhost:5000/admin-dashboard/voters
```

### View Single Voter
```
GET http://localhost:5000/admin-dashboard/voters/V0001
```

### View All Candidates
```
GET http://localhost:5000/admin-dashboard/candidates
```

### View Single Candidate
```
GET http://localhost:5000/admin-dashboard/candidates/CAN001
```

### View All Parties
```
GET http://localhost:5000/admin-dashboard/parties
```

### View Single Party
```
GET http://localhost:5000/admin-dashboard/parties/P001
```

### View Dashboard Summary
```
GET http://localhost:5000/admin-dashboard/summary
```

---

## 📋 Detailed Endpoint Documentation

### 1️⃣ VIEW ALL VOTERS

**Endpoint:**
```
GET /admin-dashboard/voters
```

**URL:**
```
http://localhost:5000/admin-dashboard/voters
```

**What Admin Sees:**
- Total voters count
- Verified voters count
- Pending voters count
- Active voters count
- Inactive voters count
- Voted voters count
- Not voted voters count
- Complete list of all voters with details

**Response Fields for Each Voter:**
```
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
```

**Test Command:**
```bash
curl http://localhost:5000/admin-dashboard/voters
```

**Use Cases:**
- See all registered voters
- Check verification status
- Monitor voting participation
- Identify inactive voters
- View contact information

---

### 2️⃣ VIEW SINGLE VOTER DETAILS

**Endpoint:**
```
GET /admin-dashboard/voters/:voter_id
```

**URL Example:**
```
http://localhost:5000/admin-dashboard/voters/V0001
```

**What Admin Sees:**
- Complete voter profile organized in sections
- Voter personal details
- Constituency information
- Voting information
- Verification status
- Account status
- Activity history

**Response Structure:**
```
{
  "voter_details": {
    "voter_id": "V0001",
    "first_name": "Rajesh",
    "last_name": "Kumar",
    "full_name": "Rajesh Kumar",
    "email": "rajesh@example.com",
    "gmail_id": "rajesh@gmail.com",
    "phone": "9876543210",
    "address": "123 Main St",
    "age": 35,
    "gender": "Male"
  },
  "constituency_info": {
    "constituency_id": "C001",
    "constituency_name": "North District"
  },
  "voting_info": {
    "has_voted": false,
    "voted_candidate_id": null,
    "vote_timestamp": null
  },
  "verification_info": {
    "is_verified": true,
    "verification_status": "Verified"
  },
  "status_info": {
    "is_active": true,
    "status": "Active"
  },
  "activity_info": {
    "created_at": "2026-01-15T10:00:00.000Z",
    "registration_date": "2026-01-15T10:00:00.000Z",
    "last_login": "2026-01-15T10:30:00.000Z"
  }
}
```

**Test Command:**
```bash
curl http://localhost:5000/admin-dashboard/voters/V0001
```

**Use Cases:**
- Review individual voter profile
- Verify voter information
- Check voting history
- Monitor voter activity
- Update voter status

---

### 3️⃣ VIEW ALL CANDIDATES

**Endpoint:**
```
GET /admin-dashboard/candidates
```

**URL:**
```
http://localhost:5000/admin-dashboard/candidates
```

**What Admin Sees:**
- Total candidates count
- Verified candidates count
- Pending candidates count
- Active candidates count
- Inactive candidates count
- Complete list of all candidates with details

**Response Fields for Each Candidate:**
```
{
  "candidate_id": "CAN001",
  "name": "Rajesh Kumar",
  "email": "candidate@example.com",
  "gmail_id": "candidate@gmail.com",
  "age": 45,
  "education": "B.Tech, MBA",
  "experience": "15 years in public service",
  "bio": "Experienced administrator with focus on infrastructure",
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
```

**Test Command:**
```bash
curl http://localhost:5000/admin-dashboard/candidates
```

**Use Cases:**
- See all registered candidates
- Check candidate verification
- Track voting performance
- View candidate credentials
- Manage candidate status

---

### 4️⃣ VIEW SINGLE CANDIDATE DETAILS

**Endpoint:**
```
GET /admin-dashboard/candidates/:candidate_id
```

**URL Example:**
```
http://localhost:5000/admin-dashboard/candidates/CAN001
```

**What Admin Sees:**
- Complete candidate profile organized in sections
- Candidate personal details
- Party information
- Constituency information
- Voting statistics
- Verification status
- Account status
- Activity history

**Response Structure:**
```
{
  "candidate_details": {
    "candidate_id": "CAN001",
    "name": "Rajesh Kumar",
    "email": "candidate@example.com",
    "gmail_id": "candidate@gmail.com",
    "age": 45,
    "education": "B.Tech, MBA",
    "experience": "15 years in public service",
    "bio": "Experienced administrator",
    "image_url": "https://example.com/image.jpg"
  },
  "party_info": {
    "party_id": "P001",
    "party_name": "Democratic Alliance",
    "party_symbol": "🦁",
    "party_color": "#FF6B6B",
    "party_description": "Progressive and inclusive party"
  },
  "constituency_info": {
    "constituency_id": "C001",
    "constituency_name": "North District"
  },
  "voting_info": {
    "votes": 150,
    "vote_percentage": 45.45
  },
  "verification_info": {
    "is_verified": true,
    "verification_status": "Verified"
  },
  "status_info": {
    "is_active": true,
    "status": "Active"
  },
  "activity_info": {
    "created_at": "2026-01-15T10:00:00.000Z",
    "registration_date": "2026-01-15T10:00:00.000Z"
  }
}
```

**Test Command:**
```bash
curl http://localhost:5000/admin-dashboard/candidates/CAN001
```

**Use Cases:**
- Review candidate credentials
- Verify candidate information
- Check voting performance
- Monitor candidate status
- View party affiliation

---

### 5️⃣ VIEW ALL PARTIES

**Endpoint:**
```
GET /admin-dashboard/parties
```

**URL:**
```
http://localhost:5000/admin-dashboard/parties
```

**What Admin Sees:**
- Total parties count
- Verified parties count
- Pending parties count
- Active parties count
- Inactive parties count
- Complete list of all parties with details

**Response Fields for Each Party:**
```
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
```

**Test Command:**
```bash
curl http://localhost:5000/admin-dashboard/parties
```

**Use Cases:**
- See all registered parties
- Check party verification
- Track party performance
- View party statistics
- Manage party status

---

### 6️⃣ VIEW SINGLE PARTY DETAILS

**Endpoint:**
```
GET /admin-dashboard/parties/:party_id
```

**URL Example:**
```
http://localhost:5000/admin-dashboard/parties/P001
```

**What Admin Sees:**
- Complete party profile organized in sections
- Party information
- Party statistics
- Verification status
- Account status
- Activity history
- List of all candidates in party

**Response Structure:**
```
{
  "party_details": {
    "party_id": "P001",
    "name": "Democratic Alliance",
    "email": "party@example.com",
    "gmail_id": "party@gmail.com",
    "symbol": "🦁",
    "color": "#FF6B6B",
    "description": "Progressive and inclusive party",
    "founded_year": 2010
  },
  "statistics": {
    "total_candidates": 5,
    "total_votes": 750,
    "verified_candidates": 4,
    "active_candidates": 5
  },
  "verification_info": {
    "is_verified": true,
    "verification_status": "Verified"
  },
  "status_info": {
    "is_active": true,
    "status": "Active"
  },
  "activity_info": {
    "created_at": "2026-01-15T10:00:00.000Z",
    "registration_date": "2026-01-15T10:00:00.000Z"
  },
  "candidates": [
    {
      "candidate_id": "CAN001",
      "name": "Rajesh Kumar",
      "constituency_id": "C001",
      "constituency_name": "North District",
      "votes": 150,
      "is_verified": true
    }
  ]
}
```

**Test Command:**
```bash
curl http://localhost:5000/admin-dashboard/parties/P001
```

**Use Cases:**
- Review party information
- Verify party details
- Check party performance
- Monitor candidate list
- View party statistics

---

### 7️⃣ VIEW DASHBOARD SUMMARY

**Endpoint:**
```
GET /admin-dashboard/summary
```

**URL:**
```
http://localhost:5000/admin-dashboard/summary
```

**What Admin Sees:**
- Overall voters statistics
- Overall candidates statistics
- Overall parties statistics
- Overall constituencies statistics
- Overall voting statistics

**Response Structure:**
```
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

**Test Command:**
```bash
curl http://localhost:5000/admin-dashboard/summary
```

**Use Cases:**
- Get quick overview of system status
- Monitor election progress
- Check voter turnout
- View overall statistics
- Dashboard home page

---

## 🔍 How to Test All Endpoints

### Using Browser
1. Open browser
2. Go to: `http://localhost:5000/admin-dashboard/voters`
3. Replace endpoint as needed

### Using cURL (Command Line)

**View All Voters:**
```bash
curl http://localhost:5000/admin-dashboard/voters
```

**View Single Voter:**
```bash
curl http://localhost:5000/admin-dashboard/voters/V0001
```

**View All Candidates:**
```bash
curl http://localhost:5000/admin-dashboard/candidates
```

**View Single Candidate:**
```bash
curl http://localhost:5000/admin-dashboard/candidates/CAN001
```

**View All Parties:**
```bash
curl http://localhost:5000/admin-dashboard/parties
```

**View Single Party:**
```bash
curl http://localhost:5000/admin-dashboard/parties/P001
```

**View Dashboard Summary:**
```bash
curl http://localhost:5000/admin-dashboard/summary
```

### Using Postman
1. Create new request
2. Select GET method
3. Enter URL: `http://localhost:5000/admin-dashboard/voters`
4. Click Send
5. View response

---

## ✅ Verification Checklist

- [x] View all voters endpoint working
- [x] View single voter endpoint working
- [x] View all candidates endpoint working
- [x] View single candidate endpoint working
- [x] View all parties endpoint working
- [x] View single party endpoint working
- [x] View dashboard summary endpoint working
- [x] All fields displaying correctly
- [x] Gmail field included
- [x] Verification status showing
- [x] Activity tracking showing
- [x] Statistics calculating correctly

---

## 📊 Sample Data to Expect

### Sample Voter
```
voter_id: V0001
name: Rajesh Kumar
email: rajesh@example.com
gmail_id: rajesh@gmail.com
phone: 9876543210
constituency: North District
verified: Yes
status: Active
voted: No
```

### Sample Candidate
```
candidate_id: CAN001
name: Rajesh Kumar
email: candidate@example.com
gmail_id: candidate@gmail.com
party: Democratic Alliance
constituency: North District
votes: 150
verified: Yes
status: Active
```

### Sample Party
```
party_id: P001
name: Democratic Alliance
email: party@example.com
gmail_id: party@gmail.com
symbol: 🦁
color: #FF6B6B
candidates: 5
total_votes: 750
verified: Yes
status: Active
```

---

**Version:** 2.1  
**Status:** ✅ Complete  
**Last Updated:** January 2026  

🗳️ **All Admin View Endpoints Ready for Testing!**
