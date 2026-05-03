require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Candidate = require('./models/Candidate');
  const hash = await bcrypt.hash('pass123', 10);
  await Candidate.updateMany({}, { $set: { password: hash, approved: true } });
  console.log('Candidates updated with pass123');
  process.exit(0);
});
