'use strict';

const parse = require('csv-parse');
const fs = require('fs');
const input = fs.readFileSync('./bin/books.csv').toString();
var request = require('request');
var parseString = require('xml2js').parseString;
const async = require('async');
const { GOODREADS_KEY } = process.env;

function getBook(title) {
	return new Promise((resolve, reject) => {
		var options = {
			method: 'GET',
			url: 'https://www.goodreads.com/search/index.xml',
			qs: { key: GOODREADS_KEY, q: title }
		};

		request(options, function(error, response, body) {
			if (error) {
				resolve(error);
				return;
			}
			parseString(body, function(err, result) {
				if (err) {
					resolve(error);
					return;
				}
				try {
					const bestBook =
						result.GoodreadsResponse.search[0].results[0].work[0]
							.best_book[0];
					const bookData = {
						id: bestBook.id[0]['_'],
						title: bestBook.title[0],
						image: bestBook.image_url[0]
					};
					resolve(bookData);
				} catch (err) {
					resolve({ id: null, title: null, image: null });
				}
			});
		});
	});
}

function getBookInfo(id) {
	return new Promise((resolve, reject) => {
		var options = {
			method: 'GET',
			url: `https://www.goodreads.com/book/show/${id}.xml`,
			qs: { key: GOODREADS_KEY },
			headers: {}
		};

		request(options, function(error, response, body) {
			if (error) {
				resolve({});
			}
			parseString(body, function(err, result) {
				if (err) {
					resolve({});
					return;
				}

				try {
					const bestBook = result.GoodreadsResponse.book[0];
					const authors = bestBook.authors[0].author
						.map(({ name }) => name)
						.join(',');
					const bookData = {
						isbn: bestBook.isbn13[0],
						link: bestBook.link[0],
						author: authors,
						description: bestBook.description[0],
						image: bestBook.image_url[0]
					};
					resolve(bookData);
				} catch (err) {
					resolve({});
				}
			});
		});
	});
}

function postBook(book, callback) {
	console.log(book);
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
		body: JSON.stringify(book)
	};

	request(options, function(error, response, body) {
		if (error) {
			console.error(error);
		}
		callback();
	});
}

var q = async.queue(function(singleEntry, callback) {
	getBook(singleEntry.name).then(initialBook => {
		if (!initialBook.id) {
			postBook(singleEntry, callback);
			return;
		}
		getBookInfo(initialBook.id).then(moreDetails => {
			const detailedObject = Object.assign(
				{},
				singleEntry,
				initialBook,
				moreDetails
			);

			postBook(detailedObject, callback);
		});
	});
}, 1);

// assign a callback
q.drain = function() {
	console.log('all items have been processed');
};

parse(
	input,
	{
		columns: true,
		skip_empty_lines: true
	},
	function(err, output) {
		const newFormat = output
			.filter(singleEntry => Boolean(singleEntry['Название']))
			.map(singleEntry => {
				return {
					name: singleEntry['Название'],
					description: '',
					author: singleEntry['Автор'],
					genre: singleEntry['Жанр'],
					link: singleEntry['Ссылка'],
					image: null,
					isbn: null
				};
			});
		newFormat
			.filter(singleEntry => Boolean(singleEntry.name))
			.sort()
			.reduce((newArray, singleBook) => {
				if (
					newArray[newArray.length - 1] &&
					newArray[newArray.length - 1].name === singleBook.name
				) {
					return newArray;
				}
				return newArray.concat([singleBook]);
			}, [])
			.forEach(async singleEntry => {
				q.push(singleEntry, function(err) {
					if (err) {
						console.error(err);
					}
					console.log(`finished: ${singleEntry.name}`);
				});
			});
	}
);
