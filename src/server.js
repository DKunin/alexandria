'use strict';

const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const express = require('express');
const slackPost = require('./slack-post');
const slackGetUser = require('./slack-get-user');
const {
    SLACK_BOT_SERVICE,
    JWT_SECRET,
    SLACK_ADDRESS,
    SERVICE_ADDRESS
} = process.env;
const dbUsers = require('./db-users');
const dbBooks = require('./db-books');
const logger = require('./logger');
const fetchBookByIsbn = require('./fetch-book-by-isbn');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

app.use((req, res, done) => {
    logger.info(req.originalUrl);
    done();
});

app.post('/api/generate-code', (req, res) => {
    const userName = req.body.username;

    slackGetUser(userName)
        .then(result => {
            const user = {
                login: userName,
                fullName: result.profile.real_name,
                displayName: result.profile.display_name,
                avatar: result.profile.image_original
            }
            return user;
        }).then(userObject => {
            dbUsers
                .generateCodeForLogin(userObject)
                .then(generatedCode => {
                    slackPost({
                        text: `${SERVICE_ADDRESS}/#/books?code=${generatedCode}`,
                        channel: '@' + userObject.displayName,
                        path: SLACK_BOT_SERVICE
                    });

                    res.status(200).send({
                        success: true
                    });
                })
                .catch(error => {
                    logger.error(error);
                    console.log(error);
                    res.status(403).send({
                        error
                    });
                });

        })


});

app.post('/api/validate-code', (req, res) => {
    // Проверка сгенерированного кода
    if (req.body) {
        var pair = req.body;
        dbUsers
            .checkCodeForLogin(pair)
            .then(data => {
                let user = {
                    login: pair
                };
                if (!data || !data[0]) {
                    throw new Error(
                        'no code for this login, please request code again'
                    );
                }
                if (
                    data[0].login === pair.login &&
                    data[0].code === pair.code
                ) {
                    console.log('data', data);
                    var token = jwt.sign(
                        { user: {
                            login: data[0].login,
                            fullName: data[0].fullName,
                            displayName: data[0].displayName,
                            avatar: data[0].avatar
                        }, exp: Math.floor(Date.now() / 1000) + 60 * 60 },
                        JWT_SECRET
                    );
                    res.status(200).send({
                        signed_user: user,
                        token: token
                    });
                } else {
                    throw new Error('wrong code');
                }
            })
            .catch(error => {
                res.status(403).send({
                    errorMessage: error.message
                });
            });
    } else {
        res.status(403).send({
            errorMessage: 'Please provide valid login and code'
        });
    }
});

const jwtValidateMiddleware = (req, res, next) => {
    const token = (req.headers.authorization || '').split(' ')[1];
    try {
        jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });
        next();
    } catch (err) {
        logger.error(err);
        res.send(401, { error: 'unauthorized' });
    }
};

app.get('/api/get-books', (req, res) => {
    dbBooks.getBooks(req.query.page || 0).then(result => {
        res.json(result);
    });
});

app.post('/api/post-book', jwtValidateMiddleware, (req, res) => {
    if (req.body) {
        dbBooks.postBook(req.body).then(result => {
            res.json(result);
        });
    } else {
        res.json({ error: 'no body' });
    }
});

app.post('/api/find-book', jwtValidateMiddleware, (req, res) => {
    if (req.body) {
        if (/^\d+$/.test(req.body.query.text)) {
            dbBooks.getBook(req.body.query.text).then(result => {
                res.json([result].filter(({ book_id }) => book_id !== null));
            });
        } else {
            dbBooks.findBook(req.body.query).then(result => {
                console.log(result);
                res.json(result);
            });
        }

    } else {
        res.json({ error: 'no body' });
    }
});

app.post('/api/checkout-book', jwtValidateMiddleware, (req, res) => {
    if (req.body) {
        dbBooks.checkoutBook(req.body.book_id, req.body.login).then(result => {
            res.json(result);
        });
    } else {
        res.json({ error: 'no body' });
    }
});

app.post('/api/checkin-book', jwtValidateMiddleware, (req, res) => {
    if (req.body) {
        dbBooks.checkinBook(req.body.book_id, req.body.login).then(result => {
            res.json(result);
        });
    } else {
        res.json({ error: 'no body' });
    }
});

app.post('/api/book-log', jwtValidateMiddleware, (req, res) => {
    if (req.body) {
        dbBooks.getBookLogs(req.body.book_id).then(result => {
            res.json(result);
        });
    } else {
        res.json({ error: 'no body' });
    }
});

app.get('/messages/:login', (req, res) => {
    res.redirect(SLACK_ADDRESS + req.params.login);
});

app.get('/api/genres', (req, res) => {
    dbBooks.getGenres().then(result => {
        res.json(result);
    });
});

app.get('/api/count-checked-out-books', (req, res) => {
    dbBooks.countCheckedOutBooks().then(result => {
        res.json(result);
    });
});

app.get('/api/get-book/:bookId', jwtValidateMiddleware, (req, res) => {
    dbBooks.getBook(req.params.bookId).then(result => {
        res.json(result);
    });
});

app.post('/api/remove-book', jwtValidateMiddleware, (req, res) => {
    dbBooks.removeBook(req.body.bookId).then(result => {
        res.json(result);
    });
});

app.post('/api/update-book', jwtValidateMiddleware, (req, res) => {
    dbBooks.updateBook(req.body).then(result => {
        res.json(result);
    });
});

app.post('/api/find-book-by-genre', (req, res) => {
    dbBooks.getBooksByGenre(req.body.genre).then(result => {
        res.json(result);
    });
});

app.post('/api/my-checked-out-books', (req, res) => {
    dbBooks.getBooksByHolder(req.body.user.displayName).then(result => {
        res.json(result);
    });
});

app.get('/api/get-book-by-isbn', (req, res) => {
    fetchBookByIsbn(req.query.isbn).then(result => {
        res.json(result);
    });
});

app.listen(5000, () => console.log('Server started on port 5000'));
