# IANA Language Tags for JavaScript #

Takes the headache out of working with language tags in JavaScript. Provides an easy objected oriented API as well as raw data in neatly organized JSON files if you prefer to work with those.

Based on [BCP 47](http://tools.ietf.org/html/bcp47) ([RFC 5646](http://tools.ietf.org/html/rfc5646)) and the latest [IANA language subtag registry](http://www.iana.org/assignments/language-subtag-registry).

This project will be updated as the standards change. Changes in the registry will result in the revision number being bumped.

## Usage ##

```js
var tags = require('language-tags')
```

Note that all lookups and checks for tags and subtags are case insensitive. For formatting according to common conventions, see `tag.format`.

### tags(tag), tags.check(tag) ###

Check whether a hyphen-separated tag is valid and well-formed. Always returns a `Tag`, which can be checked using the `valid` method.

### tags.subtag(subtag), tags.subtag(subtags) ###

Look up one or more subtags. Returns an array of `Subtag` objects. Throws an error if the input subtag is non-existent.

Calling `tags.subtag('mt')` will return an array with two `Subtag` objects: one for Malta (the 'region' type subtag) and one for Maltese (the 'language' type subtag).

```
> tags.subtag('mt');
[Subtag, Subtag]
> tags.subtag('bumblebee');
Error: Non-existent subtag 'bumblebee'.
```

To get or check a single subtag by type use `tags.language(subtag)`, `tags.region(subtag)` or `tags.type(subtag, type)`.

### tags.search(description, [all]) ###

Search for tags and subtags by description. Returns an array of `Subtag` and `Tag` objects or an empty array if no results were found.

Note that `Tag` objects in the results represent 'grandfathered' or 'redundant' tags. These are excluded by default. Set the `all` parameter to `true` to include them.

### tags.languages(macrolanguage) ###

Returns an array of `Subtag` objects representing all the 'language' type subtags belonging to the given 'macrolanguage' type subtag. Otherwise returns an empty array.

```
> tags.languages('zh');
[Subtag, Subtag...]
```

### tags.language(subtag) ###

Convenience method to get a single 'language' type subtag. Can be used to validate an input value as a language subtag. Returns a `Subtag` object or `null`.

```
> tags.language('en');
Subtag
> tags.language('us');
null
```

### tags.region(subtag) ###

As above, but with 'region' type subtags.

```
> tags.region('mt');
Subtag
> tags.region('en');
null
```

### tags.type(subtag, type) ###

Get a subtag by type. Returns the subtag matching `type` as a `Subtag` object otherwise returns `null`.

A `type` consists of one of the following strings: 'language', 'extlang', 'script', 'region' or 'variant'. To get a 'grandfathered' or 'redundant' type tag use `tags.check(tag)`.

```
> tags.type('zh', 'macrolanguage');
Subtag
> tags.type('zh', 'script');
null
```

### tags.subtag(subtag) ###

Returns `true` if the `subtag` parameter is a valid subtag, as opposed to a grandfathered or redundant tag.

### tags.date() ###

Returns the file date for the underlying data, as a string.

```
> tags.date();
'2004-06-28'
```

### Subtag ###

#### subtag.type() ####

Get the subtag type (either 'language', 'extlang', 'script', 'region' or 'variant'). See [RFC 5646 section 2.2](http://tools.ietf.org/html/rfc5646#section-2.2) for type definitions.

#### subtag.descriptions() ####

Returns an array of description strings (a subtag may have more than one description).

```
> tags.language('ro').descriptions();
['Romanian', 'Moldavian', 'Moldovan']
```

#### subtag.preferred() ####

Returns a preferred subtag as a `Subtag` object if the subtag is deprecated. For example, `ro` is preferred over deprecated `mo`.

```
> tags.language('mo').preferred();
Subtag
```

#### subtag.script() ####

For subtags of type 'language' or 'extlang', returns a `Subtag` object representing the language's default script. See [RFC 5646 section 3.1.9](http://tools.ietf.org/html/rfc5646#section-3.1.9) for a definition of 'Suppress-Script'.

#### subtag.scope() ####

Returns the subtag scope as a string, or `null` if the subtag has no scope.

Tip: if the subtag represents a macrolanguage, you can use `tags.languages(macrolanguage)` to get a list of all the macrolanguage's individual languages.

```
> tags.language('zh').scope();
'macrolanguage'
> tags.language('nah').scope();
'collection'
```

#### subtag.deprecated() ####

Returns a date string reflecting the deprecation date if the subtag is deprecated, otherwise returns `null`.

```
> tags.language('ja').deprecated();
'2008-11-22'
```

#### subtag.added() ####

Returns a date string reflecting the date the subtag was added to the registry.

```
> tags.language('ja').added();
'2005-10-16'
```

#### subtag.comments() ####

Returns an array comments, if any, otherwise returns an empty array.

```
> tags.language('nmf').comments();
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

#### tag.valid() ####

Returns `true` if the tag is valid, `false` otherwise.

#### tag.errors() ####

Returns an array of `Error` objects if the tag is invalid. The `message` property of each is readable and helpful enough for UI output. The `code` property can be check against the `Tag.ERR_*` constants.

#### tag.format() ####

Format a tag according to the case conventions defined in [RFC 5646 section 2.1.1](http://tools.ietf.org/html/rfc5646#section-2.1.1).

```
> tags.check('en-gb').format();
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

## Raw data ##

See `lib/data/` for all the JSON files available. The `registry.json` file contains all records in a flat array and `meta.json` contains its metadata. There's a separate JSON file for each 'scope' (e.g. `macrolanguage.json`) and 'type' (e.g. `language.json`). These files contain JSON objects keyed by tag or subtag and with the index integer for the corresponding entry in `registry.json` as a value.

## Updating ##

Run `bin/import` to update data from the latest official IANA-hosted version. The registry file format is converted to JSON automatically and the files in `lib/` are updated.

If there are changes, please make a pull request.

## Resources ##

- [RFC 5646 file format description](http://tools.ietf.org/html/rfc5646#section-3.1.1)

## Credits and collaboration ##

Copyright (c) 2013, [Matthew Caruana Galizia](http://twitter.com/mcaruanagalizia).

This project is licensed under an [MIT licence](http://mattcg.mit-license.org/). Comments, feedback and suggestions are welcome. Please feel free to raise an issue or pull request. Enjoy.
