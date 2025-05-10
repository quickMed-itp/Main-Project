const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    genericName: {
        type: String,
        required: true,
        trim: true
    },
    brandName: {
        type: String,
        required: true,
        trim: true
    },
    medicineType: {
        type: String,
        required: true,
        enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment', 'Drops', 'Other'],
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    timestamps: true
});

const Medicine = mongoose.model('Medicine', medicineSchema);

module.exports = Medicine; 