/**
 * MODEL FILE
 */
const fs = require('fs');
const path = require('path');
const rootDir = require('../util/path');

const Cart = require('./cart');

const productsDataPath = path.join(
    rootDir,
    'data',
    'products.json'
);

const getProductsFromFile = cb => {
    fs.readFile(productsDataPath, (err, fileContent) => {
        if (err) {
            cb([]);
        } else {
            cb(JSON.parse(fileContent));
        }
    });
}

module.exports = class Product {
    constructor(id, title, imageUrl, description, price) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save() {
        getProductsFromFile((products) => {
            if (this.id) {
                const existingProductIndex = products.findIndex(p => p.id === this.id);
                const updatedProducts = [...products];
                updatedProducts[existingProductIndex] = this;
                fs.writeFile(productsDataPath, JSON.stringify(updatedProducts), (err) => {
                    if (err) {
                        console.log('edit mode', err);
                    }
                });
            } else {
                this.id = Math.random().toString();
                products.push(this);
                fs.writeFile(productsDataPath, JSON.stringify(products), (err) => {
                    if (err) {
                        console.log('add mode', err);
                    }
                });
            }
        });
    }

    static deleteById(id) {
        getProductsFromFile((products) => {
            const product = products.find(p => p.id === id);
            const updatedProducts = products.filter(p => p.id !== id);
            fs.writeFile(productsDataPath, JSON.stringify(updatedProducts), (err) => {
                if (!err) {
                    Cart.deleteProduct(id, product.price);
                } else {
                    console.log('delete mode', err);
                }
            });
        });
    }

    static fetchAll(cb) {
        getProductsFromFile(cb);
    }

    static findById(id, cb) {
        getProductsFromFile(products => {
            const product = products.find(p => p.id === id);
            cb(product);
        });
    }
}