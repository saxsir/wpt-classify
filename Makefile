GULP=$(shell pwd)/node_modules/gulp/bin/gulp.js

watch:
	$(GULP)

lint:
	$(GULP) jshint

build:
	$(GULP) build
