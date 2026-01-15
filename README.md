# 🗳️ Online Voting Management System

A comprehensive, secure, and scalable online voting system built with React, Node.js, Express, and MongoDB Atlas.

## ✨ Features

### Core Features
- ✅ Multi-role authentication (Admin, Voter, Party, Constituency)
- ✅ Voter registration and profile management
- ✅ Constituency-based ballot generation
- ✅ Single vote per voter enforcement
- ✅ NOTA (None of the Above) option
- ✅ Real-time vote counting
- ✅ Automatic winner determination
- ✅ Draw detection and handling

### Advanced Features
- ✅ Real-time analytics dashboard
- ✅ Voter turnout tracking
- ✅ Demographic analysis (Gender, Age)
- ✅ Constituency-wise statistics
- ✅ Party-wise performance metrics
- ✅ Candidate-wise vote distribution
- ✅ Vote timestamp recording
- ✅ Voter verification system

### Unique Features
- ✅ Multi-level analytics (National, Constituency, Party, Candidate)
- ✅ Live voting updates
- ✅ Comprehensive voter history
- ✅ Peak voting time analysis
- ✅ Demographic insights
- ✅ Vote percentage calculations

## 🚀 Quick Start

### Prerequisites
- Node.js v14+
- MongoDB Atlas account
- npm or yarn

### Installation

#### 1. Backend Setup
```bash
cd backend
npm install
npm start
```

Expected output:
```
✅ MongoDB Atlas connected successfully!
✅ Server running on port 5000
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm start
```

Expected: Browser opens at `http://localhost:3000`

### Verify Installation
```bash
curl http://localhost:5000/health
# Response: {"status":"Backend is running","port":5000,"database":"✅ Connected"}
```

## 🔐 Test Credentials

| Role | ID | Password |
|------|----|----|
| Admin | - | `admin123` |
| Voter | `V001` | `pass123` |
| Party | `P001` | `pass123` |
| Constituency | `C001` | `pass123` |

## 📁 Project Structure

```
voting-system/
├── backend/
│   ├── models/
│   │   ├── Voter.js
│   │   ├── Candidate.js
│   │   ├── Party.js
│   │   ├── Constituency.js
│   │   ├── ElectionStatus.js
│   │   └── VotingAnalytics.js
│   ├── routes/
│   │   ├── voter.js
│   │   ├── admin.js
│   │   ├── party.js
│   │   ├── constituency.js
│   │   ├── candidateRoutes.js
│   │   └── analytics.js
│   ├── server.js
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AdminPage.js
│   │   │   ├── VoterDashboard.js
│   │   │   ├── BallotPaper.js
│   │   │   ├── ResultsPage.js
│   │   │   ├── PartyPage.js
│   │   │   ├── ConstituencyAdmin.js
│   │   │   └── EditProfile.js
│   │   ├── components/
│   │   │   └── Modal.js
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── styles/
│   │   ├── App.js
│   │   ├── Login.js
│   │   └── index.js
│   ├── .env
│   └── package.json
│
└── Documentation/
    ├── START_HERE.md
    ├── GETTING_STARTED.md
    ├── QUICK_START.md
    ├── SETUP_GUIDE.md
    ├── API_DOCUMENTATION.md
    ├── ARCHITECTURE.md
    └── FEATURES_AND_CAPABILITIES.md
```

## 🔌 API Endpoints

### Authentication
- `POST /login` - User login

### Voter Routes
- `GET /voter/:voter_id` - Get voter details
- `PUT /voter/:voter_id` - Update voter profile
- `GET /voter/ballot/:voterId` - Get ballot
- `GET /voter/history/:voter_id` - Get voting history
- `POST /voter/vote` - Cast vote

### Admin Routes
- `POST /admin/add-voter` - Add voter
- `POST /admin/add-candidate` - Add candidate
- `POST /admin/add-party` - Add party
- `POST /admin/add-constituency` - Add constituency
- `POST /admin/reset-votes` - Reset votes
- `POST /admin/publish-results` - Publish results
- `GET /admin/results` - Get results
- `GET /admin/election-status` - Get election status

### Analytics Routes
- `GET /analytics/dashboard` - Overall statistics
- `GET /analytics/constituency/:id` - Constituency analytics
- `GET /analytics/party/:id` - Party analytics
- `GET /analytics/live-updates` - Live updates

### Other Routes
- `GET /health` - Health check
- `GET /db-status` - Database status
- `GET /party/:id` - Get party info
- `GET /candidates/:constituencyId` - Get candidates
- `GET /constituency/:id` - Get constituency info

## 🔒 Security Features

