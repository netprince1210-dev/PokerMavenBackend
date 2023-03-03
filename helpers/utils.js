const jwt = require("jsonwebtoken");
const config = require('../config');
var Utils = {
    generateToken: ({ id, name, role }) =>
        jwt.sign({ id, name, role, iat: new Date().getTime() }, config.JWT_SECRET, {
            expiresIn: '30d',
        }),
    emailVerifyToken: ({ email, username, password, usertype }) =>
        jwt.sign({ username, email, password, usertype, iat: new Date().getTime() }, config.JWT_SECRET, {
            expiresIn: '1d',
        }),
}

module.exports = Utils;