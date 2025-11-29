// Test authentication functions
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

async function testAuth() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");
    
    const db = mongoose.connection.db;

    // Test 1: Check if voters exist
    console.log("📋 Test 1: Checking voters...");
    const voters = await db.collection("voters").find().limit(3).toArray();
    console.log(`Found ${voters.length} voters`);
    if (voters.length > 0) {
      console.log("Sample voter:", {
        voter_id: voters[0].voter_id,
        first_name: voters[0].first_name,
        last_name: voters[0].last_name,
        password_hash: voters[0].password.substring(0, 20) + "..."
      });
    }
    console.log("✅ Voters check complete\n");

    // Test 2: Check if candidates exist
    console.log("📋 Test 2: Checking candidates...");
    const candidates = await db.collection("candidates").find().limit(3).toArray();
    console.log(`Found ${candidates.length} candidates`);
    if (candidates.length > 0) {
      console.log("Sample candidate:", {
        candidate_id: candidates[0].candidate_id,
        name: candidates[0].name,
        approved: candidates[0].approved,
        password_hash: candidates[0].password.substring(0, 20) + "..."
      });
    }
    console.log("✅ Candidates check complete\n");

    // Test 3: Check if parties exist
    console.log("📋 Test 3: Checking parties...");
    const parties = await db.collection("parties").find().toArray();
    console.log(`Found ${parties.length} parties`);
    if (parties.length > 0) {
      console.log("Sample party:", {
        party_id: parties[0].party_id,
        name: parties[0].name,
        password: parties[0].password
      });
    }
    console.log("✅ Parties check complete\n");

    // Test 4: Test password verification for voter
    console.log("📋 Test 4: Testing voter password verification...");
    if (voters.length > 0) {
      const testVoter = voters[0];
      const plainPassword = "password123"; // V001's password
      const isValid = await bcrypt.compare(plainPassword, testVoter.password);
      console.log(`Password verification for V001: ${isValid ? "✅ PASS" : "❌ FAIL"}`);
      
      // Test wrong password
      const wrongPassword = "wrongpass";
      const isInvalid = await bcrypt.compare(wrongPassword, testVoter.password);
      console.log(`Wrong password test: ${!isInvalid ? "✅ PASS (correctly rejected)" : "❌ FAIL"}`);
    }
    console.log("✅ Password verification test complete\n");

    // Test 5: Test password verification for candidate
    console.log("📋 Test 5: Testing candidate password verification...");
    if (candidates.length > 0) {
      const testCandidate = candidates[0];
      const plainPassword = "cand001"; // CD001's password
      const isValid = await bcrypt.compare(plainPassword, testCandidate.password);
      console.log(`Password verification for CD001: ${isValid ? "✅ PASS" : "❌ FAIL"}`);
    }
    console.log("✅ Candidate password verification test complete\n");

    // Test 6: Check admin credentials
    console.log("📋 Test 6: Checking admin credentials...");
    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    console.log(`Admin username: ${adminUsername}`);
    console.log(`Admin password: ${adminPassword}`);
    console.log("✅ Admin credentials check complete\n");

    console.log("🎉 All tests completed!\n");
    console.log("=" .repeat(60));
    console.log("TEST CREDENTIALS TO USE:");
    console.log("=" .repeat(60));
    console.log("\n👤 VOTER LOGIN:");
    console.log("   Voter ID: V001");
    console.log("   First Name: John");
    console.log("   Last Name: Doe");
    console.log("   Password: password123");
    console.log("\n🎯 CANDIDATE LOGIN:");
    console.log("   Candidate ID: CD001");
    console.log("   Password: cand001");
    console.log("\n🏛️  PARTY LOGIN:");
    console.log("   Party ID: P001");
    console.log("   Password: party001");
    console.log("\n🔐 ADMIN LOGIN:");
    console.log(`   Username: ${adminUsername}`);
    console.log(`   Password: ${adminPassword}`);
    console.log("=" .repeat(60) + "\n");

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
    process.exit(0);
  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exit(1);
  }
}

testAuth();
