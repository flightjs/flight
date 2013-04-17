"use strict";

describeComponent('app/component_ui/move_to_selector', function () {
  beforeEach(function () {
    setupComponent(readFixtures('move_to_selector.html'), {
      //
    });
  });

  it('asks for available folders when move is requested', function () {
    var uiAvailableFoldersRequested = spyOnEvent(document, 'uiAvailableFoldersRequested');
    this.component.trigger('uiMoveMail');
    expect('uiAvailableFoldersRequested').toHaveBeenTriggeredOn(document);
  });

  it('launches selector when available folders are served', function () {
    var uiAvailableFoldersRequested = spyOnEvent(document, 'uiAvailableFoldersRequested');
    this.component.trigger('uiMoveMail');
    expect('uiAvailableFoldersRequested').toHaveBeenTriggeredOn(document);
  });


});
