const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true,
        minlength: [10, 'Message must be at least 10 characters'],
        maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    status: {
        type: String,
        enum: ['new', 'read', 'replied', 'archived'],
        default: 'new'
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

// Index for faster queries
contactSchema.index({ email: 1 });
contactSchema.index({ createdAt: -1 });
contactSchema.index({ status: 1 });

// Virtual for submission age
contactSchema.virtual('age').get(function () {
    return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)); // Days
});

// Method to mark as read
contactSchema.methods.markAsRead = function () {
    this.status = 'read';
    return this.save();
};

// Method to mark as replied
contactSchema.methods.markAsReplied = function () {
    this.status = 'replied';
    return this.save();
};

// Static method to get unread count
contactSchema.statics.getUnreadCount = function () {
    return this.countDocuments({ status: 'new' });
};

// Static method to get recent submissions
contactSchema.statics.getRecent = function (limit = 10) {
    return this.find()
        .sort({ createdAt: -1 })
        .limit(limit);
};

module.exports = mongoose.model('Contact', contactSchema);
