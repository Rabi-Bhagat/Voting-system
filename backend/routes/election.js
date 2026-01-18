const express = require('express');
const router = express.Router();
const Election = require('../models/Election');
const AuditLog = require('../models/AuditLog');
const Voter = require('../models/Voter');
const Candidate = require('../models/Candidate');
const Constituency = require('../models/Constituency');
const Notification = require('../models/Notification');

// Generate unique election ID
const generateElectionId = () => {
  return 'EL-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
};

// Get all elections
router.get('/', async (req, res) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 });
    res.json(elections);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch elections' });
  }
});

// Get active election
router.get('/active', async (req, res) => {
  try {
    await Election.updateElectionStatuses();
    const election = await Election.getCurrentElection();
    res.json(election || { message: 'No active election' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active election' });
  }
});

// Get election by ID
router.get('/:id', async (req, res) => {
  try {
    const election = await Election.findOne({ election_id: req.params.id });
    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }
    res.json(election);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch election' });
  }
});

// Create new election
router.post('/create', async (req, res) => {
  try {
    const { title, description, constituencies, start_date, end_date, settings } = req.body;
    
    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    
    if (startDate >= endDate) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }
    
    // Check for overlapping active elections
    const overlapping = await Election.findOne({
      status: { $in: ['scheduled', 'active'] },
      $or: [
        { start_date: { $lte: endDate }, end_date: { $gte: startDate } }
      ]
    });
    
    if (overlapping) {
      return res.status(400).json({ 
        error: 'Another election is scheduled during this period',
        conflicting_election: overlapping.title
      });
    }
    
    const election = new Election({
      election_id: generateElectionId(),
      title,
      description,
      constituencies: constituencies || [],
      start_date: startDate,
      end_date: endDate,
      status: startDate <= new Date() ? 'active' : 'scheduled',
      settings: settings || {}
    });
    
    await election.save();
    
    // Log the action
    await AuditLog.log({
      action: 'ELECTION_CREATED',
      performed_by: 'admin',
      user_role: 'admin',
      target_type: 'election',
      target_id: election.election_id,
      details: { title, start_date, end_date }
    });
    
    // Create notification
    await Notification.createElectionNotification(
      `New Election: ${title}`,
      `A new election has been scheduled from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      constituencies
    );
    
    res.status(201).json({ message: 'Election created successfully', election });
  } catch (error) {
    console.error('Error creating election:', error);
    res.status(500).json({ error: 'Failed to create election' });
  }
});

// Update election
router.put('/:id', async (req, res) => {
  try {
    const { title, description, constituencies, start_date, end_date, settings } = req.body;
    
    const election = await Election.findOne({ election_id: req.params.id });
    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }
    
    if (election.status === 'active') {
      return res.status(400).json({ error: 'Cannot modify an active election' });
    }
    
    if (election.status === 'completed') {
      return res.status(400).json({ error: 'Cannot modify a completed election' });
    }
    
    // Update fields
    if (title) election.title = title;
    if (description) election.description = description;
    if (constituencies) election.constituencies = constituencies;
    if (start_date) election.start_date = new Date(start_date);
    if (end_date) election.end_date = new Date(end_date);
    if (settings) election.settings = { ...election.settings, ...settings };
    
    await election.save();
    
    await AuditLog.log({
      action: 'ELECTION_SCHEDULED',
      performed_by: 'admin',
      user_role: 'admin',
      target_type: 'election',
      target_id: election.election_id,
      details: { changes: req.body }
    });
    
    res.json({ message: 'Election updated successfully', election });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update election' });
  }
});

// Start election manually
router.post('/:id/start', async (req, res) => {
  try {
    const election = await Election.findOne({ election_id: req.params.id });
    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }
    
    if (election.status !== 'scheduled' && election.status !== 'draft') {
      return res.status(400).json({ error: 'Election cannot be started' });
    }
    
    election.status = 'active';
    election.start_date = new Date();
    await election.save();
    
    await AuditLog.log({
      action: 'ELECTION_STARTED',
      performed_by: 'admin',
      user_role: 'admin',
      target_type: 'election',
      target_id: election.election_id
    });
    
    await Notification.createElectionNotification(
      `Election Started: ${election.title}`,
      'The election is now open for voting. Cast your vote now!',
      election.constituencies
    );
    
    res.json({ message: 'Election started successfully', election });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start election' });
  }
});

// End election manually
router.post('/:id/end', async (req, res) => {
  try {
    const election = await Election.findOne({ election_id: req.params.id });
    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }
    
    if (election.status !== 'active') {
      return res.status(400).json({ error: 'Election is not active' });
    }
    
    election.status = 'completed';
    election.end_date = new Date();
    await election.updateStatistics();
    await election.save();
    
    await AuditLog.log({
      action: 'ELECTION_ENDED',
      performed_by: 'admin',
      user_role: 'admin',
      target_type: 'election',
      target_id: election.election_id,
      details: { final_statistics: election.statistics }
    });
    
    await Notification.createElectionNotification(
      `Election Ended: ${election.title}`,
      'The voting period has ended. Results will be published soon.',
      election.constituencies
    );
    
    res.json({ message: 'Election ended successfully', election });
  } catch (error) {
    res.status(500).json({ error: 'Failed to end election' });
  }
});

// Cancel election
router.post('/:id/cancel', async (req, res) => {
  try {
    const { reason } = req.body;
    const election = await Election.findOne({ election_id: req.params.id });
    
    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }
    
    if (election.status === 'completed') {
      return res.status(400).json({ error: 'Cannot cancel a completed election' });
    }
    
    election.status = 'cancelled';
    await election.save();
    
    await AuditLog.log({
      action: 'ELECTION_CANCELLED',
      performed_by: 'admin',
      user_role: 'admin',
      target_type: 'election',
      target_id: election.election_id,
      details: { reason },
      severity: 'warning'
    });
    
    res.json({ message: 'Election cancelled', election });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel election' });
  }
});

// Get election statistics
router.get('/:id/statistics', async (req, res) => {
  try {
    const election = await Election.findOne({ election_id: req.params.id });
    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }
    
    // Get detailed statistics
    const totalVoters = await Voter.countDocuments({ is_verified: true });
    const votedCount = await Voter.countDocuments({ has_voted: true });
    const candidateCount = await Candidate.countDocuments({ approved: true });
    
    // Get votes by constituency
    const votesByConstituency = await Voter.aggregate([
      { $match: { has_voted: true } },
      { $group: { _id: '$constituency', count: { $sum: 1 } } }
    ]);
    
    // Get votes by time (hourly)
    const votesByHour = await Voter.aggregate([
      { $match: { has_voted: true, vote_timestamp: { $exists: true } } },
      {
        $group: {
          _id: { $hour: '$vote_timestamp' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    res.json({
      election: {
        id: election.election_id,
        title: election.title,
        status: election.status,
        start_date: election.start_date,
        end_date: election.end_date
      },
      statistics: {
        total_eligible_voters: totalVoters,
        total_votes_cast: votedCount,
        turnout_percentage: totalVoters > 0 ? ((votedCount / totalVoters) * 100).toFixed(2) : 0,
        total_candidates: candidateCount,
        votes_by_constituency: votesByConstituency,
        votes_by_hour: votesByHour
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Publish results
router.post('/:id/publish-results', async (req, res) => {
  try {
    const election = await Election.findOne({ election_id: req.params.id });
    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }
    
    if (election.status !== 'completed') {
      return res.status(400).json({ error: 'Election must be completed before publishing results' });
    }
    
    election.results_published = true;
    election.published_at = new Date();
    await election.save();
    
    await AuditLog.log({
      action: 'RESULTS_PUBLISHED',
      performed_by: 'admin',
      user_role: 'admin',
      target_type: 'election',
      target_id: election.election_id
    });
    
    await Notification.createElectionNotification(
      `Results Published: ${election.title}`,
      'The election results are now available. View the results now!',
      election.constituencies
    );
    
    res.json({ message: 'Results published successfully', election });
  } catch (error) {
    res.status(500).json({ error: 'Failed to publish results' });
  }
});

module.exports = router;
