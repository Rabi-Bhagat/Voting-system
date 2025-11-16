// Test login functionality
require("dotenv").config();
const mongoose = require("mongoose");

async function testLogin() {
  try {
    console.log("🔄 Testing login functionality...\n");
    
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;

    // Test 1: Voter Login
    console.log("TEST 1: Voter Login");
    console.log("Looking for voter with:");
    console.log("  voter_id: V001");
    console.log("  first_name: John");
    console.log("  last_name: Doe");
    
    const voter = await db.collection("voters").findOne({
      voter_id: "V001",
      first_name: "John",
      last_name: "Doe"
    });

    if (voter) {
      console.log("✅ Voter found!");
      console.log("  Password in DB:", voter.password);
      console.log("  Expected password: password123");
      console.log("  Match:", voter.password === "password123" ? "✅ YES" : "❌ NO");
    } else {
      console.log("❌ Voter NOT found!");
    }

    // Test 2: Party Login
    console.log("\nTEST 2: Party Login");
    console.log("Looking for party with:");
    console.log("  party_id: P001");
    
    const party = await db.collection("parties").findOne({ party_id: "P001" });
    
    if (party) {
      console.log("✅ Party found!");
      console.log("  Name:", party.name);
      console.log("  Password in DB:", party.password);
      console.log("  Expected password: party001");
      console.log("  Match:", party.password === "party001" ? "✅ YES" : "❌ NO");
    } else {
      console.log("❌ Party NOT found!");
    }

    // Test 3: Constituency Login
    console.log("\nTEST 3: Constituency Login");
    console.log("Looking for constituency with:");
    console.log("  constituency_id: C001");
    
    const constituency = await db.collection("constituencies").findOne({ constituency_id: "C001" });
    
    if (constituency) {
      console.log("✅ Constituency found!");
      console.log("  Name:", constituency.name);
      console.log("  Password in DB:", constituency.password);
      console.log("  Expected password: const001");
      console.log("  Match:", constituency.password === "const001" ? "✅ YES" : "❌ NO");
    } else {
      console.log("❌ Constituency NOT found!");
    }

    // Test 4: Check constituency reference
    console.log("\nTEST 4: Constituency Reference Check");
    const voterConstituency = voter ? voter.constituency : null;
    console.log("  Voter's constituency:", voterConstituency);
    
    if (voterConstituency) {
      const constExists = await db.collection("constituencies").findOne({ constituency_id: voterConstituency });
      if (constExists) {
        console.log("✅ Constituency exists:", constExists.name);
      } else {
        console.log("❌ Constituency does NOT exist in database!");
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("SUMMARY:");
    console.log("=".repeat(50));
    
    if (voter && voter.password === "password123" && constituency) {
      console.log("✅ ALL TESTS PASSED!");
      console.log("\nYou can now login with:");
      console.log("  Voter ID: V001");
      console.log("  First Name: John");
      console.log("  Last Name: Doe");
      console.log("  Password: password123");
    } else {
      console.log("❌ SOME TESTS FAILED!");
      console.log("\nPlease run: node seed.js");
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exit(1);
  }
}

testLogin();
