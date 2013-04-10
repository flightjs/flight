"use strict";

describeComponent('app/component_ui/folders', function () {
  beforeEach(function () {
    setupComponent();
  });

  it('should listen to uiFolderSelectionChanged and trigger fetchMailItems', function () {
    var uiMailItemsRequested = spyOnEvent(document, 'uiMailItemsRequested');
    this.component.trigger('uiFolderSelectionChanged', {selectedIds: [0, 1, 2]});
    expect('uiMailItemsRequested').toHaveBeenTriggeredOn(document);
    // expect(dataExample.mostRecentCall.data).toEqual({
    //   example: 'foobar'
    // });
  });
});


// it('should listen to uiNeedsExampleData and trigger dataExample', function () {
//   var dataExample = spyOnEvent(document, 'dataExample');
//   this.component.$node.trigger('uiNeedsExampleData');
//   expect(dataExample).toHaveBeenTriggeredOn(document);
//   expect(dataExample.mostRecentCall.data).toEqual({
//     example: 'foobar'
//   });
// });