/***
 * CONTROLLER FILE
 */

const Product = require('../models/product');
// const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
    Product.fetchAll()
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
            res.render('shop/product-detail', { pageTitle: product.title, product: product, path: '/products' });
        })
        .catch((err) => {
            console.log(err);
        });

    /** Alternative way
    Product.findAll({ where: { id: prodId } })
    .then((products) => {
        res.render('shop/product-detail', { pageTitle: products[0].title, products[0]: product, path: '/products' });
    })
    .catch((err) => {
        console.log(err);
    });
     */

};

exports.getIndex = (req, res, next) => {
    Product.fetchAll()
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

// exports.getCart = (req, res, next) => {
//     req.user.getCart()
//         .then((cart) => {
//             return cart.getProducts()
//         })
//         .then((cartProducts) => {
//             res.render('shop/cart', {
//                 pageTitle: 'Your Cart',
//                 path: '/cart',
//                 products: cartProducts
//             });
//         })
//         .catch((err) => {
//             console.log(err);
//         });
// };

// exports.postCart = (req, res, next) => {
//     const productId = req.body.productId;

//     let newQuantity = 1;
//     let fetchedCart;

//     req.user.getCart()
//         .then((cart) => {
//             fetchedCart = cart;
//             return cart.getProducts({ where: { id: productId } });
//         })
//         .then((products) => {
//             let product;
//             if (products.length > 0) {
//                 product = products[0];
//             }

//             if (product) {
//                 newQuantity = product.cartItem.quantity + 1;
//                 return product;
//             }
//             return Product.findByPk(productId)
//         })
//         .then((product) => {
//             return fetchedCart.addProduct(product, {
//                 through: { quantity: newQuantity }
//             });
//         })
//         .then((result) => {
//             res.redirect('/cart');
//         })
//         .catch((err) => {
//             console.log(err);
//         });
// };

// exports.postCartDeleteItem = (req, res, next) => {
//     const productId = req.body.productId;

//     req.user.getCart()
//         .then((cart) => {
//             return cart.getProducts({ where: { id: productId } });
//         })
//         .then((products) => {
//             const product = products[0];
//             return product.cartItem.destroy();
//         })
//         .then((result) => {
//             res.redirect('/cart');
//         })
//         .catch(err => console.log(err));
// };

// exports.getOrders = (req, res, next) => {
//     req.user
//     .getOrders({include: ['products']})
//     .then((orders) => {
//         res.render('shop/orders', {
//             pageTitle: 'Your Orders',
//             path: '/orders',
//             orders: orders
//         });
//     })
//     .catch(err => console.log(err));
// };

// exports.postOrder = (req, res, next) => {
//     let fetchedCart;
//     req.user.getCart()
//         .then((cart) => {
//             fetchedCart = cart;
//             return cart.getProducts()
//         })
//         .then((products) => {
//             return req.user.createOrder()
//                 .then((order) => {
//                     order.addProducts(
//                         products.map((product) => {
//                             product.orderItem = { quantity: product.cartItem.quantity };
//                             return product;
//                         })
//                     );
//                 })
//                 .catch(err => console.log(err));
//         })
//         .then((result) => {
//             return fetchedCart.setProducts(null);
//         })
//         .then((result) => {
//             res.redirect('/orders');
//         })
//         .catch(err => console.log(err));
// };