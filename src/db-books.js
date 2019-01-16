'use strict';

const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const node_uid = require('node-uid');
const logger = require('./logger');

fs.exists(path.resolve(__dirname, '../db/books.db'), function(exists) {
    if (!exists) {
        fs.writeFileSync(
            path.resolve(__dirname, '../db/books.db'),
            '',
            () => {}
        );
    }
});

let db = new sqlite3.Database(
    path.resolve(__dirname, '../db/books.db'),
    sqlite3.OPEN_READWRITE,
    err => {
        if (err) {
            logger.info(err.message);
        }
        logger.info('Connected to the game database.');
    }
);

db.run(
    `CREATE TABLE IF NOT EXISTS books (
        book_id integer PRIMARY KEY, 
        name string NOT NULL,
        description string,
        link string, 
        image string
    );`,
    function() {
        console.log(arguments);
    },
    function(err) {
        console.log(err);
    }
);

function getBooks() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM books', function(err, rows) {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

function findBook(query) {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM books where name LIKE \'%' + query + '%\'', function(err, rows) {
            if (err) {
                console.log(err);
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

function getBook() {
    return null;
}

function postBook(book) {
    return new Promise(async (resolve, reject) => {
        db.run(
            `INSERT INTO 
                    books(book_id, name, description, link, image)
                    VALUES(${new Date().getTime()}, '${book.name}','${
                book.description
            }','${book.link}','${book.image}'
                )`,
            function(err) {
                console.log(err)
                if (err) {
                    return reject(err.message);
                }
                resolve({});
            }
        );
    });
}

function editBook(book) {
    return null;
}

module.exports = {
    getBooks,
    postBook,
    findBook
};
