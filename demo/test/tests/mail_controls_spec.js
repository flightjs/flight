"use strict";

describeComponent('app/component_ui/mail_controls', function () {
  beforeEach(function () {
    setupComponent(readFixtures('mail_controls.html'));
  });

  it('should trigger appropriate event when delete control clicked', function () {
    var uiDeleteMail = spyOnEvent(document, 'uiDeleteMail');
    this.component.trigger(this.component.select('deleteControlSelector'), 'click');
    expect('uiDeleteMail').toHaveBeenTriggeredOn(document);
  });

  //
  // it('should trigger appropriate event when move control clicked', function () {
  //   var uiMoveMail = spyOnEvent(document, 'uiMoveMail');
  //   expect('uiMoveMail').toHaveBeenTriggeredOn(document);
  // });
  //
  //
  // it('should trigger appropriate event when forward control clicked', function () {
  //   var uiForwardMail = spyOnEvent(document, 'uiForwardMail');
  //   expect('uiForwardMail').toHaveBeenTriggeredOn(document);
  // });
  //
  //
  // it('should trigger appropriate event when reply to control clicked', function () {
  //   var uiReplyToMail = spyOnEvent(document, 'uiReplyToMail');
  //   expect('uiReplyToMail').toHaveBeenTriggeredOn(document);
  // });
});
