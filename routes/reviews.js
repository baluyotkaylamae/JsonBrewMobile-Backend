const express = require('express');
const router = express.Router();
const { Product } = require('../models/product');
const { Order } = require('../models/order');
const { Review } = require('../models/review');

// Fetch the product that the user has confirmed to receive
router.get('/:productId/order/:orderId', async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);
        const order = await Order.findById(req.params.orderId);
        
        // Check if the order exists and is confirmed
        if (!order || order.status !== 'Delivered') {
            return res.status(404).json({ success: false, message: 'Order not found or not delivered' });
        }

        // Check if the product belongs to the order
        const orderItem = order.orderItems.find(item => item.product.toString() === req.params.productId);
        if (!orderItem) {
            return res.status(404).json({ success: false, message: 'Product not found in the order' });
        }

        // If everything is fine, return the product
        res.json({ success: true, product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Create a review
router.post('/:productId/review/:orderId', async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);
        const order = await Order.findById(req.params.orderId);
        
        // Check if the order exists and is confirmed
        if (!order || order.status !== 'Delivered') {
            return res.status(404).json({ success: false, message: 'Order not found or not delivered' });
        }

        // Check if the product belongs to the order
        const orderItem = order.orderItems.find(item => item.product.toString() === req.params.productId);
        if (!orderItem) {
            return res.status(404).json({ success: false, message: 'Product not found in the order' });
        }

        // Create the review
        const review = new Review({
            product: req.params.productId,
            user: order.user,
            rating: req.body.rating,
            comment: req.body.comment
        });
        await review.save();

        res.json({ success: true, review });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

module.exports = router;
