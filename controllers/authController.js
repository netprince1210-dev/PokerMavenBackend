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

	onUserLogin: async (req, res) => {
		try {
			console.log(req.body.userInfo + ' is logged in at ' + new Date());
			const { userInfo, password } = req.body;

			const { success, msg } = Validator.userLogin(req.body);
			if (!success) {
				return res.json({ success, msg });
			}
			let user = await User.findOne({ $or: [{ email: userInfo }, { username: userInfo }] }).exec();

			if (user) {
				if (user.verify) {
					if (bcrypt.compareSync(password, user.password))
						res.status(200).json({
							success: true,
							id: user._id,
							token: generateToken({ id: user._id, username: user.username, email: user.email, role: user.role, usertype: user.usertype }),
							username: user.username,
							role: user.role,
							usertype: user.usertype,
							msg: 'Welcome to ' + user.realname.first,
							avatar: user.profile.avatar
						});
					else {
						res.json({ msg: 'Wrong password', success: false });
					}
				} else {
					res.json({ success: false, msg: 'Your account is not verified' });
				}
			} else {
				return res.json({ success: false, msg: 'User not exist' });
			}
		} catch (error) {
			console.log(error);
			return res.json({ success: false, msg: msg.server.error });
		}
	},
	onUserRegister: async (req, res) => {
		try {
			const { firstName, lastName, userName, birthday, city, state, email, password, usertype, category } = req.body;

			const { success, msg } = Validator.userRegister(req.body);
			if (!success) {
				return res.json({ success, msg });
			}
			let exist = await User.aggregate([
				{
					$match: {
						$or: [{ username: userName }, { email }]
					}
				}
			]);


			if (exist.length > 0)
				return res.json({ success: false, msg: 'User already exist, please use another email' });

			var salt = bcrypt.genSaltSync(10);
			var hash = bcrypt.hashSync(password, salt);

			const user = new User({
				realname: {
					first: firstName,
					last: lastName
				},
				username: userName,
				birth: birthday,
				address: {
					city,
					state,
				},
				email,
				category,
				password: hash,
				usertype,
				verify: true // in real server, must remove this line
			});
			let save = await user.save();
			let verifyCode = emailVerifyToken({ email, password: hash, username: userName, usertype });
			// to invite read
			let invite = await Mail.findOne({ type: "invite", to: email });
			if (!Validator.isEmpty(invite)) {
				await Mail.updateOne({ to: email, type: "invite" }, { is_read: true });
			}
			if (save) {
				// var mailOptions = {
				// 	from: "ameliagenius3@gmail.com",
				// 	to: email,
				// 	subject: 'PinPoint Account verify',
				// 	text: `http://${config.host}:${config.port}${config.baseURL}/auth/user/verify?email=${email}&code=${verifyCode}`
				// };
				// await transporter.sendMail(mailOptions, function (error, info) {
				// 	if (error) {
				// 		console.log(error);
				// 	} else {
				// 		console.log('Email sent: ' + info.response);
				// 	}
				// });
			}
			return res.json({ success: true, msg: 'User register sucess, please login to PinPoint' });
		} catch (error) {
			console.log(error);
			return res.json({ success: false, msg: msg.server.error });
		}
	},
	onUserVerify: async (req, res) => {
		try {
			const { email } = req.query;
			const user = await User.findOne({ $or: [{ email }, { username: email }] });
			if (user) {
				if (user.password === req.password) {
					await User.updateOne({ email }, { verify: true });
					res.redirect('/')
				} else {
					return res.json({ success: false, msg: 'Verify code is wrong' });
				}
			} else {
				return res.json({ success: false, msg: msg.user.not_exist });
			}
		} catch (error) {
			console.log(error);
			return res.json({ success: false, msg: msg.server.error });
		}
	},
	onUserPasswordVerify: async (req, res) => {
		try {
			const { email, code } = req.query;
			const user = await User.findOne({ $or: [{ email }, { username: email }] });
			if (user) {
				if (user.verify) {
					await User.updateOne({ email }, { verify: true });
					res.redirect('/changepwd');
				} else {
					return res.json({ success: false, msg: 'Verify code is wrong' });
				}
			} else {
				return res.json({ success: false, msg: msg.user.not_exist });
			}
		} catch (error) {
			console.log(error);
			return res.json({ success: false, msg: msg.server.error });
		}
	},
	onLostPassword: async (req, res) => {
		try {
			const { userInfo } = req.body;
			if (Validator.isEmpty(userInfo)) {
				return res.json({ success: false, msg: 'Please fill out your email or username' });
			} else {
				let user = await User.findOne({ $or: [{ email: userInfo }, { username: userInfo }] }).exec();
				if (user) {
					if (user.verify) {
						// var mailOptions = {
						// 	from: "ameliagenius3@gmail.com",
						// 	to: email,
						// 	subject: 'PinPoint Account Password Reset',
						// 	text: `http://${config.host}:${config.port}${config.baseURL}/auth/user/pwd/verify?email=${userInfo}`
						// };
						// await transporter.sendMail(mailOptions, function (error, info) {
						// 	if (error) {
						// 		console.log(error);
						// 	} else {
						// 		console.log('Email sent: ' + info.response);
						// 	}
						// });
						return res.json({ success: true, msg: 'Please verify in your mailbox' });
					} else {
						return res.json({ success: false, msg: 'Your account was not verify' });
					}
				} else {
					return res.json({ success: false, msg: 'User not exist' });
				}
			}
		} catch (error) {
			console.log(error)
		}
	},
}

module.exports = authController;