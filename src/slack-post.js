'use strict';

var https = require('https');

module.exports = function({ text, channel, path }) {
    return new Promise(function(resolve, reject) {
        var options = {
            hostname: 'hooks.slack.com',
            path,
            method: 'POST'
        };

        var payload1 = {
            channel,
            username: '',
            text
        };

        var req = https.request(options, function(res) {
            res.setEncoding('utf8');
            let str = '';
            res.on('data', function(chunk) {
                str += chunk;
            });
            res.on('end', function() {
                resolve(str);
            });
        });

        req.on('error', function(e) {
            reject('problem with request: ' + e.message);
        });
        req.write(JSON.stringify(payload1));
        req.end();
    });
};
