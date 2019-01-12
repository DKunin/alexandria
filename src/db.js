'use strict';

const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const saltRounds = 10;

let db = new sqlite3.Database(
    path.resolve(__dirname, './db/users.db'),
    sqlite3.OPEN_READWRITE,
    err => {
        if (err) {
            logger.info(err.message);
        }
        logger.info('Connected to the game database.');
    }
);


db.run(
    'CREATE TABLE IF NOT EXISTS users (user_id integer PRIMARY KEY, email string NOT NULL, password string NOT NULL);',
    function() {
        console.log(arguments);
    },
    function(err) {
        console.log(err);
    }
);

function getUsers() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM users', function(
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

function checkUser(user) {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM users', function(
            err,
            rows
        ) {
            if (err) {
                reject(err);
                return;
            }

            console.log(rows);
            resolve(rows);
        });
    });
}

function newUser(user) {
    return new Promise(async (resolve, reject) => {
        bcrypt.hash(user.password, saltRounds, function(err, hash) {
            db.run(
                `INSERT INTO users(user_id, email, password) VALUES(${Date.now()}, '${user.email}','${hash}')`,
                async function(err) {
                    if (err) {
                        return reject(err.message);
                    }
                    resolve({});
                }
            );
        });
    });
}

module.exports = {
    getUsers,
    newUser,
    checkUser
};