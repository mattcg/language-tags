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
	'tag.subtags() returns subtags with correct type': function() {
		var tag, subtags;

		tag = new Tag('en');
		subtags = tag.subtags();
		assert.equals(subtags.length, 1);
		assert.equals(subtags[0].type(), 'language');
		assert.equals(subtags[0].format(), 'en');

		// Lowercase - lookup should be case insensitive.
		tag = new Tag('en-mt');
		subtags = tag.subtags();
		assert.equals(subtags.length, 2);
		assert.equals(subtags[0].type(), 'language');
		assert.equals(subtags[0].format(), 'en');
		assert.equals(subtags[1].type(), 'region');
		assert.equals(subtags[1].format(), 'MT');

		tag = new Tag('en-mt-arab');
		subtags = tag.subtags();
		assert.equals(subtags.length, 3);
		assert.equals(subtags[0].type(), 'language');
		assert.equals(subtags[0].format(), 'en');
		assert.equals(subtags[1].type(), 'region');
		assert.equals(subtags[1].format(), 'MT');
		assert.equals(subtags[2].type(), 'script');
		assert.equals(subtags[2].format(), 'Arab');
	},
	'tag.subtags() returns only existent subtags': function() {
		var tag, subtags;

		tag = new Tag('hello');
		assert.equals(tag.subtags(), []);

		tag = new Tag('en-hello');
		subtags = tag.subtags();
		assert.equals(subtags.length, 1);
		assert.equals(subtags[0].type(), 'language');
		assert.equals(subtags[0].format(), 'en');
	},
	'tag.subtags() handles private tags': function() {
		var tag, subtags;

		tag = new Tag('en-GB-x-Beano');
		subtags = tag.subtags();
		assert.equals(subtags.length, 2);
		assert.equals(subtags[0].type(), 'language');
		assert.equals(subtags[0].format(), 'en');
		assert.equals(subtags[1].type(), 'region');
		assert.equals(subtags[1].format(), 'GB');
	},
	'tag.subtags() returns empty array for grandfathered tag': function() {
		var tag, subtags;

		tag = new Tag('en-GB-oed');
		assert.equals(tag.type(), 'grandfathered');
		subtags = tag.subtags();
		assert.equals(subtags, []);
	},
	'tag.subtags() returns empty array for redundant tag': function() {
		var tag, subtags;

		tag = new Tag('az-Arab');
		assert.equals(tag.type(), 'redundant');
		subtags = tag.subtags();
		assert.equals(subtags, []);
	},
	'tag.errors() returns error for deprecated grandfathered tag': function() {
		var tag, errs, err;

		// Grandfathered and deprecated, therefore invalid.
		tag = new Tag('art-lojban');
		assert.equals(tag.type(), 'grandfathered');
		assert(tag.deprecated());
		errs = tag.errors();
		assert.equals(errs.length, 1);
		err = errs[0];
		assert.equals(err.code, Tag.ERR_DEPRECATED);
		assert.equals(err.tag, 'art-lojban');
	},
	'tag.errors() returns error for deprecated redundant tag': function() {
		var tag, errs, err;

		// Redundant and deprecated, therefore invalid.
		tag = new Tag('zh-cmn');
		assert.equals(tag.type(), 'redundant');
		assert(tag.deprecated());
		errs = tag.errors();
		assert.equals(errs.length, 1);
		err = errs[0];
		assert.equals(err.code, Tag.ERR_DEPRECATED);
		assert.equals(err.tag, 'zh-cmn');
	},
	'tag.errors() returns error if contains deprecated subtags': function() {
		var errs, err;

		// Moldovan (mo) is deprecated as a language.
		errs = new Tag('mo').errors();
		assert.equals(errs.length, 1);
		err = errs[0];
		assert.equals(err.code, Tag.ERR_SUBTAG_DEPRECATED);
		assert.equals(err.message, 'The subtag \'mo\' is deprecated.');

		// Neutral Zone (NT) is deprecated as a region.
		errs = new Tag('en-NT').errors();
		assert.equals(errs.length, 1);
		err = errs[0];
		assert.equals(err.code, Tag.ERR_SUBTAG_DEPRECATED);
		assert.equals(err.message, 'The subtag \'NT\' is deprecated.');
	},
	'tag.errors() returns empty array for valid tag': function() {
		assert.equals(new Tag('en').errors().length, 0);
	},
	'tag.errors() returns error if no language tag and not grandfathered or redundant': function() {
		var errs, err;

		// Test with empty tag.
		errs = new Tag('').errors();
		assert.equals(errs.length, 1);
		err = errs[0];
		assert.equals(err.code, Tag.ERR_NO_LANGUAGE);
		assert.equals(err.message, 'Empty tag.');

		errs = new Tag('IQ-Arab').errors();
		assert.equals(errs.length, 1);
		err = errs[0];
		assert.equals(err.code, Tag.ERR_NO_LANGUAGE);
		assert.equals(err.message, 'Missing language tag in \'iq-arab\'.');

		errs = new Tag('419').errors();
		assert.equals(errs.length, 1);
		err = errs[0];
		assert.equals(err.code, Tag.ERR_NO_LANGUAGE);
		assert.equals(err.message, 'Missing language tag in \'419\'.');
	},
	'tag.errors() returns error if language subtag not at front of tag': function() {
		var errs, err;

		errs = new Tag('GB-en').errors();
		assert.equals(errs.length, 1);
		err = errs[0];
		assert.equals(err.code, Tag.ERR_NO_LANGUAGE);
		assert.equals(err.message, 'Missing language tag in \'gb-en\'.');
	},
	'tag.errors() returns error if more than one language subtag appears': function() {
		var errs, err;

		errs = new Tag('en-en').errors();
		assert.equals(errs.length, 1);
		err = errs[0];
		assert.equals(err.code, Tag.ERR_EXTRA_LANGUAGE);
		assert.equals(err.message, 'Extra language subtag \'en\' found.');

		errs = new Tag('en-en-GB').errors();
		assert.equals(errs.length, 1);
		err = errs[0];
		assert.equals(err.code, Tag.ERR_EXTRA_LANGUAGE);
		assert.equals(err.message, 'Extra language subtag \'en\' found.');

		errs = new Tag('ko-en').errors();
		assert.equals(errs.length, 1);
		err = errs[0];
		assert.equals(err.code, Tag.ERR_EXTRA_LANGUAGE);
		assert.equals(err.message, 'Extra language subtag \'en\' found.');
	},
	'tag.errors() returns error if more than one region subtag appears': function() {
		var errs, err;

		errs = new Tag('en-GB-GB').errors();
		assert.equals(errs.length, 1);
		err = errs[0];
		assert.equals(err.code, Tag.ERR_EXTRA_REGION);
		assert.equals(err.message, 'Extra region subtag \'GB\' found.');

		errs = new Tag('ko-mt-mt').errors();
		assert.equals(errs.length, 1);
		err = errs[0];
		assert.equals(err.code, Tag.ERR_EXTRA_REGION);
		assert.equals(err.message, 'Extra region subtag \'MT\' found.');
	},
	'tag.errors() returns error if more than one script subtag appears': function() {
		var errs, err;

		errs = new Tag('mt-Arab-Arab').errors();
		assert.equals(errs.length, 1);
		err = errs[0];
		assert.equals(err.code, Tag.ERR_EXTRA_SCRIPT);
		assert.equals(err.message, 'Extra script subtag \'Arab\' found.');

		errs = new Tag('en-Cyrl-Latn').errors();
		assert.equals(errs.length, 1);
		err = errs[0];
		assert.equals(err.code, Tag.ERR_EXTRA_SCRIPT);
		assert.equals(err.message, 'Extra script subtag \'Latn\' found.');

		// First error should be regarding suppress-script, second should be regarding extra script.
		errs = new Tag('en-Latn-Cyrl').errors();
		assert.equals(errs.length, 2);
		err = errs[0];
		assert.equals(err.code, Tag.ERR_SUPPRESS_SCRIPT);
		assert.equals(err.message, 'The script subtag \'Latn\' is the same as the language suppress-script.');
		err = errs[1];
		assert.equals(err.code, Tag.ERR_EXTRA_SCRIPT);
		assert.equals(err.message, 'Extra script subtag \'Cyrl\' found.');
	},

	'tag.errors() returns error if more than one extlang subtag appears': function() {
		var errs, err;

		errs = new Tag('en-asp-bog').errors();
		assert.equals(errs.length, 1);
		err = errs[0];
		assert.equals(err.code, Tag.ERR_EXTRA_EXTLANG);
		assert.equals(err.message, 'Extra extlang subtag \'bog\' found.');
	},
	'tag.errors() returns error if a duplicate variant subtag appears': function() {
		var errs, err;

		errs = new Tag('ca-valencia-valencia').errors();
		assert.equals(errs.length, 1);
		err = errs[0];
		assert.equals(err.code, Tag.ERR_DUPLICATE_VARIANT);
		assert.equals(err.message, 'Duplicate variant subtag \'valencia\' found.');
	},
	'tag.errors() returns error if private-use subtag contains more than 8 characters': function() {
		var errs, err;

		// i.e. more than 8 in each component, not in total.
		errs = new Tag('en-x-more-than-eight-chars').errors();
		assert.equals(errs.length, 0);

		errs = new Tag('en-x-morethaneightchars').errors();
		assert.equals(errs.length, 1);
		err = errs[0];
		assert.equals(err.code, Tag.ERR_TOO_LONG);
		assert.equals(err.message, 'The private-use subtag \'morethaneightchars\' is too long.');
	},
	'tag.errors() returns error if script subtag is same as language suppress-script': function() {
		var errs, err;

		errs = new Tag('gsw-Latn').errors();
		assert.equals(errs.length, 1);
		err = errs[0];
		assert.equals(err.code, Tag.ERR_SUPPRESS_SCRIPT);
		assert.equals(err.message, 'The script subtag \'Latn\' is the same as the language suppress-script.');

		errs = new Tag('en-GB-Latn').errors();
		assert.equals(errs.length, 1);
		err = errs[0];
		assert.equals(err.code, Tag.ERR_SUPPRESS_SCRIPT);
		assert.equals(err.message, 'The script subtag \'Latn\' is the same as the language suppress-script.');
	},
	'tag.valid() returns true for valid tag': function() {
		assert(new Tag('en').valid());
		assert(new Tag('en-GB').valid());
		assert(new Tag('gsw').valid());
		assert(new Tag('de-CH').valid());
	},
	'tag.valid() returns true for subtag followed by private tag': function() {
		assert(new Tag('en-x-whatever').valid());
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
	'tag.valid() returns false if tag contains no language tag and is not grandfathered or redundant': function() {
		refute(new Tag('IQ-Arab').valid());
		refute(new Tag('419').valid());
	},
	'tag.valid() returns false if language subtag is not front of tag': function() {
		refute(new Tag('GB-en').valid());
	},
	'tag.valid() returns false if more than one language subtag appears': function() {
		refute(new Tag('en-en').valid());
		refute(new Tag('ko-en').valid());
	},
	'tag.valid() returns false if more than one region subtag appears': function() {
		refute(new Tag('en-001-gb').valid());
		refute(new Tag('gb-001').valid());
	},
	'tag.valid() returns false if more than one extlang subtag appears': function() {
		refute(new Tag('en-asp-bog').valid());
	},
	'tag.valid() returns false if more than one script subtag appears': function() {
		refute(new Tag('arb-Latn-Cyrl').valid());
	},
	'tag.valid() returns false if a duplicate variant subtag appears': function() {
		refute(new Tag('ca-valencia-valencia').valid());
	},
	'tag.valid() returns false if private-use subtag contains more than 8 characters': function() {

		// i.e. more than 8 in each component, not in total.
		assert(new Tag('en-x-more-than-eight-chars').valid());
		refute(new Tag('en-x-morethaneightchars').valid());
	},
	'tag.valid() returns false if script subtag is same as language suppress-script': function() {
		refute(new Tag('en-Latn').valid());
		refute(new Tag('en-GB-Latn').valid());
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
