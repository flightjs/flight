"use strict";

describeComponent('app/component_ui/mail_items', function () {
  beforeEach(function () {
    setupComponent(
      "<table>\
         <tr class='mail-item'><td></td></tr>\
         <tr class='mail-item selected'><td></td></tr>\
      </table>"
    );
  });

// OR
// setUpComponent(readFixture('blah.js')

  // it('should listen to uiFolderSelectionChanged and trigger fetchMailItems', function () {
  //   var uiMailItemsRequested = spyOnEvent(document, 'uiMailItemsRequested');
  //   this.component.trigger('uiFolderSelectionChanged', {selectedIds: [2, 3, 4]});
  //   expect('uiMailItemsRequested').toHaveBeenTriggeredOn(document);
  //   expect(uiMailItemsRequested.mostRecentCall.data).toEqual({
  //     folder: 2
  //   });
  // });
});
