REPO = git@github.com:twitter/flight.git
BUILD := build
GH_PAGES = $(BUILD)/pages

clean:
	@ rm -rf $(BUILD)

$(BUILD):
	@ mkdir -p $(BUILD)

$(BUILD)/flight.js: $(BUILD)
	@ node lib/standalone/build.js

standalone: clean $(BUILD)/flight.js

release: standalone
	git clone -b gh-pages $(REPO) $(GH_PAGES)
	@ cp $(BUILD)/flight.js $(GH_PAGES)/flight.js
	@ cd $(GH_PAGES); \
	  git add flight.js; \
	  git commit -m 'released new version of flight.js standalone'; \
	  git push origin gh-pages
