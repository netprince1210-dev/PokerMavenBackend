const config = require('../config');
const authRouther = require('./authRouter');
const baseRouter = require('./baseRouter');
const contactRouter = require('./contactRouter');
const mailRouter = require('./mailRouter');
const profileRouter = require('./profileRouter');

const Router = (app) => {
    app.use(config.baseURL + '/auth', authRouther);
    app.use(config.baseURL + '/base', baseRouter);
    app.use(config.baseURL + '/contact', contactRouter);
    app.use(config.baseURL + '/mail', mailRouter);
    app.use(config.baseURL + '/profile', profileRouter);
};

module.exports = Router;