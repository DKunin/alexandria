'use strict';

const fs = require('fs');
var request = require('request');
var parseString = require('xml2js').parseString;
const async = require('async');
const logger = require('./logger');

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
					logger.error(err);
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
						name: bestBook.title[0],
						description: bestBook.description[0],
						image: bestBook.image_url[0],
						link: bestBook.link[0],
						author: authors,
						isbn: bestBook.isbn13[0]
					};
					resolve(bookData);
				} catch (err) {
					resolve({});
				}
			});
		});
	});
}

module.exports = function(isbn) {
	return new Promise(resolve => {
		getBook(isbn)
			.then(initialBook => {
				if (!initialBook) {
					resolve({});
					return;
				}
				if (!initialBook.id) {
					resolve(initialBook);
					return;
				}
				getBookInfo(initialBook.id).then(moreDetails => {
					const detailedObject = Object.assign(
						{},
						initialBook,
						moreDetails
					);
					resolve(detailedObject);
				});
		});
	});
};
