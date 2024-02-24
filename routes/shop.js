const productController = require('../controllers/products');

const express = require('express');

const router = express.Router();

router.get('/', productController.getShop);

module.exports = router;