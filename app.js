const errorController = require('./controllers/error');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const mongoose = require('mongoose');

const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findById('661fe8444f906cae2742501b')
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => {
            console.log(err);
        })
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);

mongoose
    .connect('mongodb+srv://rafver:X4z30db4EEETDQnr@rafcluster.zldo4y3.mongodb.net/shop?retryWrites=true')
    .then((result) => {
        User.findOne().then((user) => {
            if (!user) {
                const user = new User({
                    name: "Raf",
                    email: "raf@raf.com",
                    cart: {
                        items: [],
                    },
                });

                user.save();
            }
        });

        app.listen(3000);
    })
    .catch((err) => console.log(err));
