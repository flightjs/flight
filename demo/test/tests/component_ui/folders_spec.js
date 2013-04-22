"use strict";

describeComponent('app/component_ui/folders', function() {
  beforeEach(function() {
    setupComponent();
  });

  it('should listen to uiFolderSelectionChanged and trigger fetchMailItems', function() {
    var uiMailItemsRequested = spyOnEvent(document, 'uiMailItemsRequested');
    this.component.trigger('uiFolderSelectionChanged', {selectedIds: [2, 3, 4]});
    expect('uiMailItemsRequested').toHaveBeenTriggeredOn(document);
    expect(uiMailItemsRequested.mostRecentCall.data).toEqual({
      folder: 2
    });
  });
});
