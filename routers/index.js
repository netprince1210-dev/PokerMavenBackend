const config = require('../config');
const authRouter = require('./authRouter');
const accountRouter = require('./accountRouter');

const Router = (app) => {
    app.use(config.baseURL + '/user', authRouter);
    app.use(config.baseURL + '/account', accountRouter);
};

module.exports = Router;