/***
 * CONTROLLER FILE
 */

const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editMode: false
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = req.body.price;

    const product = new Product(title, price, description, imageUrl);

    product.save()
    .then((result) => {
        console.log(result);
        console.log('Product created!');
        res.redirect('/admin/products');
    })
    .catch((err) => {
        console.log(err);
    });
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.editMode;

    if (!editMode) {
        return res.redirect('/');
    }

    const productId = req.params.productId;

    Product.findById(productId)
    .then((product) => {
        if(!product) {
            return res.redirect('/');
        }

        res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editMode: editMode,
            product: product
        });
    })
    .catch((err) => {
        console.log(err);
    });

};

exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDescription = req.body.description;
    const updatedPrice = req.body.price;

    const product = new Product(updatedTitle, updatedPrice, updatedDescription, updatedImageUrl, productId);
    product.save()
    .then((result) => {
        console.log('UPDATED PRODUCT!');
        res.redirect('/admin/products');
    })
    .catch((err) => {
        console.log(err);
    });
};

exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.deleteById(productId)
    .then((result) => {
        console.log('PRODUCT DELETED!');
        res.redirect('/admin/products');
    })
    .catch((err) => {
        console.log(err);
    });
};

exports.getProducts = (req, res, next) => {
    Product.fetchAll()
    .then((products) => {
        res.render('admin/products', {
            prods: products,
            pageTitle: 'Admin Products',
            path: '/admin/products'
        });
    })
    .catch((err) => {
        console.log(err);
    })
};