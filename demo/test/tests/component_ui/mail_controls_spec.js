"use strict";

describeComponent('app/component_ui/mail_controls', function() {
  beforeEach(function () {
    setupComponent(readFixtures('mail_controls.html'));
  });

  it('should trigger appropriate event when delete control clicked', function() {
    spyOnEvent(document, 'uiDeleteMail');
    this.component.trigger(this.component.select('deleteControlSelector'), 'click');
    expect('uiDeleteMail').toHaveBeenTriggeredOn(document);
  });


  it('should trigger appropriate event when move control clicked', function() {
    spyOnEvent(document, 'uiMoveMail');
    this.component.trigger(this.component.select('moveControlSelector'), 'click');
    expect('uiMoveMail').toHaveBeenTriggeredOn(document);
  });


  it('should trigger appropriate event when forward control clicked', function() {
    spyOnEvent(document, 'uiForwardMail');
    this.component.trigger(this.component.select('forwardControlSelector'), 'click');
    expect('uiForwardMail').toHaveBeenTriggeredOn(document);
  });


  it('should trigger appropriate event when reply to control clicked', function() {
    spyOnEvent(document, 'uiReplyToMail');
    this.component.trigger(this.component.select('replyControlSelector'), 'click');
    expect('uiReplyToMail').toHaveBeenTriggeredOn(document);
  });

  it('should not enable any buttons when no items are selected', function() {
    this.component.trigger('uiMailItemSelectionChanged', {selectedIds:[]});
    var selected = this.component.select('actionControlsSelector').filter(function() {
      return this.getAttribute('disabled') == null;
    });
    expect(selected.length).toBe(0);
  });

  it('should enable all buttons when exactly one item is selected', function() {
    this.component.trigger('uiMailItemSelectionChanged', {selectedIds:[0]});
    var selected = this.component.select('actionControlsSelector').filter(function() {
      return this.getAttribute('disabled') == 'disabled';
    });
    expect(selected.length).toBe(0);
  });

  it('should enable delete and move when more than one item is selected', function() {
    this.component.trigger('uiMailItemSelectionChanged', {selectedIds:[0, 1]});
    expect(this.component.select('deleteControlSelector')).not.toBeDisabled();
    expect(this.component.select('moveControlSelector')).not.toBeDisabled();
  });

  it('should not enable fwd and reply when more than one item is selected', function() {
    this.component.trigger('uiMailItemSelectionChanged', {selectedIds:[0, 1]});
    expect(this.component.select('forwardControlSelector')).toBeDisabled();
    expect(this.component.select('replyControlSelector')).toBeDisabled();
  });

  it('should disbale all buttons when folder is selected', function() {
    this.component.trigger('uiFolderSelectionChanged');
    var selected = this.component.select('actionControlsSelector').filter(function() {
      return this.getAttribute('disabled') == null;
    });
    expect(selected.length).toBe(0);
  });





});
