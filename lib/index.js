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

export function tags(tag) {
	return new Tag(tag);
};

export function check(tag) {
	return new Tag(tag).valid();
};

export function types(subtag) {
	var types = index[subtag.toLowerCase()];

	if (!types) {
		return [];
	}

	return Object.keys(types).filter(function(type) {
		return type !== 'grandfathered' && type !== 'redundant';
	});
};

export function subtags(subtags) {
	var result = [];

	if (!Array.isArray(subtags)) {
		subtags = [subtags];
	}

	subtags.forEach(function(subtag) {
		types(subtag).forEach(function(type) {
			result.push(new Subtag(subtag, type));
		});
	});

	return result;
};

export function filter(subtags) {
	return subtags.filter(function(subtag) {
		return !types(subtag).length;
	});
};

export function search(query, all) {
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

export function languages(macrolanguage) {
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

export function language(subtag) {
	return type(subtag, 'language');
};

export function region(subtag) {
	return type(subtag, 'region');
};

export function type(subtag, type) {
	var types = typeof subtag === 'string' && index[subtag.toLowerCase()];

	if (types && types[type]) {
		return new Subtag(subtag, type);
	}

	return null;
};

export function date() {
	return meta['File-Date'];
};

// todo: remove in v3
// see: https://github.com/mattcg/language-tags/pull/30
tags.check = check;
tags.types = types;
tags.subtags = subtags;
tags.filter = filter;
tags.search = search;
tags.languages = languages;
tags.language = language;
tags.region = region;
tags.type = type;
tags.date = date;
export default tags;
