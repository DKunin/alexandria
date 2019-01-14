'use strict';

const path = require('path');
const sqlite3 = require('sqlite3').verbose();

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
        console.log(arguments);
    },
    function(err) {
        console.log(err);
    }
);

function checkoutBook() {
    
}

function checkinBook() {

}

module.exports = {

};