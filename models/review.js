const mongoose = require('mongoose');

// Define the schema for the Review
const reviewSchema = mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order', // Reference to the User model
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    }
});

exports.Review = mongoose.model('Review', reviewSchema);

