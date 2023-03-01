// const User = require('../models/User');
const Validator = require('../helpers/validation');
const bcrypt = require('bcryptjs');
const { generateToken, emailVerifyToken } = require('../helpers/utils');
const msg = require('../const/message');
const config = require('../config');
const pokerAPI = require('../helpers/poker-api.js')

const authController = {
	login: async (req, res) => {
		try {

		} catch (e) {
			console.log(e);
			return res.json({ success: false, msg: 'server error ' });
		}
	},
	signup: async (req, res) => {
		try {

		} catch (e) {
			console.log(e);
			return res.json({ success: false, msg: 'server error' });
		}
	},
	getAvatars: async (req, res) => {
		try {
			const avatars = [];

			for (let i = 0; i < config.avatarMax; i += 1) {
				const avatar = {
					style: `display: inline-block; width: ${config.avatarSize}px; height: ${config.avatarSize}px; background: url('${config.POKER_URL}${config.avatarUrl}') no-repeat -${(i * config.avatarSize)}px 0px;`,
					value: i + 1,
					checked: i === 0 ? 'checked' : ''
				};
				avatars.push(avatar);
			}
			res.render('avatars', { avatars });
		} catch (e) {
			console.log(e);
			return res.json({ success: false, msg: 'server error' });
		}
	}
}

module.exports = authController;