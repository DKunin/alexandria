'use strict';

const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const Chance = require('chance');
const chance = new Chance();
const logger = require('./logger');

let db = new sqlite3.Database(
    path.resolve(__dirname, '../db/users.db'),
    sqlite3.OPEN_READWRITE,
    err => {
        if (err) {
            throw new Error(err);
            logger.info(err.message);
        }
        logger.info('Connected to the game database.');
    }
);

db.run(
    'CREATE TABLE IF NOT EXISTS users (id string PRIMARY KEY, login string NOT NULL, code string NOT NULL);',
    function() {
        console.log(arguments);
    },
    function(err) {
        console.log(err);
    }
);

function generateCodeForLogin(user) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM users where login = "${user}"`, function(
            err,
            rows
        ) {
            if (err) {
                reject(err);
                return;
            }
            if (rows && rows.length) {
                reject('already exists');
                return;
            }
            const randomNumber = chance.prime({ min: 1000, max: 9999 });
            db.run(
                `INSERT INTO users(id, login, code) VALUES(${new Date().getTime()}, '${user}','${randomNumber}')`,
                function(err) {
                    if (err) {
                        console.log(err);
                        return reject(err.message);
                    }
                    resolve(randomNumber);
                }
            );
        });
    });
}

function checkCodeForLogin(pair) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM users where login = "${pair.login}";`, function(
            err,
            rows
        ) {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
            db.run(`DELETE FROM users where login = "${pair.login}";`);
        });
    });
}

// function getUsers() {
//     return new Promise((resolve, reject) => {
//         db.all('SELECT * FROM users', function(
//             err,
//             rows
//         ) {
//             if (err) {
//                 reject(err);
//                 return;
//             }
//             resolve(rows);
//         });
//     });
// }

// function checkUser(user) {
//     return new Promise((resolve, reject) => {
//         db.all('SELECT * FROM users', function(
//             err,
//             rows
//         ) {
//             if (err) {
//                 reject(err);
//                 return;
//             }

//             console.log(rows);
//             resolve(rows);
//         });
//     });
// }

// function newUser(user) {
//     return new Promise(async (resolve, reject) => {
//         bcrypt.hash(user.password, saltRounds, function(err, hash) {
//             db.run(
//                 `INSERT INTO users(id, email, password) VALUES(${Date.now()}, '${user.email}','${hash}')`,
//                 async function(err) {
//                     if (err) {
//                         return reject(err.message);
//                     }
//                     resolve({});
//                 }
//             );
//         });
//     });
// }

module.exports = {
    generateCodeForLogin,
    checkCodeForLogin
    // getUsers
};
