const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      // Authentication actions
      'LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'PASSWORD_CHANGE',
      // Voter actions
      'VOTER_REGISTERED', 'VOTER_VERIFIED', 'VOTER_DELETED', 'VOTER_UPDATED', 'VOTE_CAST',
      // Candidate actions
      'CANDIDATE_REGISTERED', 'CANDIDATE_APPROVED', 'CANDIDATE_REJECTED', 'CANDIDATE_DELETED',
      // Party actions
      'PARTY_REGISTERED', 'PARTY_APPROVED', 'PARTY_DELETED',
      // Constituency actions
      'CONSTITUENCY_CREATED', 'CONSTITUENCY_UPDATED', 'CONSTITUENCY_DELETED',
      // Election actions
      'ELECTION_CREATED', 'ELECTION_SCHEDULED', 'ELECTION_STARTED', 'ELECTION_ENDED',
      'ELECTION_CANCELLED', 'RESULTS_PUBLISHED', 'VOTES_RESET',
      // Admin actions
      'ADMIN_ACTION', 'BULK_IMPORT', 'DATA_EXPORT', 'SETTINGS_CHANGED',
      // System actions
      'SYSTEM_ERROR', 'SECURITY_ALERT'
    ]
  },
  performed_by: {
    type: String,
    required: true
  },
  user_role: {
    type: String,
    enum: ['admin', 'voter', 'candidate', 'party', 'constituency', 'system'],
    default: 'admin'
  },
  target_type: {
    type: String,
    enum: ['voter', 'candidate', 'party', 'constituency', 'election', 'system', 'vote'],
    default: 'system'
  },
  target_id: {
    type: String,
    default: null
  },
  ip_address: {
    type: String,
    default: 'unknown'
  },
  user_agent: {
    type: String,
    default: ''
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'success'
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'info'
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ performed_by: 1, createdAt: -1 });
auditLogSchema.index({ target_type: 1, target_id: 1 });
auditLogSchema.index({ severity: 1 });

// Static method to log an action
auditLogSchema.statics.log = async function(logData) {
  try {
    const log = new this({
      action: logData.action,
      performed_by: logData.performed_by || 'system',
      user_role: logData.user_role || 'system',
      target_type: logData.target_type || 'system',
      target_id: logData.target_id || null,
      ip_address: logData.ip_address || 'unknown',
      user_agent: logData.user_agent || '',
      details: logData.details || {},
      status: logData.status || 'success',
      severity: logData.severity || 'info'
    });
    await log.save();
    return log;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    return null;
  }
};

// Static method to get recent logs
auditLogSchema.statics.getRecentLogs = function(limit = 50) {
  return this.find()
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get logs by user
auditLogSchema.statics.getLogsByUser = function(userId, limit = 50) {
  return this.find({ performed_by: userId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get logs by action type
auditLogSchema.statics.getLogsByAction = function(action, limit = 50) {
  return this.find({ action })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get critical logs
auditLogSchema.statics.getCriticalLogs = function(limit = 50) {
  return this.find({ severity: 'critical' })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get logs within date range
auditLogSchema.statics.getLogsByDateRange = function(startDate, endDate, limit = 500) {
  return this.find({
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  })
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
