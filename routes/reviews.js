const express = require('express');
const router = express.Router();
const { Review } = require('../models/review');
const { Product } = require('../models/product');
const { Order } = require('../models/order');

// POST route to create a new review
router.post('/', async (req, res) => {
    try {
        // Check if the user has already reviewed the product
        const existingReview = await Review.findOne({ user: req.body.userId, product: req.body.productId });
        if (existingReview) {
            return res.status(400).send('You have already reviewed this product.');
        }

        // Retrieve the order details
        const order = await Order.findOne({ user: req.body.userId, status: 'Delivered', 'orderItems.product': req.body.productId });
        if (!order) {
            return res.status(400).send('You cannot review this product. Make sure you have received it.');
        }

        // Create a new review
        const review = new Review({
            user: req.body.userId,
            product: req.body.productId,
            rating: req.body.rating,
            comment: req.body.comment,
            description: req.body.description
        });

        // Save the review
        await review.save();

        res.send(review);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Error creating review');
    }
});

// Additional routes for fetching, updating, and deleting reviews can be added here

module.exports = router;
