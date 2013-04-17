"use strict";

var dataStore;
require(['app/data'], function(data) {
  dataStore = data
});

describeComponent('app/component_data/compose_box', function () {
  beforeEach(function () {
    setupComponent(
      {recipientHintId: 'abc'}
    );
  });

  it('serves compose box when requested', function () {
    spyOnEvent(document, 'dataComposeBoxServed');
    this.component.trigger('uiComposeBoxRequested', {});
    expect('dataComposeBoxServed').toHaveBeenTriggeredOn(document);
  });

  it('returns the contact_id when getRecipientId is passed a relatedMailId', function () {
    expect(this.component.getRecipientId('reply', 'mail_2139')).toBe('contact_342');
  });

  it('returns the recipientHintId when getRecipientId is not passed a relatedMailId', function () {
    expect(this.component.getRecipientId('reply')).toBe(this.component.attr.recipientHintId);
  });

  it('sends email when requested', function () {
    var dataMailItemsRefreshRequested = spyOnEvent(document, 'dataMailItemsRefreshRequested');
    this.component.trigger('uiSendRequested', {to_id: 'a', subject: 'b', message: 'c'});
    expect('dataMailItemsRefreshRequested').toHaveBeenTriggeredOn(document);
    var newMail = dataStore.mail.filter(function(e) {return e.contact_id == 'a'})[0];
    expect(newMail).toBeDefined();
    expect(newMail.contact_id).toBe('a');
    expect(newMail.subject).toBe('b');
    expect(newMail.message).toBe('c');
  });



});
