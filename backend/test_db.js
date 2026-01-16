const mongoose = require('mongoose');
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI;

console.log("Testing connection to:", mongoUri);

mongoose.connect(mongoUri)
  .then(() => {
    console.log("Cloud MongoDB connected successfully");
    process.exit(0);
  })
  .catch(err => {
    console.error("Cloud MongoDB connection failed:", err);
    process.exit(1);
  });
