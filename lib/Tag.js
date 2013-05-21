/**
 * @author Matthew Caruana Galizia <m@m.cg>
 * @license MIT: http://mattcg.mit-license.org/
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

/*jshint node:true*/

'use strict';

var tags = require('../');
var index = require('./data/index');
var registry = require('./data/registry');

module.exports = Tag;

Tag.ERR_DEPRECATED = 1;

function Tag(tag) {
	var types;

	// Lowercase for consistency (case is only a formatting convention, not a standard requirement).
	tag = tag.toLowerCase();

	this.data = {};
	this.data.tag = tag;

	// Check if the input tag is grandfathered or redundant.
	types = index[tag];
	if (types && (types.grandfathered || types.redundant)) {
		this.data.record = registry[types.grandfathered || types.redundant];
		return;
	}
}

Tag.prototype.preferred = function() {
	var preferred = this.data.record['Preferred-Value'];

	if (preferred) {
		return tags(preferred);
	}
};

Tag.prototype.subtags = function() {
	var tag = this.data.tag;

	return tag.split('-').map(function(subtag) {
		return tags.subtag(subtag);
	});
};

Tag.prototype.valid = function() {
	return this.errors().length < 1;
};

Tag.prototype.errors = function() {
	var record, error, data = this.data, errors = [];

	error = function(code) {
		var err, message;

		switch (code) {
		case Tag.ERR_DEPRECATED:
			message = 'The tag \'' + data.tag + '\' is deprecated.';

			// Note that a record that contains a 'Deprecated' field and no corresponding 'Preferred-Value' field has no replacement mapping (RFC 5646 section 3.1.6).
			if (data.record['Preferred-Value']) {
				message += ' Use \'' + data.record['Preferred-Value'] + '\' instead.';
			}

			break;
		}

		err = new Error(message);
		err.code = code;
		errors.push(err);
	};

	// Check if the tag is grandfathered and if the grandfathered tag is deprecated (e.g. no-nyn).
	record = data.record;
	if (record && record.Deprecated) {
		error(Tag.ERR_DEPRECATED);
	}

	return errors;
};

Tag.prototype.type = function() {
	var record = this.data.record;

	if (record) {
		return record.Type;
	}

	return 'tag';
};

Tag.prototype.added = function() {
	var record = this.data.record;

	return record && record.Added;
};

Tag.prototype.deprecated = function() {
	var record = this.data.record;

	return record && record.Deprecated;
};

Tag.prototype.description = function() {
	var record = this.data.record;

	if (record && record.Description) {
		return record.Description;
	}

	return [];
};

Tag.prototype.format = function() {
	var tag = this.data.tag;

	// Format according to algorithm defined in RFC 5646 section 2.1.1.
	return tag.split('-').reduce(function(p, c, i, a) {
		if (i === 0) {
			return c;
		}

		if (a[i - 1].length === 1) {
			return p + '-' + c;
		}

		switch (c.length) {
		case 2:
			return p + '-' + c.toUpperCase();
		case 4:
			return p + '-' + c[0].toUpperCase() + c.substr(1);
		}

		return p + '-' + c;
	});
};
