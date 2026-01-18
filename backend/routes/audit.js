const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');

// Get all audit logs with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, action, severity, user, startDate, endDate } = req.query;
    
    const query = {};
    
    if (action) query.action = action;
    if (severity) query.severity = severity;
    if (user) query.performed_by = user;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    res.json({
      logs,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / limit),
        total_records: total,
        per_page: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Get recent logs
router.get('/recent', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const logs = await AuditLog.getRecentLogs(parseInt(limit));
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recent logs' });
  }
});

// Get critical/security logs
router.get('/critical', async (req, res) => {
  try {
    const logs = await AuditLog.getCriticalLogs(50);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch critical logs' });
  }
});

// Get logs by action type
router.get('/action/:action', async (req, res) => {
  try {
    const logs = await AuditLog.getLogsByAction(req.params.action, 100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Get logs by user
router.get('/user/:userId', async (req, res) => {
  try {
    const logs = await AuditLog.getLogsByUser(req.params.userId, 100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user logs' });
  }
});

// Get audit log statistics
router.get('/statistics', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // Actions by type
    const actionStats = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Actions by day
    const dailyStats = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    // Severity distribution
    const severityStats = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);
    
    // Top users
    const topUsers = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$performed_by', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      period_days: parseInt(days),
      action_stats: actionStats,
      daily_stats: dailyStats,
      severity_stats: severityStats,
      top_users: topUsers
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Export logs as JSON
router.get('/export', async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    
    let query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(5000);
    
    // Log the export action
    await AuditLog.log({
      action: 'DATA_EXPORT',
      performed_by: 'admin',
      user_role: 'admin',
      details: { export_type: 'audit_logs', records: logs.length }
    });
    
    if (format === 'csv') {
      // Convert to CSV format
      const headers = 'Timestamp,Action,Performed By,Role,Target Type,Target ID,Status,Severity,IP Address\n';
      const rows = logs.map(log => 
        `${log.createdAt.toISOString()},${log.action},${log.performed_by},${log.user_role},${log.target_type},${log.target_id || ''},${log.status},${log.severity},${log.ip_address}`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=audit_logs.csv');
      res.send(headers + rows);
    } else {
      res.json({
        export_date: new Date(),
        total_records: logs.length,
        logs
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to export logs' });
  }
});

// Get available action types
router.get('/action-types', async (req, res) => {
  try {
    const actions = await AuditLog.distinct('action');
    res.json(actions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch action types' });
  }
});

module.exports = router;
