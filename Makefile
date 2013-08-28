test: node_modules lib test
	TEST_LIB_PATH="../../lib" ./node_modules/.bin/mocha \
		--recursive \
		--reporter dot \
		--check-leaks \
		--ui tdd

test-cov: build/coverage.html

build/lib-coverage: build lib
	jscoverage \
		--no-highlight \
		lib \
		build/lib-coverage

build/coverage.html: build/lib-coverage test node_modules
	TEST_LIB_PATH="../../build/lib-coverage" ./node_modules/.bin/mocha \
		--recursive \
		--reporter html-cov \
		--ui tdd \
		> $@

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
