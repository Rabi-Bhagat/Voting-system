// Debug login issues
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

async function debugLogin() {
  try {
    console.log("\n" + "=".repeat(70));
    console.log("🔍 DEBUGGING LOGIN ISSUES");
    console.log("=".repeat(70) + "\n");

    console.log("📋 Step 1: Checking environment variables...");
    console.log(`   MONGO_URI: ${process.env.MONGO_URI ? "✅ Set" : "❌ Not set"}`);
    console.log(`   ADMIN_USERNAME: ${process.env.ADMIN_USERNAME || "admin"}`);
    console.log(`   ADMIN_PASSWORD: ${process.env.ADMIN_PASSWORD || "NOT SET"}`);
    console.log("");

    console.log("📋 Step 2: Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("   ✅ Connected to MongoDB\n");
    
    const db = mongoose.connection.db;

    // Check voters
    console.log("📋 Step 3: Checking voters collection...");
    const voterCount = await db.collection("voters").countDocuments();
    console.log(`   Total voters: ${voterCount}`);
    
    if (voterCount === 0) {
      console.log("   ❌ NO VOTERS FOUND!");
      console.log("   🔧 Solution: Run 'npm run seed' to populate database\n");
    } else {
      const voter = await db.collection("voters").findOne({ voter_id: "V001" });
      if (voter) {
        console.log("   ✅ Found V001:");
        console.log(`      - Voter ID: ${voter.voter_id}`);
        console.log(`      - First Name: ${voter.first_name}`);
        console.log(`      - Last Name: ${voter.last_name}`);
        console.log(`      - Password Hash: ${voter.password ? voter.password.substring(0, 30) + "..." : "❌ NO PASSWORD"}`);
        console.log(`      - Hash starts with $2b$: ${voter.password && voter.password.startsWith("$2b$") ? "✅ Yes (bcrypt)" : "❌ No (plain text)"}`);
        
        // Test password
        console.log("\n   🔐 Testing password 'password123'...");
        if (voter.password) {
          if (voter.password.startsWith("$2b$")) {
            const isValid = await bcrypt.compare("password123", voter.password);
            console.log(`      Result: ${isValid ? "✅ VALID" : "❌ INVALID"}`);
            if (!isValid) {
              console.log("      ⚠️  Password doesn't match! Database may not be seeded correctly.");
            }
          } else {
            console.log("      ❌ Password is NOT hashed! Run 'npm run seed' to fix.");
          }
        } else {
          console.log("      ❌ No password field found!");
        }
      } else {
        console.log("   ❌ V001 not found!");
        console.log("   🔧 Solution: Run 'npm run seed' to create test users\n");
      }
    }
    console.log("");

    // Check candidates
    console.log("📋 Step 4: Checking candidates collection...");
    const candidateCount = await db.collection("candidates").countDocuments();
    console.log(`   Total candidates: ${candidateCount}`);
    
    if (candidateCount === 0) {
      console.log("   ❌ NO CANDIDATES FOUND!");
      console.log("   🔧 Solution: Run 'npm run seed' to populate database\n");
    } else {
      const candidate = await db.collection("candidates").findOne({ candidate_id: "CD001" });
      if (candidate) {
        console.log("   ✅ Found CD001:");
        console.log(`      - Candidate ID: ${candidate.candidate_id}`);
        console.log(`      - Name: ${candidate.name}`);
        console.log(`      - Approved: ${candidate.approved ? "✅ Yes" : "❌ No"}`);
        console.log(`      - Password Hash: ${candidate.password ? candidate.password.substring(0, 30) + "..." : "❌ NO PASSWORD"}`);
        console.log(`      - Hash starts with $2b$: ${candidate.password && candidate.password.startsWith("$2b$") ? "✅ Yes (bcrypt)" : "❌ No (plain text)"}`);
        
        // Test password
        console.log("\n   🔐 Testing password 'cand001'...");
        if (candidate.password) {
          if (candidate.password.startsWith("$2b$")) {
            const isValid = await bcrypt.compare("cand001", candidate.password);
            console.log(`      Result: ${isValid ? "✅ VALID" : "❌ INVALID"}`);
            if (!isValid) {
              console.log("      ⚠️  Password doesn't match! Database may not be seeded correctly.");
            }
          } else {
            console.log("      ❌ Password is NOT hashed! Run 'npm run seed' to fix.");
          }
        } else {
          console.log("      ❌ No password field found!");
        }
      } else {
        console.log("   ❌ CD001 not found!");
        console.log("   🔧 Solution: Run 'npm run seed' to create test users\n");
      }
    }
    console.log("");

    // Check parties
    console.log("📋 Step 5: Checking parties collection...");
    const partyCount = await db.collection("parties").countDocuments();
    console.log(`   Total parties: ${partyCount}`);
    
    if (partyCount === 0) {
      console.log("   ❌ NO PARTIES FOUND!");
      console.log("   🔧 Solution: Run 'npm run seed' to populate database\n");
    } else {
      const party = await db.collection("parties").findOne({ party_id: "P001" });
      if (party) {
        console.log("   ✅ Found P001:");
        console.log(`      - Party ID: ${party.party_id}`);
        console.log(`      - Name: ${party.name}`);
        console.log(`      - Password: ${party.password} (plain text - OK for parties)`);
      }
    }
    console.log("");

    // Summary
    console.log("=".repeat(70));
    console.log("📊 SUMMARY");
    console.log("=".repeat(70));
    
    const issues = [];
    
    if (voterCount === 0) issues.push("❌ No voters in database");
    if (candidateCount === 0) issues.push("❌ No candidates in database");
    if (partyCount === 0) issues.push("❌ No parties in database");
    
    const voter = await db.collection("voters").findOne({ voter_id: "V001" });
    if (voter && voter.password && !voter.password.startsWith("$2b$")) {
      issues.push("❌ Voter passwords are not hashed");
    }
    
    const candidate = await db.collection("candidates").findOne({ candidate_id: "CD001" });
    if (candidate && candidate.password && !candidate.password.startsWith("$2b$")) {
      issues.push("❌ Candidate passwords are not hashed");
    }
    
    if (issues.length > 0) {
      console.log("\n⚠️  ISSUES FOUND:");
      issues.forEach(issue => console.log(`   ${issue}`));
      console.log("\n🔧 SOLUTION:");
      console.log("   Run these commands:");
      console.log("   1. npm run seed");
      console.log("   2. npm start");
      console.log("   3. Try login again\n");
    } else {
      console.log("\n✅ ALL CHECKS PASSED!");
      console.log("\n📋 TEST CREDENTIALS:");
      console.log("   Voter: V001 / John / Doe / password123");
      console.log("   Candidate: CD001 / cand001");
      console.log("   Party: P001 / party001");
      console.log("   Admin: admin / admin@12345\n");
    }
    
    console.log("=".repeat(70) + "\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("\n❌ ERROR:", err.message);
    console.error("\n🔧 Check your .env file and MongoDB connection\n");
    process.exit(1);
  }
}

debugLogin();
