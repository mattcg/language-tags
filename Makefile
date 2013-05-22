node_modules: package.json
	npm install

build/logs/jscoverage/coverage.lcov: node_modules
	npm test

build/logs/jscoverage/html: build/logs/jscoverage/coverage.lcov
	genhtml --output-directory build/logs/jscoverage/html build/logs/jscoverage/coverage.lcov

test: build/logs/jscoverage/html

update:
	./bin/import

clean:
	rm -rf build/logs/jscoverage/*.lcov build/logs/jscoverage/html node_modules scripts/cache/language-subtag-registry

.PHONY: test update clean
