'use strict';

let parse = require('co-body');
let L = require('lodash');
let auth = require('../lib/auth');

module.exports = (combosModel) => {
  let _combosModel = combosModel;

  return {
    getCombo: function *() {
      let combo = yield _combosModel.findById(this.params.comboId);

      if (!combo) {
        return this.throw(404, 'combo not found');
      }

      this.body = combo;
    },
    getCombos: function *() {
      let combos = yield _combosModel.findAll();
      let query = this.query;

      if (query.isDone === 'false') {
        this.body = combos.filter((combo) => {
          combo.cleanUpForExternals();
          return combo.get('isDone') === false || combo.get('isDone') === null;
        });
      } else if (query.isDone === 'true') {
        this.body = combos.filter((combo) => {
          combo.cleanUpForExternals();
          return combo.get('isDone') === true;
        });
      } else {
        this.body = combos.map((combo) => {
          return combo.cleanUpForExternals();
        });
      }
    },
    createCombo: function *() {
      let body = yield parse(this);

      if (body.scratches === null) {
        this.throw(404, 'must provide scratches array');
      }

      let createdCombo = yield _combosModel.create(L.merge(body, this.params));

      this.body = createdCombo.cleanUpForExternals();
    },
    updateCombo: function *() {
      let patch = yield parse(this);
      let combo = yield _combosModel.findById(this.params.comboId);

      if (!combo) { return this.throw(400, 'combo not found'); }
      if (patch.scratches.length <= 0) {
          return this.throw(400, 'scratches array cannot be empty for a combo');
      }

      combo.update(patch);

      this.body = combo.cleanUpForExternals();
    }
  };
};
