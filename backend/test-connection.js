// Test MongoDB connection
require("dotenv").config();
const mongoose = require("mongoose");

async function testConnection() {
  try {
    console.log("🔄 Testing MongoDB connection...");
    console.log("MONGO_URI exists:", !!process.env.MONGO_URI);
    
    if (!process.env.MONGO_URI) {
      console.log("❌ MONGO_URI not found in .env file");
      process.exit(1);
    }

    // Show partial connection string (hide password)
    const uriParts = process.env.MONGO_URI.split("@");
    if (uriParts.length > 1) {
      console.log("Connecting to:", "mongodb+srv://***@" + uriParts[1]);
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("✅ Successfully connected to MongoDB!");
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log("\n📊 Existing collections:");
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });

    // Count documents in each collection
    console.log("\n📈 Document counts:");
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`  ${col.name}: ${count} documents`);
    }

    // Try to find a voter
    console.log("\n🔍 Checking for test voter (V001)...");
    const voter = await db.collection("voters").findOne({ voter_id: "V001" });
    if (voter) {
      console.log("✅ Found voter:", {
        voter_id: voter.voter_id,
        first_name: voter.first_name,
        last_name: voter.last_name,
        constituency: voter.constituency
      });
    } else {
      console.log("❌ Voter V001 not found - database needs seeding");
    }

    await mongoose.disconnect();
    console.log("\n✅ Connection test completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Connection test failed:");
    console.error("Error:", err.message);
    
    if (err.message.includes("ECONNRESET") || err.message.includes("timeout")) {
      console.error("\n🔧 Network/IP Whitelist Issue Detected!");
      console.error("\nTo fix this:");
      console.error("1. Go to: https://cloud.mongodb.com");
      console.error("2. Select your project: 'Voting'");
      console.error("3. Click 'Network Access' in left sidebar");
      console.error("4. Click 'Add IP Address' button");
      console.error("5. Click 'Allow Access from Anywhere' (0.0.0.0/0)");
      console.error("6. Click 'Confirm'");
      console.error("7. Wait 1-2 minutes for changes to apply");
      console.error("8. Run this test again");
    }
    
    process.exit(1);
  }
}

testConnection();
