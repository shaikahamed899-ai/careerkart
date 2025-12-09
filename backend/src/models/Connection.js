const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'blocked'],
      default: 'pending',
      index: true,
    },
    message: {
      type: String,
      maxlength: 500,
    },
    respondedAt: Date,
    
    // Interaction tracking
    lastInteraction: Date,
    interactionCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate connections
connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });

// Static method to check connection status
connectionSchema.statics.getConnectionStatus = async function (userId1, userId2) {
  const connection = await this.findOne({
    $or: [
      { requester: userId1, recipient: userId2 },
      { requester: userId2, recipient: userId1 },
    ],
  });
  
  if (!connection) return 'none';
  return connection.status;
};

// Static method to get mutual connections
connectionSchema.statics.getMutualConnections = async function (userId1, userId2) {
  const user1Connections = await this.find({
    $or: [{ requester: userId1 }, { recipient: userId1 }],
    status: 'accepted',
  }).select('requester recipient');
  
  const user1ConnectedIds = user1Connections.map(c =>
    c.requester.toString() === userId1.toString() ? c.recipient : c.requester
  );
  
  const mutualConnections = await this.find({
    $or: [
      { requester: userId2, recipient: { $in: user1ConnectedIds } },
      { recipient: userId2, requester: { $in: user1ConnectedIds } },
    ],
    status: 'accepted',
  }).populate('requester recipient', 'name avatar headline');
  
  return mutualConnections;
};

const Connection = mongoose.model('Connection', connectionSchema);

module.exports = Connection;
