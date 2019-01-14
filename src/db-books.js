'use strict';

const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const node_uid = require('node-uid')
const saltRounds = 10;

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
        db.all('SELECT * FROM books', function(
            err,
            rows
        ) {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

function getBook() {
    return null
}

function newBook(book) {
    return new Promise(async (resolve, reject) => {
        db.run(
                `INSERT INTO 
                    books(book_id, name, description, link, image)
                    VALUES(${node_uid()}, '${book.name}','${book.description}','${book.link}','${book.image}'
                )`,
                async function(err) {
                    if (err) {
                        return reject(err.message);
                    }
                    resolve({});
                }
            );
    });
}

function editBook(book) {
    return null
}

module.exports = {
    getBooks,
    newBook
};