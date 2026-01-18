const express = require('express');
const router = express.Router();
const Voter = require('../models/Voter');
const Candidate = require('../models/Candidate');
const Party = require('../models/Party');
const Constituency = require('../models/Constituency');
const Election = require('../models/Election');

// Get dashboard overview statistics
router.get('/dashboard', async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Basic counts
    const totalVoters = await Voter.countDocuments();
    const verifiedVoters = await Voter.countDocuments({ is_verified: true });
    const totalCandidates = await Candidate.countDocuments();
    const approvedCandidates = await Candidate.countDocuments({ approved: true });
    const totalParties = await Party.countDocuments();
    const totalConstituencies = await Constituency.countDocuments();
    
    // Voting statistics
    const votedCount = await Voter.countDocuments({ has_voted: true });
    const turnoutPercentage = verifiedVoters > 0 ? ((votedCount / verifiedVoters) * 100).toFixed(2) : 0;
    
    // Today's statistics
    const votesToday = await Voter.countDocuments({
      has_voted: true,
      vote_timestamp: { $gte: today }
    });
    
    // Active election
    let activeElection = null;
    try {
      activeElection = await Election.getCurrentElection();
    } catch (e) {
      // Election model may not have data yet
    }
    
    res.json({
      overview: {
        total_voters: totalVoters,
        verified_voters: verifiedVoters,
        total_candidates: totalCandidates,
        approved_candidates: approvedCandidates,
        total_parties: totalParties,
        total_constituencies: totalConstituencies
      },
      voting: {
        votes_cast: votedCount,
        votes_remaining: verifiedVoters - votedCount,
        turnout_percentage: parseFloat(turnoutPercentage),
        votes_today: votesToday
      },
      active_election: activeElection ? {
        id: activeElection.election_id,
        title: activeElection.title,
        start_date: activeElection.start_date,
        end_date: activeElection.end_date,
        status: activeElection.status
      } : null
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get real-time voting statistics
router.get('/voting-stats', async (req, res) => {
  try {
    const totalEligible = await Voter.countDocuments({ is_verified: true });
    const voted = await Voter.countDocuments({ has_voted: true });
    
    // Votes by constituency
    const byConstituency = await Voter.aggregate([
      { $match: { has_voted: true } },
      {
        $group: {
          _id: '$constituency',
          votes: { $sum: 1 }
        }
      },
      { $sort: { votes: -1 } }
    ]);
    
    // Get constituency names
    const constituencies = await Constituency.find();
    const constituencyMap = {};
    constituencies.forEach(c => {
      constituencyMap[c.constituency_id] = c.name;
    });
    
    const votesByConstituency = byConstituency.map(item => ({
      constituency_id: item._id,
      constituency_name: constituencyMap[item._id] || item._id,
      votes: item.votes
    }));
    
    res.json({
      total_eligible: totalEligible,
      votes_cast: voted,
      votes_remaining: totalEligible - voted,
      turnout_percentage: totalEligible > 0 ? ((voted / totalEligible) * 100).toFixed(2) : 0,
      by_constituency: votesByConstituency,
      last_updated: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch voting statistics' });
  }
});

// Get votes over time (for charts)
router.get('/votes-timeline', async (req, res) => {
  try {
    const { interval = 'hour' } = req.query;
    
    let groupFormat;
    switch (interval) {
      case 'minute':
        groupFormat = { 
          year: { $year: '$vote_timestamp' },
          month: { $month: '$vote_timestamp' },
          day: { $dayOfMonth: '$vote_timestamp' },
          hour: { $hour: '$vote_timestamp' },
          minute: { $minute: '$vote_timestamp' }
        };
        break;
      case 'day':
        groupFormat = {
          year: { $year: '$vote_timestamp' },
          month: { $month: '$vote_timestamp' },
          day: { $dayOfMonth: '$vote_timestamp' }
        };
        break;
      default: // hour
        groupFormat = {
          year: { $year: '$vote_timestamp' },
          month: { $month: '$vote_timestamp' },
          day: { $dayOfMonth: '$vote_timestamp' },
          hour: { $hour: '$vote_timestamp' }
        };
    }
    
    const timeline = await Voter.aggregate([
      { $match: { has_voted: true, vote_timestamp: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: groupFormat,
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    res.json({
      interval,
      data: timeline.map(item => ({
        timestamp: item._id,
        votes: item.count
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

// Get candidate vote distribution
router.get('/candidate-votes', async (req, res) => {
  try {
    const { constituency } = req.query;
    
    let query = { approved: true };
    if (constituency) {
      query.constituency = constituency;
    }
    
    const candidates = await Candidate.find(query)
      .select('candidate_id name party_id constituency votes')
      .sort({ votes: -1 });
    
    // Get party names
    const parties = await Party.find();
    const partyMap = {};
    parties.forEach(p => {
      partyMap[p.party_id] = p.name;
    });
    
    const totalVotes = candidates.reduce((sum, c) => sum + (c.votes || 0), 0);
    
    res.json({
      total_votes: totalVotes,
      candidates: candidates.map(c => ({
        candidate_id: c.candidate_id,
        name: c.name,
        party: partyMap[c.party_id] || c.party_id,
        constituency: c.constituency,
        votes: c.votes || 0,
        percentage: totalVotes > 0 ? ((c.votes || 0) / totalVotes * 100).toFixed(2) : 0
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch candidate votes' });
  }
});

// Get party-wise vote distribution
router.get('/party-votes', async (req, res) => {
  try {
    const partyVotes = await Candidate.aggregate([
      { $match: { approved: true } },
      {
        $group: {
          _id: '$party_id',
          total_votes: { $sum: '$votes' },
          candidate_count: { $sum: 1 }
        }
      },
      { $sort: { total_votes: -1 } }
    ]);
    
    // Get party details
    const parties = await Party.find();
    const partyMap = {};
    parties.forEach(p => {
      partyMap[p.party_id] = { name: p.name, symbol: p.symbol, color: p.color };
    });
    
    const totalVotes = partyVotes.reduce((sum, p) => sum + p.total_votes, 0);
    
    res.json({
      total_votes: totalVotes,
      parties: partyVotes.map(p => ({
        party_id: p._id,
        name: partyMap[p._id]?.name || p._id,
        symbol: partyMap[p._id]?.symbol || '',
        color: partyMap[p._id]?.color || '#666',
        votes: p.total_votes,
        candidates: p.candidate_count,
        percentage: totalVotes > 0 ? (p.total_votes / totalVotes * 100).toFixed(2) : 0
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch party votes' });
  }
});

// Get constituency-wise summary
router.get('/constituency-summary', async (req, res) => {
  try {
    const constituencies = await Constituency.find();
    const summary = [];
    
    for (const const_item of constituencies) {
      const totalVoters = await Voter.countDocuments({ 
        constituency: const_item.constituency_id,
        is_verified: true 
      });
      const votedCount = await Voter.countDocuments({ 
        constituency: const_item.constituency_id,
        has_voted: true 
      });
      const candidateCount = await Candidate.countDocuments({ 
        constituency: const_item.constituency_id,
        approved: true 
      });
      
      // Get leading candidate
      const leadingCandidate = await Candidate.findOne({ 
        constituency: const_item.constituency_id,
        approved: true 
      }).sort({ votes: -1 }).select('name party_id votes');
      
      summary.push({
        constituency_id: const_item.constituency_id,
        name: const_item.name,
        total_voters: totalVoters,
        votes_cast: votedCount,
        turnout: totalVoters > 0 ? ((votedCount / totalVoters) * 100).toFixed(2) : 0,
        candidates: candidateCount,
        leading: leadingCandidate ? {
          name: leadingCandidate.name,
          party: leadingCandidate.party_id,
          votes: leadingCandidate.votes || 0
        } : null
      });
    }
    
    res.json(summary.sort((a, b) => parseFloat(b.turnout) - parseFloat(a.turnout)));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch constituency summary' });
  }
});

// Get voter demographics
router.get('/voter-demographics', async (req, res) => {
  try {
    // By gender
    const byGender = await Voter.aggregate([
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);
    
    // By age groups
    const voters = await Voter.find({ age: { $exists: true } }).select('age');
    const ageGroups = {
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46-55': 0,
      '56-65': 0,
      '65+': 0
    };
    
    voters.forEach(v => {
      if (v.age >= 18 && v.age <= 25) ageGroups['18-25']++;
      else if (v.age <= 35) ageGroups['26-35']++;
      else if (v.age <= 45) ageGroups['36-45']++;
      else if (v.age <= 55) ageGroups['46-55']++;
      else if (v.age <= 65) ageGroups['56-65']++;
      else ageGroups['65+']++;
    });
    
    // Voting by verification status
    const byVerification = await Voter.aggregate([
      { $group: { _id: '$is_verified', count: { $sum: 1 } } }
    ]);
    
    res.json({
      by_gender: byGender,
      by_age_group: Object.entries(ageGroups).map(([group, count]) => ({ group, count })),
      by_verification: byVerification
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch demographics' });
  }
});

module.exports = router;
