'use strict';

module.exports = (token, shouldEscape) => {
	if (!token) { throw new Error('no token supplied for formatter'); }
	let t = token.split(' ')[1];

	return shouldEscape === true ? encodeURIComponent(t) : t;
};
