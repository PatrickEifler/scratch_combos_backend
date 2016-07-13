'use strict';
const assert = require('chai').assert;
const request = require('request');
const app = require('../app');
const uuid = require('uuid');
let conf = {};
let rc = require('rc')('koa-sequelize-app', conf);
const nock = require('nock');
const fs = require('fs');
const https = require('https');

const sslOptions = {
  key: fs.readFileSync('domain.key'),
  cert: fs.readFileSync('domain.crt')
};

describe('Api Test', () => {
  const PORT = 3001;
  let server = null;
  let rndId = null;
  let scope;
  const authServiceUrl = 'http://www.example.com';
  const comboUUID = '4c841d3f-53a9-4571-8865-a8f941111014';
  const token = '2f1ds01d-51a9-4171-1165-a11941111014';

  before((done) => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

    server = https.createServer(sslOptions, app.callback()).listen(PORT);
    //throw if not test env
    if (conf.env === 'test') {
      app.context.db.sync().then(function () {
        app.context.db.truncate();
      }).then(() => {
        app.context.db.models.combos.create({
          id: comboUUID,
          scratches: ['crab', 'one-click'],
          isDone: false
        }).then(i => {
          rndId = i.toJSON().id;
          done();
        }).catch(done);
      });
    }
    scope = nock(authServiceUrl)
      .persist()
      .get(`/authorized/${token}/admin`)
      .reply(204);
  });

  after(() => {
    nock.cleanAll();
    server.close();
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = 1;
  });

  describe('get a combo and find one', () => {
      let req;

    beforeEach(() => {
      req = {
        headers: {
          authorization: `bearer ${token}`
        },
        url: `https://localhost:${PORT}/combos/${comboUUID}`,
        method: 'GET',
        json: true
      };
    });

    it('should respond with 200', (done) => {
      request(req, (err, res, body) => {
        assert.equal(res.statusCode, 200);
        done();
      });
    });

    it('the response body should be the retrieved combo', (done) => {
      request(req, (err, res, body) => {
        assert.property(res.body, 'scratches');
        assert.property(res.body, 'difficulty');
        assert.include(res.body.scratches, 'crab', 'one-click');
        done();
      });
    });
  });

  describe('get a combo and not find one', () => {
      let req;
      let invalidUUID = '12841d3f-53a9-4571-8865-a8f943435014';
      beforeEach(() => {
        req = {
          headers: {
            authorization: `bearer ${token}`
          },
          url: `https://localhost:${PORT}/combos/${invalidUUID}`,
          method: 'GET',
          json: true,
        };
      });
      it('should respond with 404', (done) => {
        request(req, (err, res, body) => {
          assert.equal(res.statusCode, 404);
          done();
        });
      });
      it('combo not found', (done) => {
        request(req, (err, res, body) => {
          assert.strictEqual(res.body, 'combo not found');
          done();
        });
      });
  });

  describe('Create a combo', () => {
    let req;
    const combo = {
      scratches: ['one-click', 'crab']
    };
    beforeEach(() => {
      req = {
        headers: {
          authorization: `bearer ${token}`
        },
        url: `https://localhost:${PORT}/combos`,
        method: 'POST',
        body: combo,
        json: true
      };
    });
    it('should respond with 200', (done) => {
        request(req, (err, res, body) => {
          assert.equal(res.statusCode, 200);
          done();
        });
    });
    it('should respond with the created combo', (done) => {
        request(req, (err, res, body) => {
          assert.property(body, 'id');
          body.id = comboUUID;
          assert.deepEqual(body, {
            id: comboUUID,
            scratches: ['one-click', 'crab'],
            difficulty: 1,
            isDone: false
          });
          done();
      });
    });
    it('should omit the createdAt and updatedAt from the combos model for the response', (done) => {
        request(req, (err, res, body) => {
          assert.notProperty(body, 'createdAt');
          assert.notProperty(body, 'updatedAt');
          done();
        });
    });
  });

  describe('Update combo', () => {
    let req;
    beforeEach(() => {
      let patch = {
        scratches: ['3 click orbit', 'tear'],
        isDone: true,
        difficulty: 3
      };
      req = {
        headers: {
          authorization: `bearer ${token}`
        },
        url: `https://localhost:${PORT}/combos/${comboUUID}`,
        method: 'PATCH',
        body: patch,
        json: true
      };
    });
    it('should return 200', (done) => {
      request(req, (err, res, body) => {
        assert.equal(res.statusCode, 200);
        done();
      });
    });
    it('should update the given combo', (done) => {
      request(req, (err, res, body) => {
        assert.deepEqual(body, {
          scratches: ['3 click orbit', 'tear'],
          id: '4c841d3f-53a9-4571-8865-a8f941111014',
          difficulty: 3,
          isDone: true
        });
        done();
      });
    });
  });

  describe.skip('validate update combo patch', () => {
    let req;
  });

  describe('filter combo with isDone=false', () => {
    let req;

    beforeEach((done) => {
      if (conf.env === 'test') {
        app.context.db.truncate().then(() => {
          app.context.db.models.combos.create({
            id: '4c841d3f-53a9-4571-8865-a8f941111067',
            scratches: ['three-click', 'crab'],
            isDone: false,
          }).then(i => {
            rndId = i.toJSON().id;
          });
          app.context.db.models.combos.create({
            id: '4c841d3f-53a9-4571-8865-a8f941111089',
            scratches: ['boomerang', 'swing'],
            isDone: false
          }).then(i => {
            rndId = i.toJSON().id;
            done();
          }).catch(done);
        });
      }
      req = {
        headers: {
          authorization: `bearer ${token}`
        },
        url: `https://localhost:${PORT}/combos?isDone=false`,
        method: 'GET',
        json: true
      };
    });
    it('should return 200', (done) => {
      request(req, (err, res, body) => {
        assert.equal(res.statusCode, 200);
        done();
      });
    });
    it('should retrieve all combos from the table', (done) => {
      request(req, (err, res, body) => {
        assert.strictEqual(body.length, 2);
        assert.property(body[0], 'scratches');
        done();
      });
    });
  });

  describe('filter the combos with isDone=true', () => {
    let req;

    beforeEach((done) => {
      if (conf.env === 'test') {
          app.context.db.truncate().then(() => {
              app.context.db.models.combos.create({
                  id: '4c841d3f-53a9-4571-8865-a8f941111014',
                  scratches: ['crab', 'baby'],
                  isDone: false,
              }).then(i => {
                  rndId = i.toJSON().id;
              });
              app.context.db.models.combos.create({
                  id: '4c841d3f-53a9-4571-8865-a8f943561014',
                  scratches: ['boomerang'],
                  isDone: true,
              }).then(i => {
                  rndId = i.toJSON().id;
                  done();
              }).catch(done);
          });
      }
        req = {
          headers: {
            authorization: `bearer ${token}`
          },
          url: `https://localhost:${PORT}/combos?isDone=true`,
          method: 'GET',
          json: true
        };
    });
    it('should return 200', (done) => {
      request(req, (err, res, body) => {
        assert.equal(res.statusCode, 200);
        done();
      });
    });
    it('should retrieve all combo from the table', (done) => {
      request(req, (err, res, body) => {
        assert.strictEqual(body.length, 1);
        assert.property(body[0], 'scratches');
        done();
      });
    });
  });


  describe('get all combos', () => {
    let req;
    let comboUUID = '4c841d3f-53a9-4571-8865-a8f9434350';

    beforeEach((done) => {
      if (conf.env === 'test') {
          app.context.db.truncate().then(() => {
              app.context.db.models.combos.create({
                id: comboUUID + 10,
                scratches: ['onc-click', 'crescent'],
                isDone: false,
              }).then(i => {
                rndId = i.toJSON().id;
              });
              app.context.db.models.combos.create({
                id: comboUUID + 20,
                scratches: [''],
                isDone: true,
              }).then(i => {
                rndId = i.toJSON().id;
                done();
              }).catch(done);
          });
      }
        req = {
          headers: {
            authorization: `bearer ${token}`
          },
          url: `https://localhost:${PORT}/combos`,
          method: 'GET',
          json: true
        };
    });
    it('should return 200', (done) => {
      request(req, (err, res, body) => {
        assert.equal(res.statusCode, 200);
        done();
      });
    });
    it('should retrieve all combos from the table', (done) => {
      request(req, (err, res, body) => {
        assert.strictEqual(body.length, 2);
        assert.property(body[0], 'scratches');
        assert.property(body[1], 'scratches');
        done();
      });
    });
  });

  describe('Permission denied for wrong token', () => {
    let req;
    beforeEach(() => {
      nock(authServiceUrl)
        .persist()
        .get(`/authorized/${token}/admin`)
        .reply(403);

      req = {
        headers: {
          authorization: 'bearer 2f1ds01d-51a9-4171-1165-a11944243014'
        },
        url: `https://localhost:${PORT}/combos/${comboUUID}`,
        method: 'GET',
        json: true
      };
    });
    afterEach(() => {
      nock.cleanAll();
    });
    it('server returns not found', (done) => {
      request(req, (err, res, body) => {
        assert.equal(res.body, 'Not Found');
        done();
      });
    });
  });

  describe('Permission denied if no token', () => {
    let req;
    beforeEach(() => {
      nock(authServiceUrl)
        .persist()
        .get(`/authorized/${token}/admin`)
        .reply(403);

      req = {
        url: `https://localhost:${PORT}/combos/${comboUUID}`,
        method: 'GET',
        json: true
      };
    });
    afterEach(() => {
      nock.cleanAll();
    });
    it('server returns error', (done) => {
      request(req, (err, res, body) => {
        assert.equal(res.body, 'Internal Server Error');
        done();
      });
    });
  });
});
