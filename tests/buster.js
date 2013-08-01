/**
 * @author Matthew Caruana Galizia <m@m.cg>
 * @license MIT: http://mattcg.mit-license.org/
 * @copyright Copyright (c) 2013, Matthew Caruana Galizia
 */

/*jshint node:true*/

'use strict';

var config = module.exports;

config.LanguageTagsTests = {
	rootPath: '../',
    environment: 'node',
    extensions: [
		require('buster-coverage')
	],
    'buster-coverage': {
        outputDirectory: 'build/logs/jscoverage',
        format: 'lcov',
        combinedResultsOnly: true
    },
    sources: [
        'lib/Tag.js',
		'lib/Subtag.js',
		'index.js'
    ],
    tests: [
        'tests/lib/TagTest.js',
		'tests/lib/SubtagTest.js',
		'tests/language-tags-test.js'
    ]
};
