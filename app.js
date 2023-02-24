const express = require('express');
const winston = require('winston');
const bodyParser = require('body-parser');
const cors = require('cors');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const path = require('path');
const serveStatic = require('serve-static');
const http = require('http');
const swaggerUi = require('swagger-ui-express');
const consoleTransport = new winston.transports.Console()
const myWinstonOptions = {
    transports: [consoleTransport]
}
const logger = new winston.createLogger(myWinstonOptions)

function logRequest(req, res, next) {
    logger.info(req.url)
    next()
}

function logError(err, req, res, next) {
    logger.error(err)
    next()
}
require('dotenv').config();
// ------------------------------------------------
/**
 * Define Router
 */
const router = require('./routers');
/**
 * MongoDB connect
 */
const con = require('./db/connection');
con();
/**
 * Swagger UI setting
 */
const swaggerDocument = require('./config/swagger.json');
const { Socket } = require('./helpers/socket');
var options = {
    swaggerOptions: {
        validatorUrl: null
    }
};
// ------------------------------------------------

const app = express();
/**
 * For Logger
 */
app.use(logRequest);
app.use(logError);


app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(cookieParser());
/**
 * File upload setting
 */
app.use(
    fileUpload({
        limits: {
            fileSize: 10000000,
        },
        abortOnLimit: true,
    })
);
/**
 * Static file path setting
 */
app.use(serveStatic(path.join(__dirname, 'public')));
/**
 * Swagger setting
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));
/**
 * API routers
 */
router(app);
const server = http.createServer(app);
Socket(server);
server.listen(8080, () => {
    console.log(`PinPoint Server is listening on port ${8080}`);
});