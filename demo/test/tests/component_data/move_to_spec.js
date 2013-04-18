"use strict";

describeComponent('app/component_data/move_to', function () {
  beforeEach(function () {
    setupComponent();
  });

  it('serves move to items when requested', function () {
    spyOnEvent(document, 'dataMoveToItemsServed');
    this.component.trigger('uiAvailableFoldersRequested', {folder: 'inbox'});
    expect('dataMoveToItemsServed').toHaveBeenTriggeredOn(document);
  });

  it('moves requested items', function () {
    var mailId = 'mail_2191';
    var movedMail = dataStore.mail.filter(function(e) {return e.id == mailId})[0];
    expect(movedMail.folders[0]).toBe('inbox');
    this.component.trigger('uiMoveItemsRequested', {itemIds: [mailId], toFolder: 'later'});
    expect(movedMail.folders[0]).toBe('later');
  });

  it('refreshes mail items after move', function () {
    spyOnEvent(document, 'dataMailItemsRefreshRequested');
    this.component.trigger('uiMoveItemsRequested', {itemIds: ["mail_2191"], toFolder: 'later'});
    expect('dataMailItemsRefreshRequested').toHaveBeenTriggeredOn(document);
  });


});
