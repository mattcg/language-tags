# IANA Language Tags for JavaScript #

[![Build Status](https://github.com/mattcg/language-tags/actions/workflows/tests.yml/badge.svg?branch=master)](https://github.com/mattcg/language-tags/actions/workflows/tests.yml)
[![Coverage Status](https://coveralls.io/repos/mattcg/language-tags/badge.png)](https://coveralls.io/r/mattcg/language-tags)

Based on [BCP 47](https://www.rfc-editor.org/info/bcp47) ([RFC 5646](https://www.rfc-editor.org/rfc/rfc5646.html)) and the latest [IANA language subtag registry](http://www.iana.org/assignments/language-subtag-registry).

This project will be updated as the standards change.

## JSON data ##

See the [language-subtag-registry](https://github.com/mattcg/language-subtag-registry) project for the underlying JSON data.

## API ##

```js
import {tags, check, subtags, filter, search, languages, language, region, type, date} from 'language-tags'
```

Note that all lookups and checks for tags and subtags are case insensitive. For formatting according to common conventions, see `tag.format`.

### tags(tag) ###

Check whether a hyphen-separated tag is valid and well-formed. Always returns a `Tag`, which can be checked using the `valid` method.

### check(tag) ###

Shortcut for `tags(tag).valid()`. Return `true` if the tag is valid, `false` otherwise. For meaningful error output see `tag.errors()`.

### subtags(subtag), subtags(subtags) ###

Look up one or more subtags. Returns an array of `Subtag` objects. Returns an empty array if all of the subtags are non-existent.

Calling `subtags('mt')` will return an array with two `Subtag` objects: one for Malta (the 'region' type subtag) and one for Maltese (the 'language' type subtag).

```
> subtags('mt');
[Subtag, Subtag]
> subtags('bumblebee');
[]
```

To get or check a single subtag by type use `language(subtag)`, `region(subtag)` or `type(subtag, type)`.

### filter(subtags) ###

The opposite of `subtags(subtags)`. Returns an array of codes that are not registered subtags, otherwise returns an empty array.

```
> filter(['en', 'Aargh']);
['Aargh']
```

### search(description, [all]) ###

Search for tags and subtags by description. Supports either a RegExp object or a string for `description`. Returns an array of `Subtag` and `Tag` objects or an empty array if no results were found.

Note that `Tag` objects in the results represent 'grandfathered' or 'redundant' tags. These are excluded by default. Set the `all` parameter to `true` to include them.

Search is case-insensitive if `description` is a string.

### languages(macrolanguage) ###

Returns an array of `Subtag` objects representing all the 'language' type subtags belonging to the given 'macrolanguage' type subtag.

Throws an error if `macrolanguage` is not a macrolanguage.

```
> languages('zh');
[Subtag, Subtag...]
> languages('en');
Error: 'en' is not a valid macrolanguage.
```

### language(subtag) ###

Convenience method to get a single 'language' type subtag. Can be used to validate an input value as a language subtag. Returns a `Subtag` object or `null`.

```
> language('en');
Subtag
> language('us');
null
```

### region(subtag) ###

As above, but with 'region' type subtags.

```
> region('mt');
Subtag
> region('en');
null
```

### type(subtag, type) ###

Get a subtag by type. Returns the subtag matching `type` as a `Subtag` object otherwise returns `null`.

A `type` consists of one of the following strings: 'language', 'extlang', 'script', 'region' or 'variant'. To get a 'grandfathered' or 'redundant' type tag use `tags(tag)`.

```
> type('zh', 'macrolanguage');
Subtag
> type('zh', 'script');
null
```

### date() ###

Returns the file date for the underlying data, as a string.

```
> date();
'2004-06-28'
```

### Subtag ###

#### subtag.type() ####

Get the subtag type (either 'language', 'extlang', 'script', 'region' or 'variant'). See [RFC 5646 section 2.2](http://tools.ietf.org/html/rfc5646#section-2.2) for type definitions.

#### subtag.descriptions() ####

Returns an array of description strings (a subtag may have more than one description).

```
> language('ro').descriptions();
['Romanian', 'Moldavian', 'Moldovan']
```

#### subtag.preferred() ####

Returns a preferred subtag as a `Subtag` object if the subtag is deprecated. For example, `ro` is preferred over deprecated `mo`.

```
> language('mo').preferred();
Subtag
```

#### subtag.script() ####

For subtags of type 'language' or 'extlang', returns a `Subtag` object representing the language's default script. See [RFC 5646 section 3.1.9](http://tools.ietf.org/html/rfc5646#section-3.1.9) for a definition of 'Suppress-Script'.

#### subtag.scope() ####

Returns the subtag scope as a string, or `null` if the subtag has no scope.

Tip: if the subtag represents a macrolanguage, you can use `languages(macrolanguage)` to get a list of all the macrolanguage's individual languages.

```
> language('zh').scope();
'macrolanguage'
> language('nah').scope();
'collection'
```

#### subtag.deprecated() ####

Returns a date string reflecting the deprecation date if the subtag is deprecated, otherwise returns `null`.

```
> language('ja').deprecated();
'2008-11-22'
```

#### subtag.added() ####

Returns a date string reflecting the date the subtag was added to the registry.

```
> language('ja').added();
'2005-10-16'
```

#### subtag.comments() ####

Returns an array of comments, if any, otherwise returns an empty array.

```
> language('nmf').comments();
['see ntx']
```

#### subtag.format() ####

Return the subtag code formatted according to the case conventions defined in [RFC 5646 section 2.1.1](http://tools.ietf.org/html/rfc5646#section-2.1.1).

- language codes are made lowercase ('mn' for Mongolian)
- script codes are made lowercase with the initial letter capitalized ('Cyrl' for Cyrillic)
- country codes are capitalized ('MN' for Mongolia)

### Tag ###

#### tag.preferred() ####

If the tag is listed as 'deprecated' or 'redundant' it might have a preferred value. This method returns a `Tag` object if so.

```
> tags('zh-cmn-Hant').preferred();
Tag
```

#### tag.type() ####

Returns `grandfathered` if the tag is grandfathered, `redundant` if the tag is redundant, and `tag` if neither. For a definition of grandfathered and redundant tags, see [RFC 5646 section 2.2.8](http://tools.ietf.org/html/rfc5646#section-2.2.8).

#### tag.subtags() ####

Returns an array of subtags making up the tag, as `Subtag` objects.

#### tag.language(), tag.region(), tag.script() ####

Shortcuts for `tag.find('language')`, `tag.find('region')` and `tag.find('script')`.

#### tag.find(type) ####

Find a subtag of the given type from those making up the tag.

#### tag.valid() ####

Returns `true` if the tag is valid, `false` otherwise.

#### tag.errors() ####

Returns an array of `Error` objects if the tag is invalid. The `message` property of each is readable and helpful enough for UI output. The `code` property can be checked against the `Tag.ERR_*` constants. Each error will also have either a `subtag` or `tag` property with the code of the offending tag.

#### tag.format() ####

Format a tag according to the case conventions defined in [RFC 5646 section 2.1.1](http://tools.ietf.org/html/rfc5646#section-2.1.1).

```
> tags('en-gb').format();
'en-GB'
```

#### tag.deprecated() ####

For grandfathered or redundant tags, returns a date string reflecting the deprecation date if the tag is deprecated.

```
> tags('zh-cmn-Hant').deprecated();
'2009-07-29'
```

#### tag.added() ####

For grandfathered or redundant tags, returns a date string reflecting the date the tag was added to the registry.

#### tag.descriptions() ####

Returns an array of tag descriptions for grandfathered or redundant tags, otherwise returns an empty array.

## Resources ##

- [Python version by the Flanders Heritage Agency](https://github.com/OnroerendErfgoed/language-tags)
- [Language Subtag Lookup tool by Richard Ishida](http://rishida.net/utils/subtags/)
- [W3C Internationalization Checker](http://validator.w3.org/i18n-checker/)
- [RFC 5646](http://tools.ietf.org/html/rfc5646)

## Credits and collaboration ##

Copyright (c) 2013, [Matthew Caruana Galizia](http://twitter.com/mcaruanagalizia).

The software part of this project is licensed under an [MIT licence](http://mattcg.mit-license.org/).

Comments, feedback and suggestions are welcome. Please feel free to raise an issue or pull request. Enjoy.
