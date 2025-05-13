/**
 * @author Matthew Caruana Galizia <mattcg@gmail.com>
 * @license MIT: http://mattcg.mit-license.org/
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

'use strict';

import assert from 'assert';
import {describe, it} from 'mocha';
import {date, type, region, language, languages, search, subtags, check, tags} from '../../lib/index.js';

describe('tags', function () {
	it('date() returns file date', function() {
		assert(/\d{4}\-\d{2}\-\d{2}/.test(date()));
	});

	it('type() returns subtag by type', function() {
		var subtag;

		subtag = type('Latn', 'script');
		assert(subtag);
		assert.equal(subtag.format(), 'Latn');
		assert.equal(subtag.type(), 'script');

		assert.equal(type('en', 'script'), null);
	});

	it('region() returns subtag by region', function() {
		var subtag;

		subtag = region('IQ');
		assert(subtag);
		assert.equal(subtag.format(), 'IQ');
		assert.equal(subtag.type(), 'region');

		assert.equal(region('en'), null);
	});

    it('language() handles undefined argument', function() {
        assert.ifError(language(undefined));
    });

	it('language() returns subtag by language', function() {
		var subtag;

		subtag = language('en');
		assert(subtag);
		assert.equal(subtag.format(), 'en');
		assert.equal(subtag.type(), 'language');

		assert.equal(language('GB'), null);
	});

	it('languages() returns all languages for macrolanguage', function() {
		var stags, err;

		stags = languages('zh');
		assert(stags.length > 0);

		try {
			assert.equal(languages('en'));
		} catch (e) {
			err = e;
		}

		assert(err);
		assert.equal(err.message, '\'en\' is not a macrolanguage.');
	});

	it('search() matches descriptions', function() {
		var stags;

		stags = search('Maltese');
		assert(stags.length > 0);

		assert.equal(stags[0].type(), 'language');
		assert.equal(stags[0].format(), 'mt');
		assert.equal(stags[1].type(), 'language');
		assert.equal(stags[1].format(), 'mdl');
		assert.equal(stags[2].type(), 'extlang');
		assert.equal(stags[2].format(), 'mdl');

		stags = search('Gibberish');
		assert.deepEqual(stags, []);
	});

	it('search() puts exact match at the top', function() {
		var stags;

		stags = search('Dari');
		assert(stags.length > 0);

		assert.equal(stags[0].type(), 'language');
		assert.equal(stags[0].format(), 'prs');
	});

	it('subtags() returns subtags', function() {
		var stags;

		stags = subtags('whatever');
		assert.deepEqual(stags, []);

		stags = subtags('mt');
		assert.equal(stags.length, 2);
		assert.equal(stags[0].type(), 'language');
		assert.equal(stags[0].format(), 'mt');
		assert.equal(stags[1].type(), 'region');
		assert.equal(stags[1].format(), 'MT');
	});

	it('subtags() is case insensitive', function() {
		var stags;

		// Test for issue #11.
		stags = subtags('SgNw')
		assert.equal(stags.length, 1);
		assert.equal(stags[0].type(), 'script');
		assert.equal(stags[0].format(), 'Sgnw');
	});

	it('check() checks tag validity', function() {
		assert(check('en'));
		assert(!check('mo'));
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
