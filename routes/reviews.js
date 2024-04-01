// reviews.js
const express = require('express');
const router = express.Router();
const { Review } = require('../models/review'); 
const { Order } = require('../models/order');

// router.post('/', async (req, res) => {
//     try {
//         const { orderId, rating, review } = req.body; // Remove orderItemId from here

//         if (!orderId) { // Check if orderId is provided
//             return res.status(400).json({ success: false, message: 'Order ID is required.' });
//         }

//         // Validate the rating
//         if (rating < 1 || rating > 5) {
//             return res.status(400).json({ success: false, message: 'Invalid rating. Rating must be between 1 and 5.' });
//         }

//         // Create a new review
//         const newReview = new Review({
//             order: orderId,
//             rating: rating,
//             comment: review
//         });

//         // Save the review
//         const savedReview = await newReview.save();

//         res.status(201).json({ success: true, review: savedReview });
//     } catch (error) {
//         console.error('Error creating review:', error);
//         res.status(500).json({ success: false, message: 'Internal Server Error' });
//     }
// });





// reviews.js

router.post('/', async (req, res) => {
    try {
        const { orderId, rating, comment } = req.body; // Change `review` to `comment`

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
            comment: comment // Use `comment` instead of `review`
        });

        // Save the review
        const savedReview = await newReview.save();

        res.status(201).json({ success: true, review: savedReview });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});





// Update/Edit Review
router.put('/:id', async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const reviewId = req.params.id;

        // Find the review by ID
        const review = await Review.findById(reviewId);

        // Check if the review exists
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found.' });
        }

        // Update the review properties
        // If rating or comment is not provided in the request body, use the current values
        review.rating = rating || review.rating;
        review.comment = comment || review.comment;

        // Save the updated review
        const updatedReview = await review.save();

        res.status(200).json({ success: true, review: updatedReview });
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});


router.get('/', async (req, res) => {
    try {
        const orderId = req.query.orderId; // Get order ID from query parameters
        if (!orderId) {
            return res.status(400).json({ success: false, message: 'Order ID is required.' });
        }

        // Find reviews with the provided order ID
        const reviews = await Review.find({ order: orderId });

        // Check if reviews exist for the order ID
        if (reviews.length === 0) {
            return res.status(404).json({ success: false, message: 'No reviews found for the provided order ID.' });
        }

        res.status(200).json({ success: true, reviews });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});


// Delete Review
router.delete('/:orderId', async (req, res) => {
    try {
        const orderId = req.params.orderId;

        // Find the review by order ID
        const review = await Review.findOne({ order: orderId });

        // Check if the review exists
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found for the provided order ID.' });
        }

        // Delete the review
        await Review.deleteOne({ order: orderId });

        res.status(200).json({ success: true, message: 'Review deleted successfully.' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});




// Fetch all reviews
// router.get('/all', async (req, res) => {
//     try {
//         // Find all reviews
//         const reviews = await Review.find();

//         res.status(200).json({ success: true, reviews });
//     } catch (error) {
//         console.error('Error fetching reviews:', error);
//         res.status(500).json({ success: false, message: 'Internal Server Error' });
//     }
// });




// router.get('/all', async (req, res) => {
//     try {
//         // Find all reviews
//         const reviews = await Review.find();

//         // Extract order IDs from reviews
//         const orderIds = reviews.map(review => review.order.id);

//         // Fetch orders with user information
//         const orders = await Order.find({ _id: { $in: orderIds } }).populate({
//             path: 'user',
//             select: 'name email' // Select only 'name' and 'email' fields of the user
//         });

//         // Map user information to reviews
//         const reviewsWithUsers = reviews.map(review => {
//             const order = orders.find(order => order._id.equals(review.order));
//             const user = order ? order.user : null;
//             return { ...review.toObject(), user }; // Add user information to review object
//         });

//         res.status(200).json({ success: true, reviews: reviewsWithUsers });
//     } catch (error) {
//         console.error('Error fetching reviews:', error);
//         res.status(500).json({ success: false, message: 'Internal Server Error' });
//     }
// });


// router.get('/all', async (req, res) => {
//     try {
//         const reviews = await Review.find().populate({
//             path: 'order',
//             populate: { path: 'user', select: 'name' } // Populate user's name
//         });

//         const reviewsWithUsers = reviews.map(review => ({
//             _id: review._id,
//             rating: review.rating,
//             comment: review.comment,
//             userName: review.order.user.name // Extract user's name from order
//         }));

//         res.status(200).json({ success: true, reviews: reviewsWithUsers });
//     } catch (error) {
//         console.error('Error fetching reviews:', error);
//         res.status(500).json({ success: false, message: 'Internal Server Error' });
//     }
// });


router.get('/all', async (req, res) => {
    try {
        const reviews = await Review.find().populate({
            path: 'order',
            populate: { path: 'user', select: 'name' } // Populate user's name and profile picture
        });

        const reviewsWithUsers = reviews.map(review => ({
            _id: review._id,
            rating: review.rating,
            comment: review.comment,
            userName: review.order.user.name,
            date: review.updatedAt,
            order: review.order
        }));

        res.status(200).json({ success: true, reviews: reviewsWithUsers });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});


module.exports = router;