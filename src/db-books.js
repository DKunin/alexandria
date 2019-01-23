'use strict';

const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const logger = require('./logger');
var Chance = require('chance');
var chance = new Chance();

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
                b.genre,
                b.link,
                b.author,
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
        logger.info('Connected to the books database.');
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
                    VALUES(${chance.natural()}, ${bookId}, '${login}', ${new Date().getTime()}, 'checkout')`,
            function(err) {
                logger.error(err);
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
                    VALUES(${chance.natural()}, ${bookId}, '${login}', ${new Date().getTime()}, 'checkin')`,
            function(err) {
                logger.error(err);
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
        genre string,
        author string,
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

function getBooks(page = 0) {
    return new Promise((resolve, reject) => {
        db.all(
            booksWithLogsQuery + `GROUP BY b.book_id LIMIT ${page}, 20;`,
            function(err, rows) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows.filter(singleBook => singleBook.name !== ''));
            }
        );
    });
}

function findBook(query) {
    return new Promise((resolve, reject) => {
        db.all(
            booksWithLogsQuery +
                " where name LIKE '%" +
                query +
                "%'" +
                ' GROUP BY b.book_id;',
            function(err, rows) {
                if (err) {
                    logger.error(err);
                    reject(err);
                    return;
                }
                resolve(rows);
            }
        );
    });
}

function getBookLogs(bookId) {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT b.book_id,
                b.name,
                l.login,
                l.date,
                l.action,
                b.description,
                l.book_id AS log_id
FROM   books AS b
       LEFT OUTER JOIN logs AS l
                    ON log_id = b.book_id
where b.book_id = ${bookId};`,
            function(err, rows) {
                if (err) {
                    logger.error(err);
                    reject(err);
                    return;
                }
                resolve(rows);
            }
        );
    });
}

function getGenres() {
    return new Promise((resolve, reject) => {
        db.all(`select distinct genre from books where genre != '';`, function(
            err,
            rows
        ) {
            if (err) {
                logger.error(err);
                reject(err);
                return;
            }
            const filtered = rows
                .reduce((newArray, singleGenre) => {
                    return newArray.concat(singleGenre.genre.split(','))
                },[])
                .map(singleGenre => singleGenre.trim().toLowerCase())
                .sort()
                .reduce((newArray, singleGenre) => {
                    if (newArray[newArray.length - 1] === singleGenre) {
                        return newArray
                    }
                    return newArray.concat([singleGenre]);
                }, []);
            resolve(filtered);
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
                    books(book_id, name, description, genre, author, link, image)
                    VALUES(${chance.natural()}, '${book.name}','${
                book.description
            }','${book.genre}','${book.author}', '${book.link}','${book.image}'
                )`,
            function(err) {
                logger.error(err);
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
// Поиск по жанру
// SELECT b.book_id,
//                 b.name,
//                 l.login,
//                 l.date,
//                 l.action,
//                 b.genre,
//                 b.link,
//                 b.description,
//                 l.book_id AS log_id
// FROM books AS b
//        LEFT OUTER JOIN logs AS l
//                     ON log_id = b.book_id
// where genre like '%Data Science%'  GROUP BY b.name order by l.date desc;

module.exports = {
    getBooks,
    postBook,
    getGenres,
    findBook,
    checkoutBook,
    checkinBook,
    getBookLogs
};
