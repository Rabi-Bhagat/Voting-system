const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

// Get notifications for a user
router.get('/:userType/:userId', async (req, res) => {
  try {
    const { userType, userId } = req.params;
    const { constituency } = req.query;
    
    const notifications = await Notification.getUnread(userId, userType, constituency);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get all notifications (admin)
router.get('/', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Create notification
router.post('/create', async (req, res) => {
  try {
    const { recipient_type, recipient_id, constituency, title, message, type, priority, action_url, expires_at } = req.body;
    
    const notification = new Notification({
      recipient_type,
      recipient_id,
      constituency,
      title,
      message,
      type: type || 'info',
      priority: priority || 'normal',
      action_url,
      expires_at: expires_at ? new Date(expires_at) : null,
      created_by: 'admin'
    });
    
    await notification.save();
    
    await AuditLog.log({
      action: 'ADMIN_ACTION',
      performed_by: 'admin',
      user_role: 'admin',
      details: { action: 'notification_created', title }
    });
    
    res.status(201).json({ message: 'Notification created', notification });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Create broadcast notification (to all)
router.post('/broadcast', async (req, res) => {
  try {
    const { title, message, type, priority } = req.body;
    
    const notification = new Notification({
      recipient_type: 'all',
      title,
      message,
      type: type || 'info',
      priority: priority || 'normal',
      created_by: 'admin'
    });
    
    await notification.save();
    
    await AuditLog.log({
      action: 'ADMIN_ACTION',
      performed_by: 'admin',
      user_role: 'admin',
      details: { action: 'broadcast_notification', title }
    });
    
    res.status(201).json({ message: 'Broadcast notification created', notification });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create broadcast notification' });
  }
});

// Mark notification as read
router.post('/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId } = req.body;
    
    await Notification.markAsRead(notificationId, userId);
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.post('/mark-all-read', async (req, res) => {
  try {
    const { userId, userType } = req.body;
    const count = await Notification.markAllAsRead(userId, userType);
    res.json({ message: `${count} notifications marked as read` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// Delete notification
router.delete('/:notificationId', async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.notificationId);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Get notification count for a user
router.get('/count/:userType/:userId', async (req, res) => {
  try {
    const { userType, userId } = req.params;
    const { constituency } = req.query;
    
    const notifications = await Notification.getUnread(userId, userType, constituency);
    res.json({ unread_count: notifications.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get notification count' });
  }
});

module.exports = router;
