'use strict';

const parse = require('csv-parse');
const fs = require('fs');
const input = fs.readFileSync('./bin/books.csv').toString();
var request = require('request');
parse(
	input,
	{
		columns: true,
		skip_empty_lines: true
	},
	function(err, output) {
		const newFormat = output.filter(singleEntry => Boolean(singleEntry['Название'])).map(singleEntry => {
			return {
				name: singleEntry['Название'],
				description: '',
				author: singleEntry['Автор'],
				genre: singleEntry['Жанр'],
				link: singleEntry['Ссылка'],
				image: null
			};
		});
		newFormat.filter(singleEntry => Boolean(singleEntry.name)).forEach(singleEntry => {
			var options = {
				method: 'POST',
				url: 'http://localhost:5000/api/post-book',
				headers: {
					'cache-control': 'no-cache',
					Connection: 'keep-alive',
					'X-Requested-With': 'XMLHttpRequest',
					Referer: 'http://localhost:5000/',
					Accept: 'application/json, text/plain, */*',
					'Content-Type': 'application/json;charset=UTF-8',
					Authorization:
						'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImxvZ2luIjoiZGt1bmluIn0sImV4cCI6MTU0ODE5MDU4NiwiaWF0IjoxNTQ4MTg2OTg2fQ.5cnKs0D4ebA_6pVZ5l3tb1WTshhwvWSWta05bpnzXO4',
					Origin: 'http://localhost:5000'
				},
				body:
					JSON.stringify(singleEntry)
			};

			request(options, function(error, response, body) {
				if (error) throw new Error(error);

				console.log(body);
			});
		});
	}
);
