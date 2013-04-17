"use strict";

describeComponent('app/component_ui/compose_box', function () {
  beforeEach(function () {
    setupComponent(
      readFixtures('compose_box.html'),
      {
        newMailType: 'newMail',
        forwardMailType: 'forward',
        replyMailType: 'reply',
        newControlSelector: '#new_mail',
        cancelSelector: '#cancel_composed',
        sendSelector: '#send_composed',
        recipientSelector: '#recipient_select'
      }
    );
  });

  it('shows compose box when compose box data is served', function () {
    this.component.trigger('dataComposeBoxServed', {type: 'anything'});
    expect(this.component.$node).toBeVisible();
  });

  it('hides compose box when cancel is triggered', function () {
    this.component.trigger(this.component.attr.cancelSelector, 'click');
    expect(this.component.$node).not.toBeVisible();
  });

  it('requests appropriate compose box when new mail is triggered', function () {
    var uiComposeBoxRequested = spyOnEvent(document, 'uiComposeBoxRequested');
    this.component.trigger(this.component.attr.newControlSelector, 'click');
    expect('uiComposeBoxRequested').toHaveBeenTriggeredOn(document);
    expect(uiComposeBoxRequested.mostRecentCall.data.type).toEqual(this.component.attr.newMailType);
  });

  it('requests appropriate compose box when forward is triggered', function () {
    var uiComposeBoxRequested = spyOnEvent(document, 'uiComposeBoxRequested');
    this.component.trigger('uiForwardMail');
    expect('uiComposeBoxRequested').toHaveBeenTriggeredOn(document);
    expect(uiComposeBoxRequested.mostRecentCall.data.type).toEqual(this.component.attr.forwardMailType);
  });

  it('requests appropriate compose box when reply is triggered', function () {
    var uiComposeBoxRequested = spyOnEvent(document, 'uiComposeBoxRequested');
    this.component.trigger('uiReplyToMail');
    expect('uiComposeBoxRequested').toHaveBeenTriggeredOn(document);
    expect(uiComposeBoxRequested.mostRecentCall.data.type).toEqual(this.component.attr.replyMailType);
  });

  it('triggers send request when send selected', function () {
    var uiSendRequested = spyOnEvent(document, 'uiSendRequested');
    this.component.trigger(this.component.attr.sendSelector, 'click');
    expect('uiSendRequested').toHaveBeenTriggeredOn(document);
  });

  it('hides compose box when send selected', function () {
    this.component.trigger(this.component.attr.sendSelector, 'click');
    expect(this.component.$node).not.toBeVisible();
  });

  it('enables send when recipient is changed', function () {
    this.component.trigger(this.component.attr.recipientSelector, 'change');
    expect(this.component.select('sendSelector')).not.toBeDisabled();
  });


});
