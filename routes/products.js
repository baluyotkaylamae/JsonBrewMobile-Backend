const express = require('express');
const { Product } = require('../models/product');
const Category = require('../models/Category');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
});

const uploadOptions = multer({ storage: storage });

router.get(`/`, async (req, res) =>{
    // localhost:3000/api/v1/products?categories=2342342,234234
    console.log(req.query)
    let filter = {};
    if(req.query.categories)
    {
         filter = {category: req.query.categories.split(',')}
    }

    const productList = await Product.find(filter).populate('category');
    // console.log(productList.category)

    if(!productList) {
        res.status(500).json({success: false})
    } 
    res.send(productList);
})

router.get(`/:id`, async (req, res) =>{
    const product = await Product.findById(req.params.id).populate('category');

    if(!product) {
        res.status(500).json({success: false})
    } 
    res.send(product);
})

router.post(`/`, uploadOptions.array('images', 10), async (req, res) => {
    try {
        const category = await Category.findById(req.body.category);
        if (!category) return res.status(400).send('Invalid Category');

        const files = req.files;
        if (!files || files.length === 0) return res.status(400).send('No image in the request');

        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        const productImages = files.map(file => `${basePath}${file.filename}`);

        let product = new Product({
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            images: productImages, // Store multiple image paths
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        });

        product = await product.save();

        if (!product) return res.status(500).send('The product cannot be created');

        res.send(product);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal server error');
    }
});

router.put('/:id',uploadOptions.array('images', 10), async (req, res) => {
    console.log(req.body);
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id');
    }
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(400).send('Invalid Product!');

    const files = req.files;
    if (!files || files.length === 0) return res.status(400).send('No image in the request');

    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    const productImages = files.map(file => `${basePath}${file.filename}`);

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            // image: imagepath,
            images: productImages,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        },
        { new: true }
    );

    if (!updatedProduct) return res.status(500).send('the product cannot be updated!');

    res.send(updatedProduct);
});


router.delete('/:id', (req, res) => {
    Product.findByIdAndDelete(req.params.id)
        .then(product => {
            if (product) {
                return res.status(200).json({ success: true, message: 'Product deleted successfully.' });
            } else {
                return res.status(404).json({ success: false, message: 'Product not found.' });
            }
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ success: false, error: 'Internal server error.' });
        });
});


router.get(`/get/count`, async (req, res) =>{
    const productCount = await Product.countDocuments((count) => count)

    if(!productCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        productCount: productCount
    });
})

router.get(`/get/featured/:count`, async (req, res) =>{
    const count = req.params.count ? req.params.count : 0
    const products = await Product.find({isFeatured: true}).limit(+count);

    if(!products) {
        res.status(500).json({success: false})
    } 
    res.send(products);
})

router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid Product Id');
        }

        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).send('No images uploaded');
        }

        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        const imagesPaths = await Promise.all(files.map(async (file) => {
            const fileName = file.filename;
            return `${basePath}${fileName}`;
        }));

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { images: imagesPaths },
            { new: true }
        );

        if (!product) {
            return res.status(500).send('Failed to update product');
        }

        return res.send(product);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal server error');
    }
});

module.exports=router;