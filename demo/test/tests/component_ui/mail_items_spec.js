"use strict";

describeComponent('app/component_ui/mail_items', function() {
  beforeEach(function() {
    setupComponent('<div id="container"></>', {
      itemContainerSelector: '#container',
      deleteFolder: 'delete',
      selectedFolders: ['inbox'],
      selectedMailItems: [2, 3]});
  });

  it('should render mail data in items container', function() {
    this.component.attr.itemContainerSelector = '#container';
    this.component.trigger('dataMailItemsServed', {markup: readFixtures('mail_items.html')});
    expect(this.component.select('itemContainerSelector').find('tr').length).toBe(3);
  });

  it('should trigger unselect all when rendering mail', function() {
    var uiMailItemSelectionChanged = spyOnEvent(document, 'uiMailItemSelectionChanged');
    this.component.trigger('dataMailItemsServed', {markup: readFixtures('mail_items.html')});
    expect('uiMailItemSelectionChanged').toHaveBeenTriggeredOn(document);
    expect(uiMailItemSelectionChanged.mostRecentCall.data).toEqual({
      selectedIds: []
    });
  });

  it('should request selections to move to trash when delete triggered', function() {
    var uiMoveItemsRequested = spyOnEvent(document, 'uiMoveItemsRequested');
    this.component.trigger('uiDeleteMail');
    expect('uiMoveItemsRequested').toHaveBeenTriggeredOn(document);
    expect(uiMoveItemsRequested.mostRecentCall.data).toEqual({
      itemIds: [2, 3],
      fromFolder: 'inbox',
      toFolder: 'delete'
    });
  });

  it('should update mail selections', function() {
    this.component.trigger('uiMailItemSelectionChanged', {selectedIds: [4, 5]});
    expect(this.component.attr.selectedMailItems).toEqual([4, 5]);
  });

  it('should update folder selections', function() {
    this.component.trigger('uiFolderSelectionChanged', {selectedIds: ['sent']});
    expect(this.component.attr.selectedFolders).toEqual(['sent']);
  });
});
