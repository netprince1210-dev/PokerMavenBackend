const User = require('../models/User');
const { generateToken, emailVerifyToken } = require('../helpers/utils');
const config = require('../config');
const pokerAPI = require('../helpers/poker-api.js')
const _ = require('lodash');

const authController = {
	login: async (req, res) => {
		try {
			const user = await User.findOne({ name: req.body.name });
			if (!user) {
				return res.json({ success: false, msg: 'Account is not exist' });
			}
			if (user.password !== req.body.password) {
				return res.json({ success: false, msg: 'Account information is not correct' });
			}
			const token = generateToken({ id: user._id, name: req.body.name, role: user.role });
			return res.json({ success: true, token, name: user.name, role: user.role })
		} catch (e) {
			console.log(e);
			return res.json({ success: false, msg: 'server error ' });
		}
	},
	signup: async (req, res) => {
		try {
			const isExist = await User.findOne({ name: req.body.name });
			if (isExist) {
				return res.json({ success: false, msg: 'The player name is already exist, please try another name' });
			}
			let newUser = new User({
				..._.omit(req.body, 'confirm_pwd'),
				role: 2
			});
			await newUser.save();
			return res.json({ success: true });
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
			res.json({ success: true, avatars });
		} catch (e) {
			console.log(e);
			return res.json({ success: false, msg: 'server error' });
		}
	}
}

module.exports = authController;