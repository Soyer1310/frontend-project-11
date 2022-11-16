install:
	npm ci
	
lint: 
	npx eslint .

dev:
	npx webpack serve

build:
	rm -rf dist
	NODE_ENV=production npx webpack

