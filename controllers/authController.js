const User = require('../models/User');
const Mail = require('../models/Mail');
const Validator = require('../helpers/validation');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { generateToken, emailVerifyToken } = require('../helpers/utils');
const msg = require('../const/message');
const config = require('../config');

var transporter = nodemailer.createTransport({
	...config.mailer
});

const authController = {
	
}

module.exports = authController;