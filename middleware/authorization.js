const auth = require('../lib/auth');
const tokenFormatter = require('../lib/tokenFormatter');

function authorization(options) {
	return function*(next) {
		console.log('authorization middleware', this.params);
		yield auth.get(tokenFormatter(this.headers.authorization, true), this.params.comboId);
		yield next;
	};
}

module.exports = authorization;
