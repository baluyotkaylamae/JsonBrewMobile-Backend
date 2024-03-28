const { Order } = require('../models/order');
const express = require('express');
const { OrderItem } = require('../models/order-item');
const router = express.Router();
const { Product } = require('../models/product');


router.get(`/`, async (req, res) => {
    const orderList = await Order.find().populate('user', 'name').sort({ 'dateOrdered': -1 });

    if (!orderList) {
        res.status(500).json({ success: false })
    }
   
    res.status(201).json(orderList)
})

router.get(`/:id`, async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name')
        .populate({
            path: 'orderItems', 
            populate: {
                path: 'product', 
                populate: 'category'
            }
        });

    if (!order) {
        res.status(500).json({ success: false })
    }
    res.send(order);
})

// router.post('/', async (req, res) => {
//     try {
//         const orderItemsIds = await Promise.all(req.body.orderItems.map(async (orderItem) => {
//             let newOrderItem = new OrderItem({
//                 quantity: orderItem.quantity,
//                 product: orderItem.product
//             });

//             newOrderItem = await newOrderItem.save();

//             return newOrderItem._id;
            
//         }));

//         let order = new Order({
//             orderItems: orderItemsIds,
//             shippingAddress1: req.body.shippingAddress1,
//             shippingAddress2: req.body.shippingAddress2,
//             city: req.body.city,
//             zip: req.body.zip,
//             country: req.body.country,
//             phone: req.body.phone,
//             status: req.body.status,
//             totalPrice: req.body.totalPrice, 
//             user: req.body.user,
//         });

//         order = await order.save();

//         if (!order)
//             return res.status(400).send('the order cannot be created!')

//         res.send(order);
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Internal Server Error');
//     }
// });
router.post('/', async (req, res) => {
    try {
        // Validate request body
        if (!req.body.orderItems || !Array.isArray(req.body.orderItems) || req.body.orderItems.length === 0) {
            return res.status(400).send('Order items are required and should be a non-empty array.');
        }

        // Validate each order item
        for (const orderItem of req.body.orderItems) {
            if (!orderItem.product || !orderItem.quantity || isNaN(orderItem.quantity) || orderItem.quantity <= 0) {
                return res.status(400).send('Each order item should have a valid product ID and a quantity greater than zero.');
            }
        }

        // Create an array to store the IDs of created order items
        const orderItemsIds = [];

        // Create order items and update product stock
        for (const orderItem of req.body.orderItems) {
            const newOrderItem = new OrderItem({
                quantity: orderItem.quantity,
                product: orderItem.product
            });

            const savedOrderItem = await newOrderItem.save();
            orderItemsIds.push(savedOrderItem._id);

            // Update product countInStock
            const product = await Product.findById(orderItem.product);
            if (!product) {
                throw new Error(`Product not found for ID: ${orderItem.product}`);
            }

            product.countInStock -= orderItem.quantity;
            await product.save();
        }

        // Create the order
        const order = new Order({
            orderItems: orderItemsIds,
            shippingAddress1: req.body.shippingAddress1,
            shippingAddress2: req.body.shippingAddress2,
            city: req.body.city,
            zip: req.body.zip,
            country: req.body.country,
            phone: req.body.phone,
            status: req.body.status,
            totalPrice: req.body.totalPrice, 
            user: req.body.user,
        });

        const savedOrder = await order.save();

        if (!savedOrder) {
            return res.status(400).send('The order could not be created.');
        }

        res.status(201).send(savedOrder);
    } catch (error) {
        console.error('Error creating order:', error);
        if (error.message.startsWith('Product not found')) {
            res.status(404).send(error.message);
        } else {
            res.status(500).send('Internal Server Error');
        }
    }
});

router.put('/:id', async (req, res) => {
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status
        },
        { new: true }
    )

    if (!order)
        return res.status(400).send('the order cannot be update!')

    res.send(order);
})


router.delete('/:id', (req, res) => {
    Order.findByIdAndRemove(req.params.id).then(async order => {
        if (order) {
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem)
            })
            return res.status(200).json({ success: true, message: 'the order is deleted!' })
        } else {
            return res.status(404).json({ success: false, message: "order not found!" })
        }
    }).catch(err => {
        return res.status(500).json({ success: false, error: err })
    })
})

router.get('/get/totalsales', async (req, res) => {
    const totalSales = await Order.aggregate([
        { $group: { _id: null, totalsales: { $sum: '$totalPrice' } } }
    ])

    if (!totalSales) {
        return res.status(400).send('The order sales cannot be generated')
    }

    res.send({ totalsales: totalSales.pop().totalsales })
})

router.get(`/get/count`, async (req, res) => {
    const orderCount = await Order.countDocuments((count) => count)

    if (!orderCount) {
        res.status(500).json({ success: false })
    }
    res.send({
        orderCount: orderCount
    });
})

router.get(`/get/userorders/:userid`, async (req, res) => {
    const userOrderList = await Order.find({ user: req.params.userid }).populate({
        path: 'orderItems', populate: {
            path: 'product', populate: 'category'
        }
    }).sort({ 'dateOrdered': -1 });

    if (!userOrderList) {
        res.status(500).json({ success: false })
    }
    res.send(userOrderList);
})



module.exports = router;