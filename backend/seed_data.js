// backend/seed_data.js
// Script to seed the database with test data
// Run with: node seed_data.js

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Voter = require("./models/Voter");
const Candidate = require("./models/Candidate");
const Party = require("./models/Party");
const Constituency = require("./models/Constituency");
const ElectionStatus = require("./models/ElectionStatus");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI not found in environment variables");
    }

    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    console.log("\n📊 Starting data seeding...\n");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await Voter.deleteMany({});
    await Candidate.deleteMany({});
    await Party.deleteMany({});
    await Constituency.deleteMany({});
    await ElectionStatus.deleteMany({});
    console.log("✅ Data cleared\n");

    // Generate standard hashed password
    const hashedPass123 = await bcrypt.hash("pass123", 10);

    // ============================================
    // SEED CONSTITUENCIES
    // ============================================
    console.log("📍 Adding constituencies...");
    const constituencies = [
      { constituency_id: "C001", name: "North District", password: hashedPass123 },
      { constituency_id: "C002", name: "South District", password: hashedPass123 },
      { constituency_id: "C003", name: "East District", password: hashedPass123 },
      { constituency_id: "C004", name: "West District", password: hashedPass123 },
      { constituency_id: "C005", name: "Central District", password: hashedPass123 }
    ];

    await Constituency.insertMany(constituencies);
    console.log(`✅ Added ${constituencies.length} constituencies\n`);

    // ============================================
    // SEED PARTIES
    // ============================================
    console.log("🏛️  Adding parties...");
    const parties = [
      {
        party_id: "P001",
        name: "Democratic Alliance",
        password: hashedPass123,
        symbol: "🦁",
        color: "#FF6B6B",
        description: "Progressive and inclusive party",
        founded_year: 2010
      },
      {
        party_id: "P002",
        name: "National Unity Party",
        password: hashedPass123,
        symbol: "🛡️",
        color: "#4ECDC4",
        description: "Unity and development focused",
        founded_year: 2008
      },
      {
        party_id: "P003",
        name: "People's Movement",
        password: hashedPass123,
        symbol: "✊",
        color: "#FFE66D",
        description: "Grassroots and community driven",
        founded_year: 2015
      },
      {
        party_id: "P004",
        name: "Future Forward",
        password: hashedPass123,
        symbol: "🚀",
        color: "#95E1D3",
        description: "Innovation and progress",
        founded_year: 2018
      }
    ];

    await Party.insertMany(parties);
    console.log(`✅ Added ${parties.length} parties\n`);

    // ============================================
    // SEED CANDIDATES
    // ============================================
    console.log("👥 Adding candidates...");
    const candidates = [
      // North District (C001)
      {
        candidate_id: "CAN001",
        name: "Rajesh Kumar",
        age: 45,
        education: "B.Tech, MBA",
        experience: "15 years in public service",
        bio: "Experienced administrator with focus on infrastructure",
        party_id: "P001",
        constituency: "C001",
        votes: 0
      },
      {
        candidate_id: "CAN002",
        name: "Priya Singh",
        age: 38,
        education: "M.A. Political Science",
        experience: "12 years in social work",
        bio: "Community leader and social activist",
        party_id: "P002",
        constituency: "C001",
        votes: 0
      },
      {
        candidate_id: "CAN003",
        name: "Amit Patel",
        age: 42,
        education: "B.Com, CA",
        experience: "18 years in finance",
        bio: "Financial expert and business leader",
        party_id: "P003",
        constituency: "C001",
        votes: 0
      },

      // South District (C002)
      {
        candidate_id: "CAN004",
        name: "Deepak Sharma",
        age: 50,
        education: "B.Sc, M.Tech",
        experience: "20 years in engineering",
        bio: "Infrastructure and development specialist",
        party_id: "P001",
        constituency: "C002",
        votes: 0
      },
      {
        candidate_id: "CAN005",
        name: "Neha Gupta",
        age: 35,
        education: "M.D., Public Health",
        experience: "10 years in healthcare",
        bio: "Healthcare advocate and medical professional",
        party_id: "P002",
        constituency: "C002",
        votes: 0
      },
      {
        candidate_id: "CAN006",
        name: "Vikram Reddy",
        age: 48,
        education: "B.A., Law",
        experience: "16 years in legal practice",
        bio: "Legal expert and justice advocate",
        party_id: "P004",
        constituency: "C002",
        votes: 0
      },

      // East District (C003)
      {
        candidate_id: "CAN007",
        name: "Ananya Desai",
        age: 40,
        education: "B.E., MBA",
        experience: "14 years in technology",
        bio: "Tech entrepreneur and innovation leader",
        party_id: "P003",
        constituency: "C003",
        votes: 0
      },
      {
        candidate_id: "CAN008",
        name: "Suresh Nair",
        age: 55,
        education: "M.A., Economics",
        experience: "25 years in governance",
        bio: "Senior administrator with economic expertise",
        party_id: "P001",
        constituency: "C003",
        votes: 0
      },
      {
        candidate_id: "CAN009",
        name: "Meera Iyer",
        age: 36,
        education: "B.Sc, M.Sc",
        experience: "11 years in education",
        bio: "Education reformer and academic leader",
        party_id: "P002",
        constituency: "C003",
        votes: 0
      },

      // West District (C004)
      {
        candidate_id: "CAN010",
        name: "Arjun Verma",
        age: 43,
        education: "B.Tech, MBA",
        experience: "13 years in business",
        bio: "Entrepreneur and business development expert",
        party_id: "P004",
        constituency: "C004",
        votes: 0
      },
      {
        candidate_id: "CAN011",
        name: "Divya Kapoor",
        age: 39,
        education: "M.A., Sociology",
        experience: "12 years in social development",
        bio: "Social development and community welfare advocate",
        party_id: "P003",
        constituency: "C004",
        votes: 0
      },
      {
        candidate_id: "CAN012",
        name: "Rohan Bhat",
        age: 46,
        education: "B.Sc, M.Tech",
        experience: "17 years in agriculture",
        bio: "Agricultural expert and rural development specialist",
        party_id: "P001",
        constituency: "C004",
        votes: 0
      },

      // Central District (C005)
      {
        candidate_id: "CAN013",
        name: "Sanjana Rao",
        age: 41,
        education: "B.A., Journalism",
        experience: "13 years in media",
        bio: "Media professional and communication expert",
        party_id: "P002",
        constituency: "C005",
        votes: 0
      },
      {
        candidate_id: "CAN014",
        name: "Nikhil Joshi",
        age: 37,
        education: "B.Com, CA",
        experience: "11 years in finance",
        bio: "Financial advisor and economic policy expert",
        party_id: "P004",
        constituency: "C005",
        votes: 0
      },
      {
        candidate_id: "CAN015",
        name: "Kavya Menon",
        age: 44,
        education: "M.A., Environmental Science",
        experience: "15 years in environmental protection",
        bio: "Environmental activist and sustainability leader",
        party_id: "P003",
        constituency: "C005",
        votes: 0
      }
    ];

    // Map over candidates to add the hashed password since it's not defined in the array
    const hashedCandidates = candidates.map(c => ({...c, password: hashedPass123, approved: true}));

    await Candidate.insertMany(hashedCandidates);
    console.log(`✅ Added ${candidates.length} candidates\n`);

    // ============================================
    // SEED VOTERS
    // ============================================
    console.log("🗳️  Adding voters...");
    const voters = [];
    const firstNames = ["Rajesh", "Priya", "Amit", "Deepak", "Neha", "Vikram", "Ananya", "Suresh", "Meera", "Arjun"];
    const lastNames = ["Kumar", "Singh", "Patel", "Sharma", "Gupta", "Reddy", "Desai", "Nair", "Iyer", "Verma"];
    const genders = ["Male", "Female", "Other"];

    let voterId = 1;
    for (let c = 0; c < constituencies.length; c++) {
      const constituency = constituencies[c].constituency_id;
      // Add 20 voters per constituency
      for (let v = 0; v < 20; v++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const gender = genders[Math.floor(Math.random() * genders.length)];
        const age = Math.floor(Math.random() * (70 - 18 + 1)) + 18;

        voters.push({
          voter_id: `V${String(voterId).padStart(4, "0")}`,
          first_name: firstName,
          last_name: lastName,
          password: hashedPass123,
          email: `voter${voterId}@example.com`,
          phone: `98${String(Math.floor(Math.random() * 100000000)).padStart(8, "0")}`,
          address: `Address ${voterId}, ${constituencies[c].name}`,
          age,
          gender,
          constituency,
          has_voted: false,
          is_verified: true,
          created_at: new Date()
        });
        voterId++;
      }
    }

    await Voter.insertMany(voters);
    console.log(`✅ Added ${voters.length} voters\n`);

    // ============================================
    // SEED ELECTION STATUS
    // ============================================
    console.log("📋 Setting election status...");
    await ElectionStatus.create({
      conducted: false,
      resultsPublished: false
    });
    console.log("✅ Election status initialized\n");

    console.log("🎉 Data seeding completed successfully!\n");
    console.log("📊 Summary:");
    console.log(`   - Constituencies: ${constituencies.length}`);
    console.log(`   - Parties: ${parties.length}`);
    console.log(`   - Candidates: ${candidates.length}`);
    console.log(`   - Voters: ${voters.length}`);
    console.log("\n🔐 Test Credentials:");
    console.log("   - Admin: admin123");
    console.log("   - Voter: V0001 / pass123");
    console.log("   - Party: P001 / pass123");
    console.log("   - Constituency: C001 / pass123");
    console.log("\n✨ Ready to start voting!\n");

  } catch (error) {
    console.error("❌ Error seeding data:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Database connection closed\n");
  }
};

// Run seeding
connectDB().then(() => seedData());
