'use strict'

let app = require('koa')();
let conf = {};
let rc = require('rc')('koa-sequelize-app', conf);

let db = require('./db')(conf.sequelize);

app.use(require('./routes')(db).routes());

app.context.db = db;

module.exports = app;
