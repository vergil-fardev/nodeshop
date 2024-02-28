/**
 * MODEL FILE
 */

const fs = require('fs');
const path = require('path');

const rootDir = require('../util/path');

const cartDataPath = path.join(
    rootDir,
    'data',
    'cart.json'
);

module.exports = class Cart {
    static addProduct(id, productPrice) {
        // Fetch the previous cart
        fs.readFile(cartDataPath, (err, fileContent) => {
            let cart = { products: [], totalPrice: 0 };
            if (!err) {
                cart = JSON.parse(fileContent)
            }

            // Analyze de cart => Find existing product
            const existingProductIndex = cart.products.findIndex(prod => prod.id === id);
            const existingProduct = cart.products[existingProductIndex];
            let updatedProduct;

            // Andd new product / increase quantity
            if (existingProduct) {
                updatedProduct = { ...existingProduct };
                updatedProduct.qty = updatedProduct.qty + 1;
                cart.products = [...cart.products]
                cart.products[existingProductIndex] = updatedProduct;
            } else {
                updatedProduct = { id: id, qty: 1 };
                cart.products = [...cart.products, updatedProduct]
            }

            // Set total price
            cart.totalPrice = cart.totalPrice + +productPrice;

            // Save to file
            fs.writeFile(cartDataPath, JSON.stringify(cart), err => {
                console.log('Cart Error', err);
            });
        });
    }
}