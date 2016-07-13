'use strict'

let app = require('koa')();
let conf = {};
let rc = require('rc')('koa-sequelize-app', conf);
let fs = require('fs');
let enforceHttps = require('koa-sslify');

let db = require('./db')(conf.sequelize);

app.use(enforceHttps());
app.use(require('./routes')(db).routes());

app.context.db = db;

module.exports = app;
