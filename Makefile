BUILD_DIR := build
SITE_REPO = git@github.com:flightjs/flightjs.github.io.git
SITE_MASTER = $(BUILD_DIR)/site
BOWER_REPO = git@github.com:flightjs/flight-umd.git
BOWER_MASTER = $(BUILD_DIR)/bower
VERSION = $(shell node -pe "require('./package.json').version")

# clones the flight-umd repo into the 'build' directory
# copies flight.js and flight.min.js
# updates the bower.json version number
# commits and pushes
bower: umd
	git clone $(BOWER_REPO) $(BOWER_MASTER)
	@ cp $(BUILD_DIR)/*.js $(BOWER_MASTER)/
	@ cd $(BOWER_MASTER); \
	  node -e "\
		var manifest = require('bower.json');\
		manifest.version = \"$(VERSION)\";\
		var str = JSON.stringify(manifest, null, 2);\
		require('fs').writeFileSync('bower.json', str);" \
	  git add -A; \
	  git commit -m "$(VERSION)"; \
	  git tag -m "$(VERSION)" $(VERSION); \
	  git push --tags origin master

clean:
	@ rm -rf $(BUILD_DIR)

release: bower website

setup:
	@ npm install

# builds the UMD 'flight' library
umd: setup clean
	@ mkdir -p $(BUILD_DIR)
	@ npm run build

test: umd
	@ npm test

# clones the Flight project page into the 'build' directory
# creates new directory for latest version
# copies flight.js and flight.min.js
# commits and pushes
website: umd
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
