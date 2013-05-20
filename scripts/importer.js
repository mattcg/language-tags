/**
 * @author Matthew Caruana Galizia <m@m.cg>
 * @license MIT: http://mattcg.mit-license.org/
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

/*jshint node:true*/

'use strict';

var IANA_RAW_CACHE = __dirname + '/cache/language-subtag-registry';
var OUT_DIR = __dirname + '/../lib';

var assert = require('assert');
var http = require('http');
var zlib = require('zlib');
var fs = require('fs');

exports.run = run;

function convert() {
	var records, registry = [], index = {}, types = {}, scopes = {};

	records = fs.readFileSync(IANA_RAW_CACHE, {
		encoding: 'utf8'
	}).split('%%');

	write('meta', parseRecord(records.shift()));

	records.forEach(function(record) {
		var i, tag, type;

		record = parseRecord(record);

		// Grandfathered records have only 'Tag'; everything else has 'Subtag'.
		tag = record.Subtag || record.Tag;
		type = record.Type;

		assert(tag);
		assert(type);

		// Registry is a flat array of items, containing all data.
		i = registry.push(record) - 1;
		if (!types[type]) {
			types[type] = {};
		}

		// Convert names to lowercase for predictable lookup. RCF 5646 defines them as being case insensitive anyway. Case formatting is only a convention.
		tag = tag.toLowerCase();

		types[type][tag] = i;

		if (!index[tag]) {
			index[tag] = {};

		// Assert that data is not being overwritten.
		} else {
			assert(!index[tag][type]);
		}

		// Index is a reverse of the registry, for performing lookups by tag.
		index[tag][type] = i;

		// Add convenience scope lists too.
		if (record.Scope) {
			if (!scopes[record.Scope]) {
				scopes[record.Scope] = {};
			}

			scopes[record.Scope][tag] = i;
		}
	});

	write('registry', registry);
	write('index', index);

	Object.keys(types).forEach(function(type) {
		write(type, types[type]);
	});

	Object.keys(scopes).forEach(function(scope) {
		write(scope, scopes[scope]);
	});
}

function write(name, object) {
	fs.writeFileSync(OUT_DIR + '/' + name + '.json', JSON.stringify(object) + '\n');
}

function parseRecord(record) {
	var n;

	return record.trim().split('\n').reduce(function(out, line) {
		var c, v;

		// Every line after the first in a multiline record starts with two spaces.
		if (line.substr(0, 2) === '  ') {
			c = 0;
		} else {
			c = line.indexOf(':');
			n = line.substr(0, c);
		}

		v = line.substr(c + 2);

		// RFC 5646: Field-names MUST NOT occur more than once per record, with the exception of the 'Description', 'Comments', and 'Prefix' fields.
		switch (n) {
		case 'Description':
		case 'Comments':
		case 'Prefix':
			if (!out[n]) {
				out[n] = [v];
			} else {
				out[n].push(v);
			}
			break;
		default:
			out[n] = v;
		}

		return out;
	}, {});
}

function run(callback) {
	var options;

	options = {
		hostname: 'www.iana.org',
		path: '/assignments/language-subtag-registry',
		headers: {
			'Accept-Encoding': 'gzip,deflate',
			'Accept-Charset': 'utf-8'
		}
	};

	if (fs.existsSync(IANA_RAW_CACHE)) {
		options.headers['If-Modified-Since'] = fs.statSync(IANA_RAW_CACHE).mtime.toUTCString();
	}

	http.get(options, function(res) {
		var output, encoding;

		if (res.statusCode === 304) {
			convert();
			if (callback) {
				callback();
			}

			return;
		}

		output = fs.createWriteStream(IANA_RAW_CACHE);

		encoding = res.headers['content-encoding'];
		if (encoding === 'gzip' || encoding === 'deflate') {
			res.pipe(zlib.createUnzip()).pipe(output);
		} else {
			res.pipe(output);
		}

		res.on('end', function() {
			convert();
			if (callback) {
				callback();
			}
		});
	});
}
