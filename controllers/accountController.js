const Validator = require('../helpers/validation');
const msg = require('../const/message');
const config = require('../config');
const pokerAPI = require('../helpers/poker-api.js')
const accountController = {
	getAccounts: async (req, res) => {
		try {
			const accounts = await pokerAPI({
				command: 'AccountsList',
				fields: 'Player,Balance'
			})
			return res.json({ success: true, accounts})
		} catch (e) {
			console.log(e);
			return res.json({ success: false, msg: 'server error' });
		}
	}
}

module.exports = accountController;