const Connection = require('../models/Connection');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { AppError } = require('../middleware/errorHandler');
const { paginationResponse } = require('../utils/helpers');

// Get user's connections
exports.getConnections = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status = 'accepted' } = req.query;
    
    const connections = await Connection.find({
      $or: [
        { requester: req.user._id },
        { recipient: req.user._id },
      ],
      status,
    })
      .populate('requester', 'name avatar profile.headline profile.location')
      .populate('recipient', 'name avatar profile.headline profile.location')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    // Format connections to show the other user
    const formattedConnections = connections.map(conn => {
      const otherUser = conn.requester._id.toString() === req.user._id.toString()
        ? conn.recipient
        : conn.requester;
      return {
        _id: conn._id,
        user: otherUser,
        status: conn.status,
        connectedAt: conn.respondedAt || conn.createdAt,
      };
    });
    
    const total = await Connection.countDocuments({
      $or: [
        { requester: req.user._id },
        { recipient: req.user._id },
      ],
      status,
    });
    
    res.json({
      success: true,
      ...paginationResponse(formattedConnections, total, parseInt(page), parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// Get pending connection requests
exports.getPendingRequests = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type = 'received' } = req.query;
    
    const query = type === 'received'
      ? { recipient: req.user._id, status: 'pending' }
      : { requester: req.user._id, status: 'pending' };
    
    const requests = await Connection.find(query)
      .populate('requester', 'name avatar profile.headline profile.location')
      .populate('recipient', 'name avatar profile.headline profile.location')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Connection.countDocuments(query);
    
    res.json({
      success: true,
      ...paginationResponse(requests, total, parseInt(page), parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// Send connection request
exports.sendConnectionRequest = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { message } = req.body;
    
    if (userId === req.user._id.toString()) {
      throw new AppError('Cannot connect with yourself', 400, 'INVALID_REQUEST');
    }
    
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }
    
    // Check if connection already exists
    const existingConnection = await Connection.findOne({
      $or: [
        { requester: req.user._id, recipient: userId },
        { requester: userId, recipient: req.user._id },
      ],
    });
    
    if (existingConnection) {
      if (existingConnection.status === 'accepted') {
        throw new AppError('Already connected', 400, 'ALREADY_CONNECTED');
      }
      if (existingConnection.status === 'pending') {
        throw new AppError('Connection request already pending', 400, 'REQUEST_PENDING');
      }
      if (existingConnection.status === 'blocked') {
        throw new AppError('Cannot send connection request', 400, 'BLOCKED');
      }
    }
    
    const connection = new Connection({
      requester: req.user._id,
      recipient: userId,
      message,
    });
    
    await connection.save();
    
    // Send notification
    await Notification.createNotification({
      recipient: userId,
      sender: req.user._id,
      type: 'connection_request',
      title: 'New Connection Request',
      message: `${req.user.name} wants to connect with you`,
      relatedUser: req.user._id,
      actionUrl: '/network/requests',
    });
    
    res.status(201).json({
      success: true,
      message: 'Connection request sent',
      data: connection,
    });
  } catch (error) {
    next(error);
  }
};

// Accept connection request
exports.acceptConnection = async (req, res, next) => {
  try {
    const { connectionId } = req.params;
    
    const connection = await Connection.findOne({
      _id: connectionId,
      recipient: req.user._id,
      status: 'pending',
    });
    
    if (!connection) {
      throw new AppError('Connection request not found', 404, 'NOT_FOUND');
    }
    
    connection.status = 'accepted';
    connection.respondedAt = new Date();
    await connection.save();
    
    // Send notification to requester
    await Notification.createNotification({
      recipient: connection.requester,
      sender: req.user._id,
      type: 'connection_accepted',
      title: 'Connection Accepted',
      message: `${req.user.name} accepted your connection request`,
      relatedUser: req.user._id,
      actionUrl: `/profile/${req.user._id}`,
    });
    
    res.json({
      success: true,
      message: 'Connection accepted',
    });
  } catch (error) {
    next(error);
  }
};

// Reject connection request
exports.rejectConnection = async (req, res, next) => {
  try {
    const { connectionId } = req.params;
    
    const connection = await Connection.findOne({
      _id: connectionId,
      recipient: req.user._id,
      status: 'pending',
    });
    
    if (!connection) {
      throw new AppError('Connection request not found', 404, 'NOT_FOUND');
    }
    
    connection.status = 'rejected';
    connection.respondedAt = new Date();
    await connection.save();
    
    res.json({
      success: true,
      message: 'Connection rejected',
    });
  } catch (error) {
    next(error);
  }
};

// Remove connection
exports.removeConnection = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const connection = await Connection.findOneAndDelete({
      $or: [
        { requester: req.user._id, recipient: userId },
        { requester: userId, recipient: req.user._id },
      ],
      status: 'accepted',
    });
    
    if (!connection) {
      throw new AppError('Connection not found', 404, 'NOT_FOUND');
    }
    
    res.json({
      success: true,
      message: 'Connection removed',
    });
  } catch (error) {
    next(error);
  }
};

// Get connection suggestions
exports.getSuggestions = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    
    // Get user's existing connections
    const existingConnections = await Connection.find({
      $or: [
        { requester: req.user._id },
        { recipient: req.user._id },
      ],
    }).select('requester recipient');
    
    const connectedUserIds = existingConnections.map(conn =>
      conn.requester.toString() === req.user._id.toString()
        ? conn.recipient
        : conn.requester
    );
    connectedUserIds.push(req.user._id);
    
    // Find users with similar skills or location
    const suggestions = await User.find({
      _id: { $nin: connectedUserIds },
      isActive: true,
      role: 'job_seeker',
      $or: [
        { 'profile.skills.name': { $in: req.user.profile?.skills?.map(s => s.name) || [] } },
        { 'profile.location.city': req.user.profile?.location?.city },
      ],
    })
      .select('name avatar profile.headline profile.location profile.skills')
      .limit(parseInt(limit));
    
    // Calculate mutual connections
    const suggestionsWithMutuals = await Promise.all(
      suggestions.map(async (user) => {
        const mutualConnections = await Connection.getMutualConnections(
          req.user._id,
          user._id
        );
        return {
          ...user.toObject(),
          mutualConnectionsCount: mutualConnections.length,
        };
      })
    );
    
    res.json({
      success: true,
      data: suggestionsWithMutuals,
    });
  } catch (error) {
    next(error);
  }
};

// Get connection status with a user
exports.getConnectionStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const status = await Connection.getConnectionStatus(req.user._id, userId);
    
    res.json({
      success: true,
      data: { status },
    });
  } catch (error) {
    next(error);
  }
};

// Get mutual connections
exports.getMutualConnections = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const mutualConnections = await Connection.getMutualConnections(
      req.user._id,
      userId
    );
    
    res.json({
      success: true,
      data: mutualConnections,
    });
  } catch (error) {
    next(error);
  }
};
