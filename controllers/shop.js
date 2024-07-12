const fs = require("fs");
const path = require("path");
const Product = require("../models/product");
const Order = require("../models/order");
const PDFDocument = require("pdfkit");
const stripeUtil = require('../util/stripe');
const stripe = require('stripe')(stripeUtil.stripePk);

const ITEMS_PER_PAGE = 1;

exports.getProducts = (req, res, next) => {

  const page = +req.query.page || 1;
  let totalItems = 0;

  Product.find()
  .countDocuments()
  .then((numberOfProducts) => {
    totalItems = numberOfProducts;
    return Product.find()
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
  })
  .then((products) => {
    res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
        currentPage: page,
        hasNextPage: (ITEMS_PER_PAGE * page) < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => console.log(err));
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems = 0;

  Product.find()
  .countDocuments()
  .then((numberOfProducts) => {
    totalItems = numberOfProducts;
    return Product.find()
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
  })
  .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        currentPage: page,
        hasNextPage: (ITEMS_PER_PAGE * page) < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
      });
    })
    .catch((err) => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      console.log("post cart result", result);
      res.redirect("/cart");
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

//exports.postOrder = (req, res, next) => {
exports.getCheckoutSuccess = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          name: req.user.name,
          userId: req.user,
        },
        products: products,
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => console.log(err));
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
      });
    })
    .catch((err) => console.log(err));
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;

  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No Order found."));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthorized."));
      }

      const invoiceName = 'invoice-' + orderId + '.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName);

      // Creating pdf file with PDFKit
      const pdfDoc = new PDFDocument();

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + invoiceName + '"'
      );

      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text('Invoice', {
        underline: true,
      });

      pdfDoc.fontSize(14).text('--------------------');
      let totalPrice = 0;
      order.products.forEach(prod => {
        totalPrice += (prod.quantity * prod.product.price);
        pdfDoc.fontSize(14).text(prod.product.title + ' (' + prod.quantity + 'x)' + ' - $' + prod.product.price);
      });
      pdfDoc.fontSize(14).text('--------------------');
      pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);

      pdfDoc.end();

      /**
       // Read file to memory then return it
       fs.readFile(invoicePath, (err, data) => {
        if (err) {
          return next(err);
        }

        res.setHeader("Content-Type", "application/pdf");
        // Requires download of file and sets filename
        //res.setHeader('Content-Disposition', 'attachment; filename="'+ invoiceName + '"');
        res.setHeader(
          "Content-Disposition",
          'inline; filename="' + invoiceName + '"'
        );
        res.send(data);
      });
       */

      /**
      // Using stream of data (useful for larger files)
      const file = fs.createReadStream(invoicePath);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + invoiceName + '"'
      );
      file.pipe(res);

      */

    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCheckout = (req, res, next) => {
  let products;
  let total;

  req.user
  .populate('cart.items.productId')
  .then((user) => {
    products = user.cart.items;
    total = 0;

    products.forEach(p => {
      total += p.quantity * p.productId.price;
    });

    return stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: products.map(p => {
        return {
          quantity: p.quantity,
          price_data: {
            currency: 'usd',
            unit_amount: p.productId.price * 100, // value must be in cents
            product_data: {
              name: p.productId.title,
              description: p.productId.description,
            },
          },
        }
      }),
      customer_email: req.user.email,
      success_url: req.protocol + '://' + req.get('host') + '/checkout/success', // this approach is not 100% reliable, stripe documentation has solutions.
      cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel',
    });
  })
  .then((stripeSession) => {
    res.render("shop/checkout", {
      path: "/checkout",
      pageTitle: "Checkout",
      products: products,
      totalSum: total,
      stripeDk: stripeUtil.stripeDk,
      stripeSessionId: stripeSession.id,
    });
  })
  .catch((err) => {
    const error = new Error(err);
    error.httpsStatusCode = 500;
    return next(error);
  })
  
};
