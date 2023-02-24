const jwt = require('jsonwebtoken');
const config = require('../config');

const AccountEmailVerify = async (req, res, next) => {

    if (req.query.code) {
        try {
            // getting the code from url
            const { code } = req.query;
            // Verifying the code
            const decoded = jwt.verify(code, config.JWT_SECRET);
            // get time now
            const now = new Date().getTime();
            // if code was created before 1d over, expired, if not, still available
            if (now - decoded.iat > 1000 * 60 * 60 * 24) {
                return res.json({ success: false, msg: 'Your verify code is expired ' });
            } else {
                req.password = decoded.password;
            }
            next();
        } catch (error) {
            console.log(error);
            return res.json({ success: false, msg: 'Server error' });
        };
    } else {
        return res.json({ success: false, msg: 'Not exist verify code' });
    }
};

module.exports = { AccountEmailVerify };