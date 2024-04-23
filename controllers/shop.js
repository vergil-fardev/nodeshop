/***
 * CONTROLLER FILE
 */

const Product = require('../models/product');
// const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
    Product.find()
        .then((products) => {
            res.render('shop/product-list', {
                pageTitle: 'All Products',
                prods: products,
                path: '/products',
            });
        })
        .catch((err) => {
            console.log(err);
        })
};

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then((product) => {
            res.render('shop/product-detail', { 
                pageTitle: product.title, 
                product: product, 
                path: '/products' 
            });
        })
        .catch((err) => {
            console.log(err);
        });

};

exports.getIndex = (req, res, next) => {
    Product.find()
        .then((products) => {
            res.render('shop/index', {
                pageTitle: 'Shop',
                prods: products,
                path: '/',
            });
        })
        .catch((err) => {
            console.log(err);
        })
};

exports.getCart = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .then((user) => {
            const cartProducts = user.cart.items;
            console.log('cart products', cartProducts);
            res.render('shop/cart', {
                pageTitle: 'Your Cart',
                path: '/cart',
                products: cartProducts
            });
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.postCart = (req, res, next) => {
    const productId = req.body.productId;

    Product.findById(productId)
        .then((product) => {
            return req.user.addToCart(product);
        })
        .then((result) => {
            console.log(result);
            res.redirect('/cart');
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.postCartDeleteItem = (req, res, next) => {
    const productId = req.body.productId;

    req.user
        .deleteItemFromCart(productId)
        .then((result) => {
            console.log(result);
            res.redirect('/cart');
        })
        .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
    req.user
    .getOrders()
    .then((orders) => {
        console.log(orders);
        res.render('shop/orders', {
            pageTitle: 'Your Orders',
            path: '/orders',
            orders: orders
        });
    })
    .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
    req.user
        .addOrder()
        .then((result) => {
            res.redirect('/orders');
        })
        .catch(err => console.log(err));
};