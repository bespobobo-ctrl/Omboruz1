import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    sku: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        default: '',
    },
    quantity: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    unit: {
        type: String,
        default: 'dona',
        enum: ['dona', 'kg', 'litr', 'metr', 'pachka', 'quti'],
    },
    price: {
        type: Number,
        default: 0,
    },
    qrCode: {
        type: String,
        default: null,
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

ProductSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
