const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    phone: {
        type: String,
        trim: true,
        // making it optional but good to have validation if provided
    },
    role: {
        type: String,
        enum: ['customer', 'join'],
        default: 'customer'
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    }
}, {
    timestamps: true
});

subscriberSchema.index({ email: 1 });
subscriberSchema.index({ createdAt: -1 });

module.exports = mongoose.models.Subscriber || mongoose.model('Subscriber', subscriberSchema);
