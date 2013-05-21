/**
 * @author Matthew Caruana Galizia <m@m.cg>
 * @license MIT: http://mattcg.mit-license.org/
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

/*jshint node:true*/
/*global assert, refute*/

'use strict';

var buster = require('buster');
var Tag = require('../../lib/Tag');

buster.testCase('Tag', {
	'tag.type() returns \'grandfathered\'': function() {

		// Classified as grandfathered in the registry.
		assert.equals(new Tag('en-GB-oed').type(), 'grandfathered');
	},
	'tag.type() returns \'redundant\'': function() {

		// Classified as redundant in the registry.
		assert.equals(new Tag('az-Arab').type(), 'redundant');
		assert.equals(new Tag('uz-Cyrl').type(), 'redundant');
		assert.equals(new Tag('zh-cmn-Hant').type(), 'redundant');
	},
	'tag.type() returns \'tag\'': function() {

		// Maltese (mt) is a subtag but valid as a standalone tag.
		assert.equals(new Tag('mt').type(), 'tag');
	},
	'tag.errors() returns error for deprecated grandfathered tag': function() {
		var tag;

		// Grandfathered and deprecated, therefore invalid.
		tag = new Tag('art-lojban');
		assert.equals(tag.type(), 'grandfathered');
		assert(tag.deprecated());
		assert(tag.errors().some(function(error) {
			return error.code === Tag.ERR_DEPRECATED;
		}));
	},
	'tag.errors() returns error for deprecated redundant tag': function() {
		var tag;

		// Redundant and deprecated, therefore invalid.
		tag = new Tag('zh-cmn');
		assert.equals(tag.type(), 'redundant');
		assert(tag.deprecated());
		assert(tag.errors().some(function(error) {
			return error.code === Tag.ERR_DEPRECATED;
		}));
	},
	'tag.errors() returns empty array for valid tag': function() {
		var tag;

		tag = new Tag('en');
		assert.equals(tag.errors.length, 0);
	},
	'tag.valid() returns true for valid tag': function() {
		assert(new Tag('en').valid());
		assert(new Tag('en-GB').valid());
		assert(new Tag('gsw').valid());
		assert(new Tag('de-CH').valid());
	},
	'tag.valid() returns true for non-deprecated grandfathered tag': function() {
		var tag;

		// Grandfathered but not deprecated, therefore valid.
		tag = new Tag('en-GB-oed');
		assert.equals(tag.type(), 'grandfathered');
		refute(tag.deprecated());
		assert(tag.valid());
	},
	'tag.valid() returns true for non-deprecated redundant tag': function() {
		var tag;

		// Redundant but not deprecated, therefore valid.
		tag = new Tag('zh-Hans');
		assert.equals(tag.type(), 'redundant');
		refute(tag.deprecated());
		assert(tag.valid());
		tag = new Tag('es-419');
		assert.equals(tag.type(), 'redundant');
		refute(tag.deprecated());
		assert(tag.valid());
	},
	'tag.valid() returns false for non-existent tag': function() {
		refute(new Tag('zzz').valid());
		refute(new Tag('zzz-Latn').valid());
		refute(new Tag('en-Lzzz').valid());
	},
	'tag.valid() returns false for deprecated grandfathered tag': function() {
		var tag;

		// Grandfathered and deprecated, therefore invalid.
		tag = new Tag('art-lojban');
		assert.equals(tag.type(), 'grandfathered');
		assert(tag.deprecated());
		refute(tag.valid());
	},
	'tag.valid() returns false for deprecated redundant tag': function() {
		var tag;

		// Redundant and deprecated, therefore invalid.
		tag = new Tag('zh-cmn');
		assert.equals(tag.type(), 'redundant');
		assert(tag.deprecated());
		refute(tag.valid());
		tag = new Tag('zh-cmn-Hans');
		assert.equals(tag.type(), 'redundant');
		assert(tag.deprecated());
		refute(tag.valid());
	},
	'tag.valid() returns false if contains deprecated subtags': function() {

		// Moldovan (mo) is deprecated as a language.
		refute(new Tag('mo').valid());

		// Neutral Zone (NT) is deprecated as a region.
		refute(new Tag('en-NT').valid());
	},
	'tag.valid() returns false for tag with redundant script subtag': function() {

		// Swiss German (gsw) has a suppress script of Latn.
		refute(new Tag('gsw-Latn').valid());
	},
	'tag.deprecated() returns deprecation date when available': function() {
		var tag;

		// Redundant and deprecated.
		tag = new Tag('zh-cmn-Hant');
		assert.equals(tag.type(), 'redundant');
		assert.equals(tag.deprecated(), '2009-07-29');

		// Redundant but not deprecated.
		tag = new Tag('zh-Hans');
		assert.equals(tag.type(), 'redundant');
		refute(tag.deprecated());

		// Grandfathered and deprecated.
		tag = new Tag('zh-xiang');
		assert.equals(tag.type(), 'grandfathered');
		assert.equals(tag.deprecated(), '2009-07-29');

		// Grandfathered but not deprecated.
		tag = new Tag('en-GB-oed');
		assert.equals(tag.type(), 'grandfathered');
		refute(tag.deprecated());
	},
	'tag.added() returns add date when available': function() {
		var tag;

		// Redundant and deprecated.
		tag = new Tag('zh-cmn-Hant');
		assert.equals(tag.type(), 'redundant');
		assert.equals(tag.added(), '2005-07-15');

		// Redundant but not deprecated.
		tag = new Tag('zh-Hans');
		assert.equals(tag.type(), 'redundant');
		refute(tag.deprecated());
		assert.equals(tag.added(), '2003-05-30');

		// Grandfathered and deprecated.
		tag = new Tag('zh-xiang');
		assert.equals(tag.type(), 'grandfathered');
		assert.equals(tag.added(), '1999-12-18');

		// Grandfathered but not deprecated.
		tag = new Tag('en-GB-oed');
		assert.equals(tag.type(), 'grandfathered');
		refute(tag.deprecated());
		assert.equals(tag.added(), '2003-07-09');
	},
	'tag.description() returns description when available': function() {
		var tag;

		tag = new Tag('en-GB-oed');
		assert.equals(tag.type(), 'grandfathered');
		refute(tag.deprecated());
		assert.equals(tag.descriptions(), ['English, Oxford English Dictionary spelling']);

		// Otherwise returns an empty array.
		assert.equals(new Tag('en').descriptions(), []);
	},
	'tag.format() formats tag according to conventions': function() {
		assert.equals(new Tag('en').format(), 'en');
		assert.equals(new Tag('En').format(), 'en');
		assert.equals(new Tag('EN').format(), 'en');
		assert.equals(new Tag('eN').format(), 'en');
		assert.equals(new Tag('en-gb').format(), 'en-GB');
		assert.equals(new Tag('en-gb-oed').format(), 'en-GB-oed');
		assert.equals(new Tag('az-latn').format(), 'az-Latn');
		assert.equals(new Tag('ZH-hant-hK').format(), 'zh-Hant-HK');
	},
	'tag.preferred() returns preferred tag if available': function() {
		var tag = new Tag('zh-cmn-Hant');

		assert.equals(tag.type(), 'redundant');
		assert(tag.deprecated());
		assert(tag.preferred());
		assert.equals(tag.preferred().format(), 'cmn-Hant');

		assert.isNull(new Tag('zh-Hans').preferred());
	}
});
