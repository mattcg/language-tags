/**
 * @author Matthew Caruana Galizia <m@m.cg>
 * @license MIT: http://mattcg.mit-license.org/
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

/*jshint node:true*/

'use strict';

var Tag = require('./Tag');
var Subtag = require('./Subtag');

var index = require('language-subtag-registry/data/json/index');
var registry = require('language-subtag-registry/data/json/registry');

var tags = function(tag) {
	return new Tag(tag);
};

module.exports = tags;

tags.check = function(tag) {
	return new Tag(tag).valid();
};

tags.types = function(subtag) {
	var types = index[subtag];

	if (!types) {
		return [];
	}

	return Object.keys(types).filter(function(type) {
		return type !== 'grandfathered' && type !== 'redundant';
	});
};

tags.subtags = function(subtags) {
	var result = [];

	if (!Array.isArray(subtags)) {
		subtags = [subtags];
	}

	subtags.forEach(function(subtag) {
		tags.types(subtag).forEach(function(type) {
			result.push(new Subtag(subtag, type));
		});
	});

	return result;
};

tags.filter = function(subtags) {
	return subtags.filter(function(subtag) {
		return !tags.types(subtag).length;
	});
};

tags.search = function(description, all) {
	var i, l, test, push, results = [];

	push = function(record) {
		if (record.Subtag) {
			results.push(new Subtag(record.Subtag, record.Type));
		} else if (all) {
			results.push(new Tag(record.Tag));
		}
	};

	if ('string' === typeof description) {
		description = description.toLowerCase();

		test = function(record) {
			if (-1 !== record.Description.join(', ').toLowerCase().indexOf(description)) {
				push(record);
			}
		};
	} else if ('function' === typeof description.test) {
		test = function(record) {
			if (description.test(record.Description.join(', '))) {
				push(record);
			}
		};
	}

	for (i = 0, l = registry.length; i < l; i++) {
		test(registry[i]);
	}

	return results;
};

tags.languages = function(macrolanguage) {
	var i, l, record, results = [];

	macrolanguage = macrolanguage.toLowerCase();
	if (!require('language-subtag-registry/data/json/macrolanguage')[macrolanguage]) {
		throw new Error('\'' + macrolanguage + '\' is not a macrolanguage.');
	}

	for (i = 0, l = registry.length; i < l; i++) {
		record = registry[i];
		if (record.Macrolanguage === macrolanguage) {
			results.push(new Subtag(record.Subtag, record.Type));
		}
	}

	return results;
};

tags.language = function(subtag) {
	return tags.type(subtag, 'language');
};

tags.region = function(subtag) {
	return tags.type(subtag, 'region');
};

tags.type = function(subtag, type) {
	var types = index[subtag.toLowerCase()];

	if (types && types[type]) {
		return new Subtag(subtag, type);
	}

	return null;
};

tags.date = function() {
	return require('language-subtag-registry/data/json/meta')['File-Date'];
};
