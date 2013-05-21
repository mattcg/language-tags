node_modules: package.json
	npm install

test: node_modules
	npm test

update:
	./bin/update

clean:
	rm -rf build/logs/*.lcov

.PHONY: test update clean
