const config = require('../config');
const authRouther = require('./authRouter');

const Router = (app) => {
    app.use(config.baseURL + '/auth', authRouther);
};

module.exports = Router;