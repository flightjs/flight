"use strict";

describeComponent('app/component_ui/move_to_selector', function() {
  beforeEach(function () {
    setupComponent(readFixtures('move_to_selector.html'), {
      moveActionSelector: '#move_mail'
    });
  });

  it('asks for available folders when move is requested', function() {
    spyOnEvent(document, 'uiAvailableFoldersRequested');
    this.component.trigger('uiMoveMail');
    expect('uiAvailableFoldersRequested').toHaveBeenTriggeredOn(document);
  });

  it('launches move selector when available folders are served', function() {
    this.component.trigger('dataMoveToItemsServed', {markup: '<br>'});
    expect(this.component.$node).toBeVisible();
  });

  it('hides launched selector after click', function() {
    this.component.launchSelector(null, {markup: '<br>'})
    window.setTimeout(function() {
      this.component.trigger('click');
      expect(this.component.$node).not.toBeVisible();
    }.bind(this),0);
  });

  it('requests move when folder selected', function() {
    var uiMoveItemsRequested = spyOnEvent(document, 'uiMoveItemsRequested');
    this.component.trigger('uiMoveToSelectionChanged', {selectedIds: [96]});
    expect('uiMoveItemsRequested').toHaveBeenTriggeredOn(document);
    expect(uiMoveItemsRequested.mostRecentCall.data.toFolder).toEqual(96);
  });

});
