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
                b.image,
                b.isbn,
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
        location string,
        author string,
        link string,
        isbn integer,
        image string
    );`,
    function() {
        logger.info(arguments);
    },
    function(err) {
        logger.error(err);
    }
);

function countBooks() {
    return new Promise((resolve, reject) => {
        db.all(`select count(name) from books;`, function(err, rows) {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows[0]['count(name)']);
        });
    });
}

function getBooks(page = 0) {
    return new Promise((resolve, reject) => {
        db.all(
            booksWithLogsQuery + `GROUP BY b.book_id LIMIT ${page}, 20;`,
            async function(err, rows) {
                if (err) {
                    reject(err);
                    return;
                }
                const filtered = rows.filter(
                    singleBook => singleBook.name !== ''
                );
                const count = await countBooks();
                resolve({ totalCount: count, books: filtered });
            }
        );
    });
}

function getBooksByHolder(user) {
    return new Promise((resolve, reject) => {
        db.all(
            booksWithLogsQuery +
                `  where login = '${user}' GROUP BY b.book_id;`,
            async function(err, rows) {
                if (err) {
                    reject(err);
                    return;
                }
                const filtered = rows.filter(
                    singleBook =>
                        singleBook.name !== '' &&
                        singleBook.action === 'checkout'
                );
                console.log(filtered);
                resolve({ myBooksCount: filtered.length, myBooks: filtered });
            }
        );
    });
}

function findBook(query) {
    let theQuery = " where (name LIKE '%" + query.text + "%'";
    if (query.genre) {
        theQuery += " or genre LIKE '%" + query.genre + "%'";
    } else {
        theQuery += " or genre LIKE '%" + query.text + "%'";
    }

    if (query.author) {
        theQuery += " and author LIKE '%" + query.author + "%') ";
    } else {
        theQuery += " or author LIKE '%" + query.text + "%') ";
    }
    return new Promise((resolve, reject) => {
        db.all(booksWithLogsQuery + theQuery + ' GROUP BY b.name;', function(
            err,
            rows
        ) {
            if (err) {
                logger.error(err);
                reject(err);
                return;
            }
            resolve(rows);
        });
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
where b.book_id = ${bookId} order by l.date asc;`,
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
                    return newArray.concat(singleGenre.genre.split(','));
                }, [])
                .map(singleGenre => singleGenre.trim().toLowerCase())
                .sort()
                .reduce((newArray, singleGenre) => {
                    if (newArray[newArray.length - 1] === singleGenre) {
                        return newArray;
                    }
                    return newArray.concat([singleGenre]);
                }, []);
            resolve(filtered);
        });
    });
}

function getBooksByGenre(genre) {
    ///  Ужасный костыль с sentenceCase - почему то sqllite чувствителен та таки в like, не смотря на то, что везде пишут обратное
    const sentenceCase = genre
        .split('')
        .reduce((newString, singleLetter, index) => {
            if (index === 0) {
                return (newString += singleLetter.toUpperCase());
            }
            return (newString += singleLetter);
        }, '');
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT b.book_id,
                b.name,
                l.login,
                l.date,
                l.action,
                b.genre,
                b.link,
                b.description,
                l.book_id AS log_id
FROM books AS b
       LEFT OUTER JOIN logs AS l
                    ON log_id = b.book_id
where LOWER(genre) like '%${genre}%' or genre like upper('%${sentenceCase}%') GROUP BY b.name order by l.date desc;`,
            function(err, rows) {
                if (err) {
                    logger.error(err);
                    reject(err);
                    return;
                }
                console.log(rows);
                resolve(rows);
            }
        );
    });
}

function countCheckedOutBooks() {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT b.book_id,
      l.date,
      l.action,
      l.book_id AS log_id
FROM books AS b
       LEFT OUTER JOIN logs AS l
                    ON log_id = b.book_id where l.date is not null group by b.book_id order by l.date desc;`,
            function(err, rows) {
                if (err) {
                    logger.error(err);
                    reject(err);
                    return;
                }
                resolve(
                    rows.filter(singleRow => singleRow.action === 'checkout')
                        .length
                );
            }
        );
    });
}

function getBook(bookId) {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT b.book_id,
                b.name,
                l.login,
                l.action,
                b.description,
                b.genre,
                b.image,
                b.isbn,
                b.link,
                b.author,
                max(l.date) as date,
                l.book_id AS log_id
FROM   books AS b
       LEFT OUTER JOIN logs AS l
                    ON log_id = b.book_id where b.book_id = ${bookId} or b.isbn = ${bookId};`,
            function(err, rows) {
                if (err) {
                    logger.error(err);
                    reject(err);
                    return;
                }
                resolve(rows[0]);
            }
        );
    });
}

function postBook(book) {
    return new Promise(async (resolve, reject) => {
        db.run(
            `INSERT INTO 
                    books(book_id, name, description, genre, author, link, image, isbn)
                    VALUES(?,?,?,?,?,?,?,?)`,
            [
                chance.natural(),
                book.name,
                book.description,
                book.genre,
                book.author,
                book.link,
                book.image,
                book.isbn
            ],
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

function removeBook(bookId) {
    return new Promise(async (resolve, reject) => {
        db.run(`delete from books where book_id = ${bookId}`, function(err) {
            logger.error(err);
            if (err) {
                return reject(err.message);
            }
            resolve({});
        });
    });
}

function updateBook(book) {
    const keys = Object.keys(book).filter(singleKey => singleKey != 'book_id');
    const columsToUpdate = keys
        .map(singleKey => {
            if (book[singleKey]) {
                return `${singleKey} = "${book[singleKey]}"`;
            }
            return null;
        })
        .filter(Boolean)
        .join(', ');
    return new Promise(async (resolve, reject) => {
        db.run(
            `UPDATE books
                SET ${columsToUpdate}
                WHERE book_id = ${book.book_id}`,
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

module.exports = {
    getBooks,
    postBook,
    getBook,
    getGenres,
    findBook,
    checkoutBook,
    checkinBook,
    getBookLogs,
    getBookLogs,
    removeBook,
    updateBook,
    countCheckedOutBooks,
    getBooksByHolder,
    getBooksByGenre
};
