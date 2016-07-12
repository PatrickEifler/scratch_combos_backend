'use strict';
const assert = require('chai').assert;
const tokenFormatter = require('../lib/tokenFormatter');

describe('Token Formatter Test', () => {
  describe('Format the token', () => {
    it('should split the bearer string from the token', () => {
      let token = 'bearer cf1dc00d-50fb-4b8e-b4bd-a7154f8a9393';
      assert.equal(tokenFormatter(token), 'cf1dc00d-50fb-4b8e-b4bd-a7154f8a9393');
    });
    it('should escape slashes within the token if shouldEscape flag is set', () => {
      let token = 'bearer cf1dc/0d-50fb-4b/e-b4bd-a7154f/a9393';
      assert.strictEqual(tokenFormatter(token, true), 'cf1dc%2F0d-50fb-4b%2Fe-b4bd-a7154f%2Fa9393');
    });
  });
});
