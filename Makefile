SITE_REPO = git@github.com:flightjs/flightjs.github.io.git
BUILD_DIR := build
SITE_MASTER = $(BUILD_DIR)/site
VERSION = `node -pe "require('./package.json').version"`

clean:
	@ rm -rf $(BUILD_DIR)

standalone: clean
	@ mkdir -p $(BUILD_DIR)
	@ node tools/standalone/build.js

test: standalone
	@ npm test

lint:
	@ ./node_modules/.bin/jshint --show-non-errors lib

# clones the Flight project page into the 'build' directory
# creates new directory for latest version
# copies flight.js and flight.min.js
# commits and pushes
release: standalone
	git clone $(SITE_REPO) $(SITE_MASTER)
	@ rm -rf $(SITE_MASTER)/release/latest
	@ mkdir -p $(SITE_MASTER)/release/latest
	@ mkdir $(SITE_MASTER)/release/$(VERSION)
	@ cp $(BUILD_DIR)/*.js $(SITE_MASTER)/release/latest
	@ cp $(BUILD_DIR)/*.js $(SITE_MASTER)/release/$(VERSION)
	@ cd $(SITE_MASTER); \
	  git add release; \
	  git commit -m "Add latest release of Flight"; \
	  git push origin master
