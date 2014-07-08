all: 
	uglifyjs src/*.js src/ajax/*.js vast/adhese-vast.js -m -v -c -o dist/adhese.min.js

novastnoajax: 
	uglifyjs src/*.js -m -v -c -o dist/adhese.min.js

novast: 
	uglifyjs src/*.js src/ajax/*.js -m -v -c -o dist/adhese.min.js

vastonly: 
	uglifyjs vast/adhese-vast.js src/ajax/*.js -m -v -c -o vast/dist/adhese-vast.min.js