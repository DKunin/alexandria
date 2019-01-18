'use strict';

const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
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

const booksWithLogsQuery = `
SELECT b.book_id,
                b.name,
                l.login,
                max(l.date) as date,
                l.action,
                b.description,
                l.book_id AS log_id
FROM   books AS b
       LEFT OUTER JOIN logs AS l
                    ON log_id = b.book_id
`;

let db = new sqlite3.Database(
    path.resolve(__dirname, '../db/books.db'),
    sqlite3.OPEN_READWRITE,
    err => {
        if (err) {
            logger.error(err.message);
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

function checkoutBook(bookId, login) {
    return new Promise(async (resolve, reject) => {
        db.run(
            `INSERT INTO 
                    logs(id, book_id, login, date, action)
                    VALUES(${new Date().getTime()}, ${bookId}, '${login}', ${new Date().getTime()}, 'checkout')`,
            function(err) {
                logger.error(err)
                if (err) {
                    return reject(err.message);
                }
                resolve({});
            }
        );
    });
}

function checkinBook(bookId, login) {
    return new Promise(async (resolve, reject) => {
        db.run(
            `INSERT INTO 
                    logs(id, book_id, login, date, action)
                    VALUES(${new Date().getTime()}, ${bookId}, '${login}', ${new Date().getTime()}, 'checkin')`,
            function(err) {
                logger.error(err)
                if (err) {
                    return reject(err.message);
                }
                resolve({});
            }
        );
    });
}

db.run(
    `CREATE TABLE IF NOT EXISTS books (
        book_id integer PRIMARY KEY, 
        name string NOT NULL,
        description string,
        link string, 
        image string
    );`,
    function() {
        logger.info(arguments);
    },
    function(err) {
        logger.error(err);
    }
);

function getBooks() {
    return new Promise((resolve, reject) => {
        db.all(booksWithLogsQuery + ' GROUP BY b.book_id;', function(err, rows) {
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
        db.all(booksWithLogsQuery + ' where name LIKE \'%' + query + '%\'' + ' GROUP BY b.book_id;', function(err, rows) {
            if (err) {
                logger.err(err);
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
                logger.err(err)
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
    findBook,
    checkoutBook,
    checkinBook
};
