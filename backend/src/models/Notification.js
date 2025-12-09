const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    
    // Notification Type
    type: {
      type: String,
      enum: [
        // Application related
        'application_received',
        'application_viewed',
        'application_shortlisted',
        'application_rejected',
        'interview_scheduled',
        'interview_reminder',
        'offer_received',
        
        // Job related
        'new_job_match',
        'job_deadline_reminder',
        'saved_job_closing',
        
        // Network related
        'connection_request',
        'connection_accepted',
        'profile_viewed',
        
        // Company related
        'company_update',
        'new_job_from_followed_company',
        
        // System
        'profile_incomplete',
        'resume_reminder',
        'welcome',
        'account_verified',
        
        // Employer specific
        'new_application',
        'application_withdrawn',
        'candidate_match',
      ],
      required: true,
      index: true,
    },
    
    // Content
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    
    // Related entities
    relatedJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
    },
    relatedApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
    },
    relatedCompany: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    
    // Action URL
    actionUrl: String,
    actionText: String,
    
    // Status
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: Date,
    
    // Email notification
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: Date,
    
    // Push notification
    pushSent: {
      type: Boolean,
      default: false,
    },
    
    // Priority
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    
    // Expiry
    expiresAt: Date,
    
    // Metadata
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to create notification
notificationSchema.statics.createNotification = async function (data) {
  const notification = new this(data);
  await notification.save();
  
  // Emit socket event if io is available
  if (global.io) {
    global.io.to(`user_${data.recipient}`).emit('notification', notification);
  }
  
  return notification;
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function (userId) {
  return this.countDocuments({ recipient: userId, isRead: false });
};

// Method to mark as read
notificationSchema.methods.markAsRead = async function () {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    await this.save();
  }
  return this;
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = async function (userId) {
  return this.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
