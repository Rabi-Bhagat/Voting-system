const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
  election_id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  constituencies: [{
    type: String,
    ref: 'Constituency'
  }],
  start_date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  created_by: {
    type: String,
    default: 'admin'
  },
  settings: {
    allow_nota: {
      type: Boolean,
      default: true
    },
    require_otp: {
      type: Boolean,
      default: false
    },
    show_live_results: {
      type: Boolean,
      default: false
    },
    allow_revote: {
      type: Boolean,
      default: false
    },
    max_candidates_per_constituency: {
      type: Number,
      default: 10
    }
  },
  statistics: {
    total_eligible_voters: {
      type: Number,
      default: 0
    },
    total_votes_cast: {
      type: Number,
      default: 0
    },
    turnout_percentage: {
      type: Number,
      default: 0
    }
  },
  results_published: {
    type: Boolean,
    default: false
  },
  published_at: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient querying
electionSchema.index({ status: 1, start_date: 1, end_date: 1 });

// Virtual to check if election is currently active
electionSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'active' && now >= this.start_date && now <= this.end_date;
});

// Method to update statistics
electionSchema.methods.updateStatistics = async function() {
  const Voter = mongoose.model('Voter');
  const totalVoters = await Voter.countDocuments({ is_verified: true });
  const votedCount = await Voter.countDocuments({ has_voted: true });
  
  this.statistics.total_eligible_voters = totalVoters;
  this.statistics.total_votes_cast = votedCount;
  this.statistics.turnout_percentage = totalVoters > 0 
    ? ((votedCount / totalVoters) * 100).toFixed(2) 
    : 0;
  
  return this.save();
};

// Static method to get current active election
electionSchema.statics.getCurrentElection = function() {
  const now = new Date();
  return this.findOne({
    status: 'active',
    start_date: { $lte: now },
    end_date: { $gte: now }
  });
};

// Static method to auto-update election statuses
electionSchema.statics.updateElectionStatuses = async function() {
  const now = new Date();
  
  // Activate scheduled elections that should start
  await this.updateMany(
    {
      status: 'scheduled',
      start_date: { $lte: now }
    },
    { status: 'active' }
  );
  
  // Complete active elections that have ended
  await this.updateMany(
    {
      status: 'active',
      end_date: { $lt: now }
    },
    { status: 'completed' }
  );
};

module.exports = mongoose.model('Election', electionSchema);
