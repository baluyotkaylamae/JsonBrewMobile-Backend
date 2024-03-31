// reviews.js
const express = require('express');
const router = express.Router();
const { Review } = require('../models/review'); // Import the Review model

router.post('/', async (req, res) => {
    try {
        const { orderId, rating, review } = req.body; // Remove orderItemId from here

        if (!orderId) { // Check if orderId is provided
            return res.status(400).json({ success: false, message: 'Order ID is required.' });
        }

        // Validate the rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Invalid rating. Rating must be between 1 and 5.' });
        }

        // Create a new review
        const newReview = new Review({
            order: orderId,
            rating: rating,
            comment: review
        });

        // Save the review
        const savedReview = await newReview.save();

        res.status(201).json({ success: true, review: savedReview });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

module.exports = router;
