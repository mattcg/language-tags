test: lib test/lib node_modules
	TEST_LIB_PATH="../../lib" ./node_modules/.bin/mocha \
		--recursive \
		--reporter dot \
		--check-leaks \
		--ui tdd

test-coveralls: build/lib-coverage test/lib node_modules
	TEST_LIB_PATH="../../build/lib-coverage" ./node_modules/.bin/mocha \
		--recursive \
		--reporter mocha-lcov-reporter \
		--ui tdd | \
		./node_modules/coveralls/bin/coveralls.js build/lib-coverage

test-cov: build/coverage.html

build/coverage.html: build/lib-coverage test/lib node_modules
	TEST_LIB_PATH="../../build/lib-coverage" ./node_modules/.bin/mocha \
		--recursive \
		--reporter html-cov \
		--ui tdd \
		> $@

build/lib-coverage: build lib
	jscoverage \
		--no-highlight \
		lib \
		build/lib-coverage

node_modules: package.json
	npm install
	touch $@

build:
	if [ ! -d $@ ]; then \
		mkdir $@; \
	fi;

update:
	./bin/import

clean:
	rm -rf \
		build \
		scripts/cache/language-subtag-registry

.PHONY: test test-cov update clean
