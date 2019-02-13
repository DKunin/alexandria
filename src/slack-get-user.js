'use strict';

var request = require('request');

const { SLACK_BOT_SERVICE, SLACK_ADDRESS, SLACK_AVATAR_TOKEN } = process.env;

module.exports = function(username) {
    return new Promise((resolve, reject) => {
        var options = {
            method: 'GET',
            url: 'https://slack.com/api/users.profile.get',
            qs: {
                token: SLACK_AVATAR_TOKEN,
                user: username
            }
        };

        request(options, function(error, response, body) {
            if (error) reject(error);

            resolve(JSON.parse(body));
        });
    });
};
