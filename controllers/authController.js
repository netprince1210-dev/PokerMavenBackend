const User = require('../models/User');
const Validator = require('../helpers/validation');
const bcrypt = require('bcryptjs');
const { generateToken, emailVerifyToken } = require('../helpers/utils');
const msg = require('../const/message');
const config = require('../config');

const authController = {

}

module.exports = authController;