- ✅ Password-based authentication
- ✅ Session management
- ✅ Role-based access control
- ✅ Data validation and sanitization
- ✅ CORS protection
- ✅ Vote timestamp recording
- ✅ Voter verification system
- ✅ Login tracking

## 📊 Database Models

### Voter
- voter_id, first_name, last_name, password
- address, phone, email, age, gender
- constituency, has_voted, voted_candidate_id
- vote_timestamp, is_verified, created_at, last_login

### Candidate
- candidate_id, name, age, education, experience
- bio, image_url, party_id, constituency
- votes, vote_percentage, created_at

### Party
- party_id, name, password, symbol, color
- description, founded_year, total_votes, created_at

### Constituency
- constituency_id, name, password

### ElectionStatus
- conducted, resultsPublished

### VotingAnalytics
- constituency_id, total_voters, total_votes_cast
- voter_turnout_percentage, votes_by_party, votes_by_candidate
- gender_distribution, age_distribution, peak_voting_time

## 🛠️ Technology Stack

### Frontend
- React
- React Router
- Axios
- Bootstrap
- React Bootstrap

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- CORS
- dotenv

### Database
- MongoDB Atlas (Cloud)

## 🧪 Testing

### Test Admin Functions
1. Login as Admin (password: `admin123`)
2. Add voters, parties, candidates
3. View admin dashboard

### Test Voter Voting
1. Login as Voter (ID: `V001`, password: `pass123`)
2. View profile
3. Click "Vote Now"
4. Select a candidate
5. Confirm vote

### Test Results
1. Admin publishes results
2. View results page
3. Check winner determination

### Test Analytics
1. Access analytics dashboard
2. View voter turnout
3. Check demographic distribution

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check MongoDB connection
# Verify .env file
# Check port 5000 availability
cd backend
npm install
npm start
```

### Frontend Can't Connect
```bash
# Verify backend is running on port 5000
# Check frontend/.env API URL
# Restart frontend
cd frontend
npm start
```

### MongoDB Connection Failed
- Check MongoDB Atlas network access
- Verify connection string in `.env`
- Check username and password
- Verify database name

## 📝 Configuration

### Backend (.env)
```
PORT=5000
NODE_ENV=development
LOCAL_MONGO_URI=mongodb://localhost:27017/voting_system
MONGODB_URI=mongodb+srv://rabibhagat:1r2a3b4i123@cluster0.grzsv45.mongodb.net/voting_system?retryWrites=true&w=majority&appName=Cluster0
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
```

## 📚 Documentation

- **START_HERE.md** - Quick start guide
- **GETTING_STARTED.md** - Getting started
- **QUICK_START.md** - 5-minute reference
- **SETUP_GUIDE.md** - Detailed setup
- **API_DOCUMENTATION.md** - API reference
- **ARCHITECTURE.md** - System design
- **FEATURES_AND_CAPABILITIES.md** - Complete features

## 🎯 User Roles & Permissions

### Admin
- ✅ Full system access
- ✅ Add/Edit/Delete all entities
- ✅ Reset votes
- ✅ Publish results
- ✅ View analytics

### Voter
- ✅ View profile
- ✅ Edit profile
- ✅ View ballot
- ✅ Cast vote
- ✅ View results

### Party
- ✅ View party information
- ✅ View candidates

### Constituency Admin
- ✅ View constituency information
- ✅ View candidates and votes

## 🚀 Deployment

### Local Deployment
```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend
cd frontend && npm start
```

### Production Deployment
1. Set `NODE_ENV=production` in backend/.env
2. Use MongoDB Atlas connection string
3. Deploy backend to server (Heroku, AWS, etc.)
4. Deploy frontend to CDN (Netlify, Vercel, etc.)

## 📊 System Status

| Component | Status |
|-----------|--------|
| Backend | ✅ Ready |
| Frontend | ✅ Ready |
| Database | ✅ Connected |
| API | ✅ Working |
| Analytics | ✅ Implemented |
| Security | ✅ Configured |

## 🎉 Key Highlights

✨ **Complete Voting Solution** - End-to-end system  
✨ **Real-Time Analytics** - Live statistics  
✨ **Multi-Role System** - Different access levels  
✨ **Secure & Reliable** - Data validation  
✨ **Scalable Architecture** - Cloud-ready  
✨ **User-Friendly Interface** - Intuitive UI  
✨ **Well Documented** - Comprehensive guides  
✨ **Production Ready** - Ready to deploy  

## 📞 Support

For issues or questions:
1. Check documentation files
2. Review API documentation
3. Check system architecture
4. Verify configuration

## 📄 License

This project is open source and available under the MIT License.

---

**Version:** 2.0  
**Last Updated:** January 2026  
**Status:** ✅ Production Ready  

🗳️ **Happy Voting!**
