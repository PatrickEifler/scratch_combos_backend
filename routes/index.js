'use strict';

const authorization = require('../middleware/authorization');

module.exports = (db) => {
    const combosCtrl = require('../controllers/combos')(db.models.combos);
    const router = require('koa-router')();

    router.get('/combos/:comboId', authorization(), combosCtrl.getCombo);
    router.patch('/combos/:comboId', authorization(), combosCtrl.updateCombo);
    router.post('/combos/', authorization(), combosCtrl.createCombo);
    router.get('/combos/', authorization(), combosCtrl.getCombos);

    return router;
};
