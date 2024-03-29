const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
});

exports.Review = mongoose.model('Review', reviewSchema);
