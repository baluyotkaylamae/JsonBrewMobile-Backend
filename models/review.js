const mongoose = require('mongoose');

// Define the schema for the Review
const reviewSchema = mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order', // Reference to the Order model
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
    },
    { timestamps: true }
);

exports.Review = mongoose.model('Review', reviewSchema);
