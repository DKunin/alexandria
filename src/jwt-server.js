'use strict';

const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const express = require('express');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const JWT_SECRET = process.env.JWT_SECRET;

var testUser = { email: 'kelvin@gmai.com', password: '1234' };

app.post('/api/authenticate', (req, res) => {
    if (req.body) {
        var user = req.body;
        if (
            testUser.email === req.body.email &&
            testUser.password === req.body.password
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
    const token = req.headers.authorization.split(' ')[1];
    try {
        jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        console.log(err);
        res.send(401, 'na-ah');
    }
};

app.get('/', jwtValidateMiddleware, (req, res) => {
    res.send('home');
});

app.get('/another', jwtValidateMiddleware, (req, res) => {
    res.send('another');
});

app.listen(5000, () => console.log('Server started on port 5000'));
