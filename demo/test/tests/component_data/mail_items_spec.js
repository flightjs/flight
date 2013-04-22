"use strict";

describeComponent('app/component_data/mail_items', function() {
  beforeEach(function() {
    setupComponent(
      {
        dataStore: {
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

  it('serves mail items when requested', function() {
    spyOnEvent(document, 'dataMailItemsServed');
    this.component.trigger('uiMailItemsRequested', {folder: 'inbox'});
    expect('dataMailItemsServed').toHaveBeenTriggeredOn(document);
  });

  it('should collate items for given folder when assembleItems is invoked with folder', function() {
    var items = this.component.assembleItems('inbox');
    expect(items.length).toBe(1);
    items = this.component.assembleItems('sent');
    expect(items.length).toBe(0);
    items = this.component.assembleItems('later');
    expect(items.length).toBe(1);
  });

  it('serves mail items after refresh', function() {
    spyOnEvent(document, 'dataMailItemsServed');
    this.component.trigger('dataMailItemsRefreshRequested', {});
    expect('dataMailItemsServed').toHaveBeenTriggeredOn(document);
  });

});
