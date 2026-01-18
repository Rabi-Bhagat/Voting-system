const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient_type: {
    type: String,
    enum: ['voter', 'candidate', 'party', 'all', 'constituency'],
    required: true
  },
  recipient_id: {
    type: String,
    default: null
  },
  constituency: {
    type: String,
    default: null
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'success', 'election', 'reminder', 'result'],
    default: 'info'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  read_by: [{
    user_id: String,
    read_at: Date
  }],
  action_url: {
    type: String,
    default: null
  },
  expires_at: {
    type: Date,
    default: null
  },
  created_by: {
    type: String,
    default: 'admin'
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ recipient_type: 1, createdAt: -1 });
notificationSchema.index({ recipient_id: 1 });
notificationSchema.index({ constituency: 1 });

// Get unread notifications for a user
notificationSchema.statics.getUnread = async function(userId, userType, constituency = null) {
  const query = {
    $or: [
      { recipient_type: 'all' },
      { recipient_type: userType, recipient_id: null },
      { recipient_type: userType, recipient_id: userId }
    ],
    'read_by.user_id': { $ne: userId },
    $or: [
      { expires_at: null },
      { expires_at: { $gt: new Date() } }
    ]
  };
  
  if (constituency) {
    query.$or.push({ recipient_type: 'constituency', constituency: constituency });
  }
  
  return this.find(query).sort({ createdAt: -1 }).limit(20);
};

// Mark notification as read
notificationSchema.statics.markAsRead = async function(notificationId, userId) {
  return this.findByIdAndUpdate(notificationId, {
    $push: { read_by: { user_id: userId, read_at: new Date() } }
  });
};

// Mark all notifications as read for a user
notificationSchema.statics.markAllAsRead = async function(userId, userType) {
  const notifications = await this.find({
    $or: [
      { recipient_type: 'all' },
      { recipient_type: userType }
    ],
    'read_by.user_id': { $ne: userId }
  });
  
  for (const notif of notifications) {
    notif.read_by.push({ user_id: userId, read_at: new Date() });
    await notif.save();
  }
  
  return notifications.length;
};

// Create election notification
notificationSchema.statics.createElectionNotification = async function(title, message, constituencies = []) {
  const notifications = [];
  
  if (constituencies.length === 0) {
    // Send to all
    const notif = new this({
      recipient_type: 'all',
      title,
      message,
      type: 'election',
      priority: 'high'
    });
    await notif.save();
    notifications.push(notif);
  } else {
    // Send to specific constituencies
    for (const constituency of constituencies) {
      const notif = new this({
        recipient_type: 'constituency',
        constituency,
        title,
        message,
        type: 'election',
        priority: 'high'
      });
      await notif.save();
      notifications.push(notif);
    }
  }
  
  return notifications;
};

module.exports = mongoose.model('Notification', notificationSchema);
