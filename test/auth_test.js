'use strict';

const auth = require('../lib/auth');
const assert = require('chai').assert;
const sinon = require('sinon');
const http = require('http');
const MockReq = require('mock-req');
const MockRes = require('mock-res');
const request = require('request');

const token = '4c841d3f-53a9-4571-8865-a8f941111014';
const combosUUID = 'cf1dc00d-50fb-4b8e-b4bd-a7154f8a9393';

describe('Auth', () => {
  beforeEach(() => {
  	this.request = sinon.stub(request, 'get');
  });

  afterEach(() => {
  	request.get.restore();
  });

  describe('Get the permissions from Auth service', () => {
  	let response;
  	let request;
  	beforeEach(() => {
  		response = new MockRes({
  			method: 'GET',
  			url: '/stuff',
  		});
  		request = new MockReq();
  	});
	  it('should get the permission from auth service on 204', (done) => {
	    let getSpy = sinon.spy(auth, 'get');
	    response.writeHead(204);

	    this.request.callsArgWith(1,	null, response, { body: 'ok' }).returns(request);

	    auth.get(token, combosUUID).then((res) => {
	    	assert.deepEqual(res, {
	    		token: '4c841d3f-53a9-4571-8865-a8f941111014',
  				comboId: 'cf1dc00d-50fb-4b8e-b4bd-a7154f8a9393'
  			});
	    	done();
	    }).catch(done);

	  });
	  it('should not get the permissions from auth service on 403', (done) => {
	  	let cb = sinon.spy();
	    response.writeHead(403);

	    this.request.callsArgWith(1,	null, response, { body: 'ok' }).returns(request);

			auth.get(token, combosUUID).then(res => {
	    	assert.deepEqual(res, {
	    		token: '4c841d3f-53a9-4571-8865-a8f941111014',
  				comboId: 'cf1dc00d-50fb-4b8e-b4bd-a7154f8a9393'
  			});
	    	done();
	    }).catch(err => {
	    	assert.deepEqual(err, new Error('Permission desnied'));
	    	done();
	    }).catch(done);
	  });
  });

  describe('Ensure token', () => {
  	it('should throw if not called with a token', () => {
  		assert.throws(function() {auth.get(null, combosUUID, function() {}); }, 'must provide token');
  		assert.throws(function() {auth.get(undefined, combosUUID, function() {}); }, 'must provide token');
  	});
  	it('should throw if token is undefined', () => {
  		assert.throws(function() {auth.get(undefined, combosUUID, function() {}); }, 'must provide token');
  	});
  });
});
