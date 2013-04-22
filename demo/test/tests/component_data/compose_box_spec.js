"use strict";

describeComponent('app/component_data/compose_box', function() {
  beforeEach(function() {
    setupComponent(
      {
        recipientHintId: "abc",
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

  it('serves compose box when requested', function() {
    spyOnEvent(document, 'dataComposeBoxServed');
    this.component.trigger('uiComposeBoxRequested', {});
    expect('dataComposeBoxServed').toHaveBeenTriggeredOn(document);
  });

  it('returns the contact_id when getRecipientId is passed a relatedMailId', function() {
    expect(this.component.getRecipientId('reply', 'mail_1')).toBe('contact_3');
  });

  it('returns the recipientHintId when getRecipientId is not passed a relatedMailId', function() {
    expect(this.component.getRecipientId('reply')).toBe(this.component.attr.recipientHintId);
  });

  it('sends email when requested', function() {
    var dataMailItemsRefreshRequested = spyOnEvent(document, 'dataMailItemsRefreshRequested');
    this.component.trigger('uiSendRequested', {to_id: 'contact_9', subject: 'b', message: 'c'});
    expect('dataMailItemsRefreshRequested').toHaveBeenTriggeredOn(document);
    var newMail = this.component.attr.dataStore.mail.filter(function(e) {return e.contact_id == 'contact_9'})[0];
    expect(newMail).toBeDefined();
    expect(newMail.contact_id).toBe('contact_9');
    expect(newMail.subject).toBe('b');
    expect(newMail.message).toBe('c');
  });
});
