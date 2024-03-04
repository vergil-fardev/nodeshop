/**
 * MODEL FILE
 */
const fs = require('fs');
const path = require('path');
const rootDir = require('../util/path');

const db = require('../util/database');

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
        return db.execute('INSERT INTO products (title, imageUrl, description, price) VALUES (?, ?, ?, ?)',
        [this.title, this.imageUrl, this.description, this.price]);
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

    static fetchAll() {
        return db.execute('SELECT * FROM products');
    }

    static findById(id) {
        return db.execute('SELECT * FROM products WHERE products.id = ?', [id]);
    }
}