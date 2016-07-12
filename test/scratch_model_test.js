'use strict';
const assert = require('chai').assert;
const request = require('request');
const http = require('http');
const app = require('../app');
const uuid = require('uuid');
let conf = {};
let rc = require('rc')('koa-sequelize-app', conf);

let combosModel = require('../db/models/combos');

describe('Command Model Test', () => {
  const PORT = 3001;
  let server = null;
  let rndId = null;

  const comboUUID = '4c841d3f-53a9-4571-8865-a8f941111014';

  const db = app.context.db;
  const combosModel = db.models.combos;

  before((done) => {
    server = http.createServer(app.callback()).listen(PORT);
    //throw if not test env
    if (conf.env === 'test') {
      db.sync().then(function () {
        db.truncate();
      }).then(() => {
        combosModel.create({
          id: comboUUID,
          scratches: ['lazer', 'orbit'],
          difficulty: 2,
          isDone: false,
        }).then(i => {
          rndId = i.toJSON().id;
          done();
        });
      }).catch(done);
    }
  });

  after(() => {
      server.close();
  });

  describe('Instance Methods', () => {
    it('should update isDone flag when endTime is set', (done) => {
      combosModel.findById(comboUUID).then(cmd => {
        assert.strictEqual(cmd.updateDoneFlag().isDone, true);
        done();
      });
    });
    it('should clean the instance for external apis', (done) => {
      combosModel.findById(comboUUID).then(cmd => {
        assert.notProperty(cmd.cleanUpForExternals(), 'createdAt');
        assert.notProperty(cmd.cleanUpForExternals(), 'updatedAt');
        done();
      });
    });
  });
});
