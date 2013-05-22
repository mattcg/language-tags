/**
 * @author Matthew Caruana Galizia <m@m.cg>
 * @license MIT: http://mattcg.mit-license.org/
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

/*jshint node:true*/
/*global assert, refute*/

'use strict';

var buster = require('buster');
var tags = require('../language-tags');

buster.testCase('language-tags', {
	'date() returns file date': function() {
		assert.equals(tags.date(), '2013-02-28');
	},
	'type() returns subtag by type': function() {
		var subtag;

		subtag = tags.type('Latn', 'script');
		assert(subtag);
		assert.equals(subtag.format(), 'Latn');
		assert.equals(subtag.type(), 'script');

		assert.isNull(tags.type('en', 'script'));
	},
	'region() returns subtag by region': function() {
		var subtag;

		subtag = tags.region('IQ');
		assert(subtag);
		assert.equals(subtag.format(), 'IQ');
		assert.equals(subtag.type(), 'region');

		assert.isNull(tags.region('en'));
	},
	'language() returns subtag by language': function() {
		var subtag;

		subtag = tags.language('en');
		assert(subtag);
		assert.equals(subtag.format(), 'en');
		assert.equals(subtag.type(), 'language');

		assert.isNull(tags.language('GB'));
	},
	'languages() returns all languages for macrolanguage': function() {
		var subtags, err;

		subtags = tags.languages('zh');
		assert(subtags.length > 0);

		try {
			assert.equals(tags.languages('en'));
		} catch (e) {
			err = e;
		}

		assert(err);
		assert.equals(err.message, '\'en\' is not a macrolanguage.');
	},
	'search() matches descriptions': function() {
		var subtags;

		subtags = tags.search('Maltese');
		assert(subtags.length > 0);

		assert.equals(subtags[0].type(), 'language');
		assert.equals(subtags[0].format(), 'mt');
		assert.equals(subtags[1].type(), 'language');
		assert.equals(subtags[1].format(), 'mdl');
		assert.equals(subtags[2].type(), 'extlang');
		assert.equals(subtags[2].format(), 'mdl');

		subtags = tags.search('Gibberish');
		assert.equals(subtags, []);
	},
	'subtags() returns subtags': function() {
		var subtags;

		subtags = tags.subtags('whatever');
		assert.equals(subtags, []);

		subtags = tags.subtags('mt');
		assert.equals(subtags.length, 2);
		assert.equals(subtags[0].type(), 'language');
		assert.equals(subtags[0].format(), 'mt');
		assert.equals(subtags[1].type(), 'region');
		assert.equals(subtags[1].format(), 'MT');
	},
	'check() checks tag validity': function() {
		assert(tags.check('en'));
		refute(tags.check('mo'));
	},
	'gets tag': function() {
		var tag;

		tag = tags('en');
		assert(tag);

		tag = tags('en-gb');
		assert(tag);
		assert.equals(tag.format(), 'en-GB');
	}
});
