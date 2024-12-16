/**
 * @author Matthew Caruana Galizia <mattcg@gmail.com>
 * @license MIT: http://mattcg.mit-license.org/
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

'use strict';

import assert from 'assert';
import {describe, it} from 'mocha';
import tags from '../../src/index.js';

describe('tags', function () {
	it('date() returns file date', function() {
		assert(/\d{4}\-\d{2}\-\d{2}/.test(tags.date()));
	});

	it('type() returns subtag by type', function() {
		var subtag;

		subtag = tags.type('Latn', 'script');
		assert(subtag);
		assert.equal(subtag.format(), 'Latn');
		assert.equal(subtag.type(), 'script');

		assert.equal(tags.type('en', 'script'), null);
	});

	it('region() returns subtag by region', function() {
		var subtag;

		subtag = tags.region('IQ');
		assert(subtag);
		assert.equal(subtag.format(), 'IQ');
		assert.equal(subtag.type(), 'region');

		assert.equal(tags.region('en'), null);
	});

	it('language() returns subtag by language', function() {
		var subtag;

		subtag = tags.language('en');
		assert(subtag);
		assert.equal(subtag.format(), 'en');
		assert.equal(subtag.type(), 'language');

		assert.equal(tags.language('GB'), null);
	});

	it('languages() returns all languages for macrolanguage', function() {
		var subtags, err;

		subtags = tags.languages('zh');
		assert(subtags.length > 0);

		try {
			assert.equal(tags.languages('en'));
		} catch (e) {
			err = e;
		}

		assert(err);
		assert.equal(err.message, '\'en\' is not a macrolanguage.');
	});

	it('search() matches descriptions', function() {
		var subtags;

		subtags = tags.search('Maltese');
		assert(subtags.length > 0);

		assert.equal(subtags[0].type(), 'language');
		assert.equal(subtags[0].format(), 'mt');
		assert.equal(subtags[1].type(), 'language');
		assert.equal(subtags[1].format(), 'mdl');
		assert.equal(subtags[2].type(), 'extlang');
		assert.equal(subtags[2].format(), 'mdl');

		subtags = tags.search('Gibberish');
		assert.deepEqual(subtags, []);
	});

	it('search() puts exact match at the top', function() {
		var subtags;

		subtags = tags.search('Dari');
		assert(subtags.length > 0);

		assert.equal(subtags[0].type(), 'language');
		assert.equal(subtags[0].format(), 'prs');
	});

	it('subtags() returns subtags', function() {
		var subtags;

		subtags = tags.subtags('whatever');
		assert.deepEqual(subtags, []);

		subtags = tags.subtags('mt');
		assert.equal(subtags.length, 2);
		assert.equal(subtags[0].type(), 'language');
		assert.equal(subtags[0].format(), 'mt');
		assert.equal(subtags[1].type(), 'region');
		assert.equal(subtags[1].format(), 'MT');
	});

	it('subtags() is case insensitive', function() {
		var subtags;

		// Test for issue #11.
		subtags = tags.subtags('SgNw')
		assert.equal(subtags.length, 1);
		assert.equal(subtags[0].type(), 'script');
		assert.equal(subtags[0].format(), 'Sgnw');
	});

	it('check() checks tag validity', function() {
		assert(tags.check('en'));
		assert(!tags.check('mo'));
	});

	it('gets tag', function() {
		var tag;

		tag = tags('en');
		assert(tag);

		tag = tags('en-gb');
		assert(tag);
		assert.equal(tag.format(), 'en-GB');
	});
});
