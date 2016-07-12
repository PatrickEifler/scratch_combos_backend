'use strict';

module.exports = (conf) => {
    let db = require('./db')(conf);
    db.import('./models/combos');
    return db;
};
