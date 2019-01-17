'use strict';

const winston = require('winston');

const logger = winston.createLogger({
    transports: [
    	new winston.transports.File({ filename: '../logs/combined.log' }),
        new winston.transports.Console()
    ]
});


module.exports = {
    info: logger.info,
    warn: logger.warn,
    error: logger.error
};