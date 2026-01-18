const mongoose = require('mongoose');
const crypto = require('crypto');

const voteReceiptSchema = new mongoose.Schema({
  receipt_id: {
    type: String,
    required: true,
    unique: true
  },
  voter_id_hash: {
    type: String,
    required: true
  },
  election_id: {
    type: String,
    required: true
  },
  constituency: {
    type: String,
    required: true
  },
  vote_hash: {
    type: String,
    required: true
  },
  verification_code: {
    type: String,
    required: true,
    unique: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  verified_at: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
voteReceiptSchema.index({ verification_code: 1 });
voteReceiptSchema.index({ receipt_id: 1 });
voteReceiptSchema.index({ voter_id_hash: 1, election_id: 1 });

// Generate unique receipt ID
voteReceiptSchema.statics.generateReceiptId = function() {
  return 'VR-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Generate verification code (6 alphanumeric characters)
voteReceiptSchema.statics.generateVerificationCode = function() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing characters
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Hash voter ID for anonymity
voteReceiptSchema.statics.hashVoterId = function(voterId) {
  return crypto.createHash('sha256').update(voterId + process.env.VOTE_SALT || 'voting_salt').digest('hex');
};

// Generate vote hash (proof that vote was recorded without revealing choice)
voteReceiptSchema.statics.generateVoteHash = function(voterId, candidateId, timestamp) {
  const data = `${voterId}-${candidateId}-${timestamp}-${crypto.randomBytes(8).toString('hex')}`;
  return crypto.createHash('sha256').update(data).digest('hex');
};

// Create a new vote receipt
voteReceiptSchema.statics.createReceipt = async function(voterId, electionId, constituency, candidateId) {
  const receipt = new this({
    receipt_id: this.generateReceiptId(),
    voter_id_hash: this.hashVoterId(voterId),
    election_id: electionId,
    constituency: constituency,
    vote_hash: this.generateVoteHash(voterId, candidateId, Date.now()),
    verification_code: this.generateVerificationCode(),
    timestamp: new Date()
  });
  
  await receipt.save();
  return receipt;
};

// Verify a receipt by verification code
voteReceiptSchema.statics.verifyReceipt = async function(verificationCode) {
  const receipt = await this.findOne({ verification_code: verificationCode.toUpperCase() });
  
  if (!receipt) {
    return { valid: false, message: 'Invalid verification code' };
  }
  
  // Mark as verified
  receipt.is_verified = true;
  receipt.verified_at = new Date();
  await receipt.save();
  
  return {
    valid: true,
    message: 'Vote successfully verified',
    receipt: {
      receipt_id: receipt.receipt_id,
      timestamp: receipt.timestamp,
      constituency: receipt.constituency,
      vote_hash: receipt.vote_hash.substring(0, 16) + '...' // Show partial hash
    }
  };
};

// Get receipt by receipt ID
voteReceiptSchema.statics.getByReceiptId = function(receiptId) {
  return this.findOne({ receipt_id: receiptId });
};

module.exports = mongoose.model('VoteReceipt', voteReceiptSchema);
