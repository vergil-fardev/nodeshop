const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');

const isAuth = require('../middlewares/is-auth');

const router = express.Router();

const { body } = require('express-validator');

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post(
    '/add-product', 
    [
        body('title', 'Please set a title with a minimum of 3 characters using only letters and numbers.')
        .isLength({min: 3})
        .isAlphanumeric('en-US', { ignore: ' '})
        .trim(),
        body('imageUrl', 'Invalid URL for image.').isURL(),
        body('price', 'Price must be a valid number.').isFloat(),
        body('description', 'Please set a description with a minimum of 5 characters and a maximum of 400 letters.')
        .isLength({min: 5, max: 400})
        .trim(),
    ],
    isAuth, 
    adminController.postAddProduct
);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post(
    '/edit-product', 
    [
        body('title', 'Please set a title with a minimum of 3 characters using only letters and numbers.')
        .isLength({min: 3})
        .isAlphanumeric('en-US', { ignore: ' '})
        .trim(),
        body('imageUrl', 'Invalid URL for image.').isURL(),
        body('price', 'Price must be a valid number.').isFloat(),
        body('description', 'Please set a description with a minimum of 5 characters and a maximum of 400 letters.')
        .isLength({min: 5, max: 400})
        .trim(),
    ],
    isAuth, 
    adminController.postEditProduct
);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
