/**
 * @author Matthew Caruana Galizia <m@m.cg>
 * @license MIT: http://mattcg.mit-license.org/
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

/*jshint node:true*/

'use strict';

var index = require('./data/index');
var registry = require('./data/registry');

module.exports = Subtag;

Subtag.ERR_NONEXISTENT = 1;
Subtag.ERR_TAG = 2;

function Subtag(subtag, type) {
	var types, err, i, record;

	// Lowercase for consistency (case is only a formatting convention, not a standard requirement).
	subtag = subtag.toLowerCase();
	type = type.toLowerCase();

	types = index[subtag];
	if (!types) {
		err = new Error('Non-existent subtag \'' + subtag + '\'.');
		err.code = Subtag.ERR_NONEXISTENT;
		throw err;
	}

	i = types[type];
	if (!i) {
		err = new Error('Non-existent subtag \'' + subtag + '\' of type \'' + type + '\'.');
		err.code = Subtag.ERR_NONEXISTENT;
		throw err;
	}

	record = registry[i];
	if (!record.Subtag) {
		err = new Error('\'' + subtag + '\' is a \'' + type + '\' tag.');
		err.code = Subtag.ERR_TAG;
		throw err;
	}

	this.data = {};
	this.data.subtag = subtag;
	this.data.record = record;
	this.data.type = type;
}

Subtag.prototype.type = function() {
	return this.data.type;
};

Subtag.prototype.descriptions = function() {

	// Every record has one or more descriptions (stored as an array).
	return this.data.record.Description;
};

Subtag.prototype.preferred = function() {
	var type, preferred = this.data.record['Preferred-Value'];

	if (preferred) {
		type = this.data.type;
		if (type === 'extlang') {
			type = 'language';
		}

		return new Subtag(preferred, type);
	}

	return null;
};

Subtag.prototype.script = function() {
	var script = this.data.record['Suppress-Script'];

	if (script) {
		return new Subtag(script, 'script');
	}

	return null;
};

Subtag.prototype.scope = function() {
	return this.data.record.Scope || null;
};

Subtag.prototype.deprecated = function() {
	return this.data.record.Deprecated || null;
};

Subtag.prototype.added = function() {
	return this.data.record.Added;
};

Subtag.prototype.comments = function() {

	// Comments don't always occur for records, so switch to an empty array if missing.
	return this.data.record.Comments || [];
};

Subtag.prototype.format = function() {
	var subtag = this.data.subtag;

	switch (this.data.type) {
	case 'region':
		return subtag.toUpperCase();
	case 'script':
		return subtag[0].toUpperCase() + subtag.substr(1);
	}

	return subtag;
};
