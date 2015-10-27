GULP=$(shell pwd)/node_modules/gulp/bin/gulp.js
NODE=$(shell which node)

watch:
	$(GULP)

lint:
	$(GULP) jshint

build:
	$(GULP) build

output-csv:
	$(NODE) src/outputCsv.js $(FILE) > /vagrant/$(FILE)-patterns.csv
	$(NODE) src/outputCsv2.js $(FILE) > /vagrant/$(FILE)-nodeLayouts.csv
	nkf /vagrant/$(FILE)-nodeLayouts.csv > /vagrant/tmp
	mv /vagrant/tmp /vagrant/$(FILE)-nodeLayouts.csv
