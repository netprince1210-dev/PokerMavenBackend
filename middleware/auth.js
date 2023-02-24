const jwt = require('jsonwebtoken')
const config = require('../config');
const Utils = require('../helpers/utils');

const authUser = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            //getting the token............................
            token = req.headers.authorization.split(' ')[1];
            //Verifying the token ........................
            const decoded = jwt.verify(token, config.JWT_SECRET);
            const now = new Date().getTime();
            if (now - decoded.iat > 1000 * 60 * 60 * 24) {
                return res.status(403);
            } else {
                req.user = decoded;
                req.token = Utils.generateToken(decoded);
            }
            next();
        } catch (error) {
            console.log(error);
            res.status(401).json({ succcess: false, msg: "Not Authorized! please login again"})
        };
    }

    if (!token) {
        res.status(401).json({ succcess: false, msg: "Not Authorized! please login again"})
    };

};

module.exports = { authUser };