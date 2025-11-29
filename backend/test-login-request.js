// Test login request directly
require("dotenv").config();
const axios = require("axios");

const API_BASE = "http://localhost:5000";

function handleError(err, testName) {
  console.log("   ❌ FAILED!");
  if (err.code === 'ECONNREFUSED') {
    console.log("   ⚠️  Backend is NOT running!");
    console.log("   💡 Solution: Open another terminal and run:");
    console.log("      cd backend");
    console.log("      npm start");
    return false;
  } else if (err.response) {
    console.log("   Error:", err.response.data?.error || err.response.statusText);
    console.log("   Status:", err.response.status);
  } else {
    console.log("   Error:", err.message);
    console.log("   Code:", err.code);
  }
  return true;
}

async function testLogin() {
  console.log("\n" + "=".repeat(70));
  console.log("🧪 TESTING LOGIN REQUESTS");
  console.log("=".repeat(70) + "\n");

  console.log("⚠️  Make sure backend is running on port 5000!\n");

  let backendRunning = true;

  // Test 1: Voter Login
  console.log("📋 Test 1: Voter Login");
  console.log("   Sending: V001 / John / Doe / password123");
  try {
    const res = await axios.post(`${API_BASE}/login`, {
      voter_id: "V001",
      first_name: "John",
      last_name: "Doe",
      password: "password123",
      role: "voter"
    });
    console.log("   ✅ SUCCESS!");
    console.log("   Response:", {
      success: res.data.success,
      role: res.data.role,
      redirect: res.data.redirect,
      voter_id: res.data.voter?.voter_id
    });
  } catch (err) {
    backendRunning = handleError(err, "Voter Login");
    if (!backendRunning) {
      console.log("\n" + "=".repeat(70));
      console.log("❌ BACKEND NOT RUNNING - Cannot continue tests");
      console.log("=".repeat(70) + "\n");
      process.exit(1);
    }
  }
  console.log("");

  // Test 2: Admin Login
  console.log("📋 Test 2: Admin Login");
  console.log("   Sending: admin / admin@12345");
  try {
    const res = await axios.post(`${API_BASE}/login`, {
      username: "admin",
      password: "admin@12345",
      role: "admin"
    });
    console.log("   ✅ SUCCESS!");
    console.log("   Response:", {
      success: res.data.success,
      role: res.data.role,
      redirect: res.data.redirect
    });
  } catch (err) {
    handleError(err, "Admin Login");
  }
  console.log("");

  // Test 3: Candidate Login
  console.log("📋 Test 3: Candidate Login");
  console.log("   Sending: CD001 / cand001");
  try {
    const res = await axios.post(`${API_BASE}/login`, {
      candidate_id: "CD001",
      password: "cand001",
      role: "candidate"
    });
    console.log("   ✅ SUCCESS!");
    console.log("   Response:", {
      success: res.data.success,
      role: res.data.role,
      redirect: res.data.redirect,
      candidate_id: res.data.candidate?.candidate_id
    });
  } catch (err) {
    handleError(err, "Candidate Login");
  }
  console.log("");

  // Test 4: Party Login
  console.log("📋 Test 4: Party Login");
  console.log("   Sending: P001 / party001");
  try {
    const res = await axios.post(`${API_BASE}/login`, {
      party_id: "P001",
      password: "party001",
      role: "party"
    });
    console.log("   ✅ SUCCESS!");
    console.log("   Response:", {
      success: res.data.success,
      role: res.data.role,
      redirect: res.data.redirect
    });
  } catch (err) {
    handleError(err, "Party Login");
  }
  console.log("");

  // Test 5: Wrong Password
  console.log("📋 Test 5: Wrong Password (should fail)");
  console.log("   Sending: V001 / John / Doe / wrongpassword");
  try {
    const res = await axios.post(`${API_BASE}/login`, {
      voter_id: "V001",
      first_name: "John",
      last_name: "Doe",
      password: "wrongpassword",
      role: "voter"
    });
    console.log("   ❌ UNEXPECTED SUCCESS! (should have failed)");
  } catch (err) {
    if (err.response?.status === 401) {
      console.log("   ✅ CORRECTLY REJECTED!");
      console.log("   Error:", err.response.data.error);
    } else {
      console.log("   ⚠️  Failed but with unexpected error");
      handleError(err, "Wrong Password Test");
    }
  }
  console.log("");

  console.log("=".repeat(70));
  console.log("✅ ALL TESTS COMPLETED");
  console.log("=".repeat(70) + "\n");
}

testLogin().catch(err => {
  console.error("\n❌ Test failed:", err.message);
  if (err.code === 'ECONNREFUSED') {
    console.log("\n⚠️  Backend is NOT running!");
    console.log("💡 Solution:");
    console.log("   1. Open another terminal");
    console.log("   2. cd backend");
    console.log("   3. npm start");
    console.log("   4. Run this test again\n");
  }
});
