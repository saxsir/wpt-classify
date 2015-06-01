GULP=$(shell pwd)/node_modules/gulp/bin/gulp.js

watch:
	$(GULP)

build:
	$(GULP) build
