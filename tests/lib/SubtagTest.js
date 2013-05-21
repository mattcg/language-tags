/**
 * @author Matthew Caruana Galizia <m@m.cg>
 * @license MIT: http://mattcg.mit-license.org/
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

/*jshint node:true*/
/*global assert, refute*/

'use strict';

var buster = require('buster');
var Subtag = require('../../lib/Subtag');

buster.testCase('Subtag', {
	'subtag.type() returns type': function() {
		assert.equals(new Subtag('zh', 'language').type(), 'language');
		assert.equals(new Subtag('IQ', 'region').type(), 'region');
	},
	'subtag.descriptions() returns descriptions': function() {
		assert.equals(new Subtag('IQ', 'region').descriptions(), ['Iraq']);
		assert.equals(new Subtag('vsv', 'extlang').descriptions(), ['Valencian Sign Language', 'Llengua de signes valenciana']);
	},
	'subtag.preferred() returns preferred subtag': function() {
		var subtag, preferred;

		// Extlang
		subtag = new Subtag('vsv', 'extlang');
		preferred = subtag.preferred();
		assert(preferred);
		assert.equals(preferred.type(), 'language');
		assert.equals(preferred.format(), 'vsv');

		// Language
		// Moldovan -> Romanian
		subtag = new Subtag('mo', 'language');
		preferred = subtag.preferred();
		assert(preferred);
		assert.equals(preferred.type(), 'language');
		assert.equals(preferred.format(), 'ro');

		// Region
		// Burma -> Myanmar
		subtag = new Subtag('BU', 'region');
		preferred = subtag.preferred();
		assert(preferred);
		assert.equals(preferred.type(), 'region');
		assert.equals(preferred.format(), 'MM');

		// Variant
		subtag = new Subtag('heploc', 'variant');
		preferred = subtag.preferred();
		assert(preferred);
		assert.equals(preferred.type(), 'variant');
		assert.equals(preferred.format(), 'alalc97');

		// Should return null if no preferred value.
		// Latin America and the Caribbean
		subtag = new Subtag('419', 'region');
		assert.isNull(subtag.preferred());
	},
	'subtag.script() returns suppress-script as subtag': function() {
		var subtag, script;

		subtag = new Subtag('en', 'language');
		script = subtag.script();
		assert(script);
		assert.equals(script.type(), 'script');
		assert.equals(script.format(), 'Latn');

		// Should return null if no script.
		// A macrolanguage like 'zh' should have no suppress-script.
		subtag = new Subtag('zh', 'language');
		script = subtag.script();
		assert.isNull(script);
	},
	'subtag.scope() returns scope': function() {
		assert.equals(new Subtag('zh', 'language').scope(), 'macrolanguage');
		assert.equals(new Subtag('nah', 'language').scope(), 'collection');
		assert.isNull(new Subtag('en', 'language').scope());
		assert.isNull(new Subtag('IQ', 'region').scope());
	},
	'subtag.deprecated() returns deprecation date if available': function() {

		// German Democratic Republic
		assert.equals(new Subtag('DD', 'region').deprecated(), '1990-10-30');
		assert.isNull(new Subtag('DE', 'region').deprecated());
	},
	'subtag.added() returns date added': function() {
		assert.equals(new Subtag('DD', 'region').added(), '2005-10-16');
		assert.equals(new Subtag('DG', 'region').added(), '2009-07-29');
	},
	'subtag.comments() returns comments': function() {

		// Yugoslavia
		assert.equals(new Subtag('YU', 'region').comments(), ['see BA, HR, ME, MK, RS, or SI']);
	},
	'subtag.format() formats subtag according to conventions': function() {

		// Language
		assert.equals(new Subtag('en', 'language').format(), 'en');
		assert.equals(new Subtag('EN', 'language').format(), 'en');

		// Region
		assert.equals(new Subtag('GB', 'region').format(), 'GB');
		assert.equals(new Subtag('gb', 'region').format(), 'GB');

		// Script
		assert.equals(new Subtag('Latn', 'script').format(), 'Latn');
		assert.equals(new Subtag('latn', 'script').format(), 'Latn');
	}
});
