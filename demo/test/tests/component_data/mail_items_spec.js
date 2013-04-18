"use strict";

var dataStore;

describeComponent('app/component_data/mail_items', function () {
  beforeEach(function () {
    require(['app/data'], function(data) {
      dataStore = data
    });
    setupComponent();
  });

  it('serves mail items when requested', function () {
    spyOnEvent(document, 'dataMailItemsServed');
    this.component.trigger('uiMailItemsRequested', {folder: 'inbox'});
    expect('dataMailItemsServed').toHaveBeenTriggeredOn(document);
  });

  it('should collate items for given folder when assembleItems is invoked with folder', function () {
    require(['app/data'], function(data) {
      dataStore = data
    });

    var items = this.component.assembleItems('inbox');
    expect(items.length).toBe(5);
    //FIX DATA MUTABILITY ISSUE
    // items = this.component.assembleItems('sent');
    // expect(items.length).toBe(1);
    items = this.component.assembleItems('trash');
    expect(items.length).toBe(2);
  });

  it('serves mail items after refresh', function () {
    spyOnEvent(document, 'dataMailItemsServed');
    this.component.trigger('dataMailItemsRefreshRequested', {});
    expect('dataMailItemsServed').toHaveBeenTriggeredOn(document);
  });

});
