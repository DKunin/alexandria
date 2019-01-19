'use strict';

const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const express = require('express');
const slackPost = require('./slack-post');
const { SLACK_BOT_SERVICE, JWT_SECRET } = process.env;
const dbUsers = require('./db-users');
const dbBooks = require('./db-books');
const logger = require('./logger');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

app.use( (req, res, done) => {
    logger.info(req.originalUrl);
    done();
});

var testUser = { login: 'dkunin', code: '1234' };

app.post('/api/generate-code', (req, res) => {
    const userName = req.body.username;

    dbUsers
        .generateCodeForLogin(userName)
        .then(generatedCode => {
            slackPost({
                text: generatedCode,
                channel: '@dkunin',
                path: SLACK_BOT_SERVICE
            });
            res.status(200).send({
                success: true
            });
        })
        .catch(error => {
            logger.error(error)
            res.status(403).send({
                error: error.message
            });
        });
});

app.post('/api/validate-code', (req, res) => {
    // Проверка сгенерированного кода
    if (req.body) {
        var pair = req.body;
        dbUsers
            .checkCodeForLogin(pair)
            .then(data => {
                let user = {
                    login: pair.login
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
                    var token = jwt.sign(
                        { user, exp: Math.floor(Date.now() / 1000) + 60 * 60 },
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

app.get('/api/get-books', jwtValidateMiddleware, (req, res) => {
    dbBooks.getBooks().then(result => {
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
        dbBooks.findBook(req.body.query).then(result => {
            res.json(result);
        });
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

app.get('/messages/:login', jwtValidateMiddleware, (req, res) => {
    if (req.body) {
        res.json({ error: 'in development' })
    } else {
        res.json({ error: 'no body' });
    }
});

app.listen(5000, () => console.log('Server started on port 5000'));
