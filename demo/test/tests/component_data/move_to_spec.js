"use strict";

describeComponent('app/component_data/move_to', function() {
  beforeEach(function() {
    setupComponent(
      {
        recipientHintId: 'abc',
        dataStore: {
          folders: ["inbox", "later", "sent", "trash"],
          contacts: [
            {"id": "contact_3"},
            {"id": "contact_5"}
          ],
          mail: [
            {id: "mail_1", contact_id: "contact_3", subject:"blah", message: "blugh", folders: ['inbox']},
            {id: "mail_2", contact_id: "contact_5", subject:"blee", message: "blooo", folders: ['later']}
          ]
        }
      }
    );
  });

  it('serves move to items when requested', function() {
    spyOnEvent(document, 'dataMoveToItemsServed');
    this.component.trigger('uiAvailableFoldersRequested', {folder: 'inbox'});
    expect('dataMoveToItemsServed').toHaveBeenTriggeredOn(document);
  });

  it('moves requested items', function() {
    var mailId = 'mail_1';
    var movedMail = this.component.attr.dataStore.mail.filter(function(e) {return e.id == mailId})[0];
    expect(movedMail.folders[0]).toBe('inbox');
    this.component.trigger('uiMoveItemsRequested', {itemIds: [mailId], toFolder: 'later'});
    expect(movedMail.folders[0]).toBe('later');
  });

  it('refreshes mail items after move', function() {
    spyOnEvent(document, 'dataMailItemsRefreshRequested');
    this.component.trigger('uiMoveItemsRequested', {itemIds: ["mail_2"], toFolder: 'later'});
    expect('dataMailItemsRefreshRequested').toHaveBeenTriggeredOn(document);
  });


});
