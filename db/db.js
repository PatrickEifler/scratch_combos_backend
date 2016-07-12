'use strict';

let Sequelize = require('sequelize');

module.exports = (config) => {
    return new Sequelize(config.database, config.username, config.password, config.options);
};
