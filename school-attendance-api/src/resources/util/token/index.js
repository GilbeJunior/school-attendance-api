const jwt = require('jsonwebtoken');
const authConfig = require('../../../config/auth/auth.json');

const generateToken = (params = {}) => {
	return jwt.sign(params, authConfig.secretApi, {
		expiresIn: 1000
		//expiresIn: 86400,
	});
};

module.exports = generateToken;