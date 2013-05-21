/**
 * @author Matthew Caruana Galizia <m@m.cg>
 * @license MIT: http://mattcg.mit-license.org/
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

/*jshint node:true*/

'use strict';

var Subtag = require('./lib/Subtag');
var index = require('./lib/data/index');

var tags = module.exports = function() {

};

tags.check = tags;

tags.types = function(subtag) {
	var err, types = index[subtag];

	if (!types) {
		err = new Error('Non-existent subtag \'' + subtag + '\'.');
		err.code = Subtag.ERR_NONEXISTENT;
		throw err;
	}

	return types;
};

tags.subtag = function(subtags) {
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
