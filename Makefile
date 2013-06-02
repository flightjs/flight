REPO = git@github.com:twitter/flight.git
BUILD_DIR := build
GH_PAGES = $(BUILD_DIR)/pages
VERSION = `node -pe "require('./package.json').version"`

clean:
	@ rm -rf $(BUILD_DIR)

standalone: clean
	@ mkdir -p $(BUILD_DIR)
	@ node tools/standalone/build.js

test: standalone
	@ npm test

# clones the Flight project page into the 'build' directory
# creates new directory for latest version
# copies flight.js and flight.min.js
# commits and pushes
release: standalone
	git clone -b gh-pages $(REPO) $(GH_PAGES)
	@ rm -rf $(GH_PAGES)/release/latest
	@ mkdir -p $(GH_PAGES)/release/latest
	@ mkdir $(GH_PAGES)/release/$(VERSION)
	@ cp $(BUILD_DIR)/*.js $(GH_PAGES)/release/latest
	@ cp $(BUILD_DIR)/*.js $(GH_PAGES)/release/$(VERSION)
	@ cd $(GH_PAGES); \
	  git add release; \
	  git commit -m "Add latest release of standalone flight.js"; \
	  git push origin gh-pages
