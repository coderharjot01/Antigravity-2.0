const mongoose = require('mongoose');

const chatLogSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        index: true
    },
    userMessage: {
        type: String,
        required: true,
        trim: true
    },
    botResponse: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['greeting', 'pricing', 'service', 'general'],
        default: 'general'
    },
    userEmail: {
        type: String,
        sparse: true // Optional field, indexed only when present
    },
    ipAddress: {
        type: String
    }
}, {
    timestamps: true
});

// Index for analytics
chatLogSchema.index({ createdAt: -1 });
chatLogSchema.index({ type: 1 });

// Static method to get chat history for a session
chatLogSchema.statics.getSessionHistory = function (sessionId) {
    return this.find({ sessionId }).sort({ createdAt: 1 });
};

// Static method to get popular queries
chatLogSchema.statics.getPopularQueries = function (limit = 10) {
    return this.aggregate([
        {
            $group: {
                _id: '$type',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: limit }
    ]);
};

module.exports = mongoose.model('ChatLog', chatLogSchema);
