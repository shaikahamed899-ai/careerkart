const Notification = require('../models/Notification');
const { AppError } = require('../middleware/errorHandler');
const { paginationResponse } = require('../utils/helpers');

// Get user's notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, unreadOnly } = req.query;
    
    const query = { recipient: req.user._id };
    
    if (type) {
      query.type = type;
    }
    
    if (unreadOnly === 'true') {
      query.isRead = false;
    }
    
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .populate('sender', 'name avatar')
        .populate('relatedJob', 'title')
        .populate('relatedCompany', 'name logo')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      Notification.countDocuments(query),
      Notification.getUnreadCount(req.user._id),
    ]);
    
    res.json({
      success: true,
      ...paginationResponse(notifications, total, parseInt(page), parseInt(limit)),
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

// Get unread count
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.getUnreadCount(req.user._id);
    
    res.json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error) {
    next(error);
  }
};

// Mark notification as read
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findOne({
      _id: id,
      recipient: req.user._id,
    });
    
    if (!notification) {
      throw new AppError('Notification not found', 404, 'NOT_FOUND');
    }
    
    await notification.markAsRead();
    
    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    next(error);
  }
};

// Mark all as read
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.markAllAsRead(req.user._id);
    
    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

// Delete notification
exports.deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: req.user._id,
    });
    
    if (!notification) {
      throw new AppError('Notification not found', 404, 'NOT_FOUND');
    }
    
    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    next(error);
  }
};

// Delete all notifications
exports.deleteAllNotifications = async (req, res, next) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });
    
    res.json({
      success: true,
      message: 'All notifications deleted',
    });
  } catch (error) {
    next(error);
  }
};

// Update notification preferences
exports.updatePreferences = async (req, res, next) => {
  try {
    const { emailNotifications, pushNotifications, notificationTypes } = req.body;
    
    const user = req.user;
    
    if (emailNotifications !== undefined) {
      user.preferences.emailNotifications = emailNotifications;
    }
    
    if (pushNotifications !== undefined) {
      user.preferences.pushNotifications = pushNotifications;
    }
    
    // You can extend this to handle specific notification type preferences
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Notification preferences updated',
      data: user.preferences,
    });
  } catch (error) {
    next(error);
  }
};
