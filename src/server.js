'use strict';

const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const express = require('express');
const slackPost = require('./slack-post');
const { SLACK_BOT_SERVICE, JWT_SECRET } = process.env;


const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'))

var testUser = { login: 'dkunin', code: '1234' };

app.post('/api/check-code', (req, res) => {
    // Генерация кода для пользователя и запись его в базу
    slackPost({
        text: 'testi',
        channel: '@dkunin',
        path: SLACK_BOT_SERVICE
    });
    res.status(200).send({
        success: true
    });
});
app.post('/api/validate-code', (req, res) => {
    // Проверка сгенерированного кода
    if (req.body) {
        var pair = req.body;
        if (
            testUser.login === req.body.login &&
            testUser.code === req.body.code
        ) {
            let user = {
                login: pair.login
            }
            var token = jwt.sign(
                { user, exp: Math.floor(Date.now() / 1000) + 60 * 60 },
                JWT_SECRET
            );
            res.status(200).send({
                signed_user: user,
                token: token
            });
        } else {
            res.status(403).send({
                errorMessage: 'Authorisation required!'
            });
        }
    } else {
        res.status(403).send({
            errorMessage: 'Please provide email and password'
        });
    }
});

const jwtValidateMiddleware = (req, res, next) => {
    const token = (req.headers.authorization || '').split(' ')[1];
    try {
        jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        console.log(err);
        res.send(401, { error: 'unauthorized' });
    }
};

// app.get('/', (req, res) => {
//     res.send('home');
// });

app.get('/api/get-book', jwtValidateMiddleware, (req, res) => {
    res.json({ok: true});
});

app.listen(5000, () => console.log('Server started on port 5000'));
