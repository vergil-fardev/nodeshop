/**
 * CONTROLLER FILE
 */
const path = require('path');

exports.get404 = (req, res, next) => {
    res.render('404', {pageTitle: 'Page not Found', path: path});
};