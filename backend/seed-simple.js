// Simple seed script with better error handling
require("dotenv").config();
const mongoose = require("mongoose");

// Simple test data
const testVoter = {
  voter_id: "V001",
  first_name: "John",
  last_name: "Doe",
  password: "password123",
  address: "Test Address",
  phone: "1234567890",
  constituency: "C001",
  has_voted: false,
  voted_candidate_id: null,
};

const testParty = {
  party_id: "P001",
  name: "Democratic Party",
  password: "party001"
};

const testConstituency = {
  constituency_id: "C001",
  name: "Test Constituency",
  password: "const001"
};

const testCandidate = {
  candidate_id: "CD001",
  name: "Test Candidate",
  constituency: "C001",
  party_id: "P001",
  votes: 0
};

async function seedSimple() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    console.log("Connection string:", process.env.MONGO_URI ? "Found" : "NOT FOUND");
    
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log("✅ Connected to MongoDB");
    const db = mongoose.connection.db;

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    try {
      await db.collection("voters").deleteMany({});
      await db.collection("parties").deleteMany({});
      await db.collection("candidates").deleteMany({});
      await db.collection("constituencies").deleteMany({});
      await db.collection("electionstatuses").deleteMany({});
      console.log("✅ Cleared existing data");
    } catch (err) {
      console.log("⚠️  Warning: Could not clear data:", err.message);
    }

    // Insert one by one with error handling
    console.log("\n📝 Inserting test data...");
    
    try {
      await db.collection("constituencies").insertOne(testConstituency);
      console.log("✅ Inserted constituency");
    } catch (err) {
      console.log("❌ Failed to insert constituency:", err.message);
    }

    try {
      await db.collection("parties").insertOne(testParty);
      console.log("✅ Inserted party");
    } catch (err) {
      console.log("❌ Failed to insert party:", err.message);
    }

    try {
      await db.collection("voters").insertOne(testVoter);
      console.log("✅ Inserted voter");
    } catch (err) {
      console.log("❌ Failed to insert voter:", err.message);
    }

    try {
      await db.collection("candidates").insertOne(testCandidate);
      console.log("✅ Inserted candidate");
    } catch (err) {
      console.log("❌ Failed to insert candidate:", err.message);
    }

    try {
      await db.collection("electionstatuses").insertOne({
        conducted: false,
        resultsPublished: false
      });
      console.log("✅ Initialized election status");
    } catch (err) {
      console.log("❌ Failed to insert election status:", err.message);
    }

    // Verify data
    console.log("\n🔍 Verifying inserted data...");
    const voterCount = await db.collection("voters").countDocuments();
    const partyCount = await db.collection("parties").countDocuments();
    const candidateCount = await db.collection("candidates").countDocuments();
    const constituencyCount = await db.collection("constituencies").countDocuments();

    console.log(`Voters: ${voterCount}`);
    console.log(`Parties: ${partyCount}`);
    console.log(`Candidates: ${candidateCount}`);
    console.log(`Constituencies: ${constituencyCount}`);

    if (voterCount > 0) {
      console.log("\n🎉 Seeding completed successfully!");
      console.log("\n📋 Test Credentials:");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("👤 VOTER:");
      console.log("   Voter ID: V001");
      console.log("   First Name: John");
      console.log("   Last Name: Doe");
      console.log("   Password: password123");
      console.log("\n🏛️  PARTY:");
      console.log("   Party ID: P001");
      console.log("   Password: party001");
      console.log("\n🏢 CONSTITUENCY:");
      console.log("   Constituency ID: C001");
      console.log("   Password: const001");
      console.log("\n👨‍💼 ADMIN:");
      console.log("   Password: admin123");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    } else {
      console.log("\n⚠️  Warning: No data was inserted!");
    }

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Seeding failed:");
    console.error("Error:", err.message);
    console.error("\nPossible causes:");
    console.error("1. MongoDB Atlas IP whitelist - Add your IP address");
    console.error("2. Network connection issue");
    console.error("3. Invalid connection string");
    console.error("\nTo fix:");
    console.error("1. Go to MongoDB Atlas → Network Access");
    console.error("2. Click 'Add IP Address'");
    console.error("3. Click 'Allow Access from Anywhere' (0.0.0.0/0)");
    console.error("4. Save and try again");
    process.exit(1);
  }
}

seedSimple();
