import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['rahbar', 'ombor'],
        required: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    telegramId: {
        type: String,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    lastLogin: {
        type: Date,
        default: null,
    },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
