const mongoose = require('mongoose');

const orderAdminSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    customer: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['delivered', 'shipped', 'cancel'],
        required: true,
        default: 'shipped'
    }
}, {
    timestamps: true
});

const OrderAdmin = mongoose.model('OrderAdmin', orderAdminSchema);

module.exports = OrderAdmin; 