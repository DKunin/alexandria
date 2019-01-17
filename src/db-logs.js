'use strict';

const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const logger = require('./logger');


fs.exists(path.resolve(__dirname, '../db/logs.db'), function(exists) {
    if (!exists) {
        fs.writeFileSync(
            path.resolve(__dirname, '../db/logs.db'),
            '',
            () => {}
        );
    }
});


let db = new sqlite3.Database(
    path.resolve(__dirname, '../db/logs.db'),
    sqlite3.OPEN_READWRITE,
    err => {
        if (err) {
            logger.info(err.message);
        }
        logger.info('Connected to the game database.');
    }
);

db.run(
    `CREATE TABLE IF NOT EXISTS logs (
        id integer PRIMARY KEY,
        book_id string NOT NULL,
        login string NOT NULL,
        date int NOT NULL,
        action string NOT NULL
    );`,
    function() {
        logger.info(arguments);
    },
    function(err) {
        logger.error(err);
    }
);

function checkoutBook() {
    
}

function checkinBook() {

}

module.exports = {

};