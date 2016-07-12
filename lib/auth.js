'use strict'

const authServiceUrl = 'http://www.example.com';
const action = 'admin';
const request = require('request');

const get = exports.get = (token, comboId) => {
	if (token === null || typeof token === 'undefined') { throw new Error('must provide token'); }

	return new Promise((resolve, reject) => {
		request.get(`${authServiceUrl}/authorized/${token}/admin`, function (error, response, body) {
		  console.log('auth', error);
		  if (!error && response.statusCode === 204) {
		  	console.log('resolve auth', comboId);
		  	resolve({ token: token, comboId: comboId });

		  } else if (!error && response.statusCode === 403) {
		  	reject(new Error('Permission denied'));

		  } else if (error) {
		  	reject(error);
		  }
		});
	});
};
