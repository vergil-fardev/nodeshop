/***
 * CONTROLLER FILE
 */

const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('add-product', { 
        pageTitle: 'Add Product', 
        path: '/admin/add-product',
        formsCSS: true,
        productCSS: true,
        addProductActive: true,
    } );
};

exports.postAddProduct = (req, res, next) => {
    const product = new Product(req.body.title);
    product.save();
    res.redirect('/');
};

exports.getShop = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render('shop', {
            pageTitle: 'Shop', 
            prods: products, 
            path: '/', 
            productCSS: true,
            shopActive: true,
            hasProducts: products.length > 0,
        });
    });
};