'use strict';

const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const Chance = require('chance');
const chance = new Chance();
const logger = require('./logger');

fs.exists(path.resolve(__dirname, '../db/users.db'), function(exists) {
    if (!exists) {
        fs.writeFileSync(
            path.resolve(__dirname, '../db/users.db'),
            '',
            () => {}
        );
    }
});

let db = new sqlite3.Database(
    path.resolve(__dirname, '../db/users.db'),
    sqlite3.OPEN_READWRITE,
    err => {
        if (err) {
            throw new Error(err);
            logger.info(err.message);
        }
        logger.info('Connected to the useres database.');
    }
);

db.run(
    `CREATE TABLE IF NOT EXISTS users (
    id string PRIMARY KEY,
    login string NOT NULL,
    fullName string,
    displayName string,
    avatar string,
    code string NOT NULL
    );`,
    function() {
        logger.info(arguments);
    },
    function(err) {
        logger.error(err);
    }
);

function generateCodeForLogin(user) {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT * FROM users where login = "${user}"`,
            function(err, rows) {
                if (err) {
                    reject(err);
                    return;
                }
                if (rows && rows.length) {
                    resolve(rows[0].code);
                    return;
                }
                const randomNumber = chance.prime({ min: 1000, max: 9999 });
                db.run(
                    `INSERT INTO users(
                        id, login, code, fullName,displayName, avatar
                    ) VALUES(${new Date().getTime()}, '${user.login}','${randomNumber}', '${user.fullName}', '${user.displayName}', '${user.avatar}' )`,
                    function(err) {
                        if (err) {
                            logger.error(err);
                            return reject(err.message);
                        }
                        resolve(randomNumber);
                    }
                );
            }
        );
    });
}

function checkCodeForLogin(pair) {
    return new Promise((resolve, reject) => {
        console.log('pair', pair)
        db.all(
            `SELECT * FROM users where login = "${pair.login}";`,
            function(err, rows) {
                console.log(pair, err, rows);
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
                db.run(
                    `DELETE FROM users where login = "${pair.login}";`
                );
            }
        );
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
