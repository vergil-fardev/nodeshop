const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const User = sequelize.define('user', {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
    },
    name: {
        allowNull: false,
        type: Sequelize.STRING,
    },
    email: {
        allowNull: false,
        type: Sequelize.STRING,
    }
});

module.exports = User;