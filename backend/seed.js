// seed.js
require("dotenv").config();
const mongoose = require("mongoose");

const voters = [
  {
    voter_id: "V001",
    first_name: "John",
    last_name: "Doe",
    password: "pass001",
    address: "mangalore",
    phone: "9876543210",
    constituency: "C001",
    has_voted: false,
    voted_candidate_id: null,
  },
  {
    voter_id: "V002",
    first_name: "Alice",
    last_name: "Doel",
    password: "pass002",
    address: "adyar",
    phone: "1234567890",
    constituency: "C001",
    has_voted: false,
    voted_candidate_id: null,
  },
  {
    voter_id: "V003",
    first_name: "Emma",
    last_name: "Watson",
    password: "pass003",
    address: "kankanady",
    phone: "9988776655",
    constituency: "C001",
    has_voted: false,
    voted_candidate_id: null,
  },
  {
    voter_id: "V004",
    first_name: "Robert",
    last_name: "Brown",
    password: "pass004",
    address: "surathkal",
    phone: "9876501234",
    constituency: "C002",
    has_voted: false,
    voted_candidate_id: null,
  },
  {
    voter_id: "V005",
    first_name: "Sophia",
    last_name: "Green",
    password: "pass005",
    address: "karkala",
    phone: "9123456789",
    constituency: "C002",
    has_voted: false,
    voted_candidate_id: null,
  },
  {
    voter_id: "V006",
    first_name: "Liam",
    last_name: "White",
    password: "pass006",
    address: "moodbidri",
    phone: "8123456780",
    constituency: "C001",
    has_voted: false,
    voted_candidate_id: null,
  },
  {
    voter_id: "V007",
    first_name: "Olivia",
    last_name: "Hill",
    password: "pass007",
    address: "padil",
    phone: "7012345678",
    constituency: "C001",
    has_voted: false,
    voted_candidate_id: null,
  },
  {
    voter_id: "V008",
    first_name: "Noah",
    last_name: "Taylor",
    password: "pass008",
    address: "bantwal",
    phone: "9312345678",
    constituency: "C002",
    has_voted: false,
    voted_candidate_id: null,
  },
  {
    voter_id: "V009",
    first_name: "Ava",
    last_name: "Clark",
    password: "pass009",
    address: "pumpwell",
    phone: "9412345678",
    constituency: "C001",
    has_voted: false,
    voted_candidate_id: null,
  },
  {
    voter_id: "V010",
    first_name: "William",
    last_name: "Davis",
    password: "pass010",
    address: "bejai",
    phone: "9512345678",
    constituency: "C002",
    has_voted: false,
    voted_candidate_id: null,
  },
  {
    voter_id: "V011",
    first_name: "Isabella",
    last_name: "Martin",
    password: "pass011",
    address: "kadri",
    phone: "9612345678",
    constituency: "C001",
    has_voted: false,
    voted_candidate_id: null,
  },
  {
    voter_id: "V012",
    first_name: "James",
    last_name: "Walker",
    password: "pass012",
    address: "ullal",
    phone: "9712345678",
    constituency: "C002",
    has_voted: false,
    voted_candidate_id: null,
  },
  {
    voter_id: "V013",
    first_name: "Mia",
    last_name: "Hall",
    password: "pass013",
    address: "falnir",
    phone: "9812345678",
    constituency: "C001",
    has_voted: false,
    voted_candidate_id: null,
  },
  {
    voter_id: "V014",
    first_name: "Benjamin",
    last_name: "Allen",
    password: "pass014",
    address: "valencia",
    phone: "9912345678",
    constituency: "C001",
    has_voted: false,
    voted_candidate_id: null,
  },
  {
    voter_id: "V015",
    first_name: "Charlotte",
    last_name: "Young",
    password: "pass015",
    address: "deralakatte",
    phone: "9012345678",
    constituency: "C002",
    has_voted: false,
    voted_candidate_id: null,
  },
];

const parties = [
  { party_id: "P001", name: "Democratic Party", password: "party001" },
  { party_id: "P002", name: "Republican Front", password: "party002" },
  { party_id: "P003", name: "Green Alliance", password: "party003" },
];

const candidates = [
  {
    candidate_id: "CD001",
    name: "Alice Johnson",
    constituency: "C001",
    party_id: "P001",
    votes: 0,
  },
  {
    candidate_id: "CD002",
    name: "Bob Smith",
    constituency: "C001",
    party_id: "P002",
    votes: 0,
  },
  {
    candidate_id: "CD003",
    name: "Carol Green",
    constituency: "C001",
    party_id: "P003",
    votes: 0,
  },
  {
    candidate_id: "CD004",
    name: "David Lee",
    constituency: "C002",
    party_id: "P001",
    votes: 0,
  },
  {
    candidate_id: "CD005",
    name: "Enola Adams",
    constituency: "C002",
    party_id: "P002",
    votes: 0,
  },
  {
    candidate_id: "CD006",
    name: "Frank Miller",
    constituency: "C002",
    party_id: "P003",
    votes: 0,
  },
];

const constituencies = [
  { constituency_id: "C001", name: "Mangalore Central", password: "const001" },
  { constituency_id: "C002", name: "Mangalore South", password: "const002" },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;

    await db.collection("voters").deleteMany({});
    await db.collection("parties").deleteMany({});
    await db.collection("candidates").deleteMany({});
    await db.collection("constituencies").deleteMany({});

    await db.collection("voters").insertMany(voters);
    await db.collection("parties").insertMany(parties);
    await db.collection("candidates").insertMany(candidates);
    await db.collection("constituencies").insertMany(constituencies);

    console.log("Seeding complete");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
