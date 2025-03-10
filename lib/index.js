/**
 * @author Matthew Caruana Galizia <mattcg@gmail.com>
 * @license MIT: http://mattcg.mit-license.org/
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

import Tag from './Tag.js';
import Subtag from './Subtag.js';

import index from 'language-subtag-registry/data/json/index.json' with { type: 'json' };
import registry from 'language-subtag-registry/data/json/registry.json' with { type: 'json' };
import meta from 'language-subtag-registry/data/json/meta.json' with { type: 'json' };
import macrolanguages from 'language-subtag-registry/data/json/macrolanguage.json' with { type: 'json' };

const tags = function(tag) {
	return new Tag(tag);
};

export default tags;

tags.check = function(tag) {
	return new Tag(tag).valid();
};

tags.types = function(subtag) {
	var types = index[subtag.toLowerCase()];

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

tags.search = function(query, all) {
	var test;

	if ('function' === typeof query.test) {
		test = function(description) {
			return query.test(description);
		};

	// If the query is all lowercase, make a case-insensitive match.
	} else if (query.toLowerCase() === query) {
		test = function(description) {
			return -1 !== description.toLowerCase().indexOf(query);
		};
	} else {
		test = function(description) {
			return -1 !== description.indexOf(query);
		};
	}

	return registry.filter(function(record) {
		if (!record.Subtag && !all) {
			return false;
		}

		return record.Description.some(test);

	// Sort by matched description string length.
	// This is a quick way to push precise matches towards the top.
	}).sort(function(a, b) {
		return Math.min.apply(Math, a.Description.filter(test).map(function(description) {
			return description.length;
		})) - Math.min.apply(Math, b.Description.filter(test).map(function(description) {
			return description.length;
		}));
	}).map(function(record) {
		if (record.Subtag) {
			return new Subtag(record.Subtag, record.Type);
		}

		return new Tag(record.Tag);
	});
};

tags.languages = function(macrolanguage) {
	var i, l, record, results = [];

	macrolanguage = macrolanguage.toLowerCase();
	if (!macrolanguages[macrolanguage]) {
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
	var types = typeof subtag === 'string' && index[subtag.toLowerCase()];

	if (types && types[type]) {
		return new Subtag(subtag, type);
	}

	return null;
};

tags.date = function() {
	return meta['File-Date'];
};
