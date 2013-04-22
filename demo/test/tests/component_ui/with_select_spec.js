"use strict";

describeMixin('app/component_ui/with_select', function() {
  beforeEach(function() {
    setupComponent(readFixtures('mail_items.html'), {
      selectedItemSelector: 'tr.mail-item.selected',
      selectionChangedEvent: 'testSelectionChangedEvent',
      selectedClass: 'selected'
    });
  });

  it('appends selection to the selectionItem cache', function() {
    var $selectedElem = $('#mail_1');
    this.component.selectItem($selectedElem);
    expect(this.component.getSelectedIds().length).toBe(1);
  });

  it('adds the selected class to the selected item', function() {
    var $selectedElem = $('#mail_2');
    this.component.selectItem($selectedElem);
    expect($selectedElem).toBe('.' + this.component.attr.selectedClass);
  });

  it('it triggers selectionChangedEvent on selection', function() {
    var $selectedElem = $('#mail_2139');
    var testSelectionChangedEvent = spyOnEvent(document, 'testSelectionChangedEvent');
    this.component.selectItem($selectedElem);
    expect('testSelectionChangedEvent').toHaveBeenTriggeredOn(document);
    expect(testSelectionChangedEvent.mostRecentCall.data).toEqual({
      selectedIds: this.component.getSelectedIds()
    });
  });

  it('removes unselected item from the selectionItem cache', function() {
    var $unselectedElem = $('#mail_1');
    this.component.attr.selectedIds = ['#mail_1']
    this.component.unselectItem($unselectedElem);
    expect(this.component.getSelectedIds().length).toBe(0);
  });

  it('removes the selected class from the unselected item', function() {
    var $unselectedElem = $('#mail_1');
    $unselectedElem.addClass(this.component.attr.selectedClass);
    this.component.unselectItem($unselectedElem);
    expect($unselectedElem).not.toBe('.' + this.component.attr.selectedClass);
  });

  it('triggers selectionChangedEvent on unselection', function() {
    var $unselectedElem = $('#mail_1');
    var testSelectionChangedEvent = spyOnEvent(document, 'testSelectionChangedEvent');
    this.component.selectItem($unselectedElem);
    expect('testSelectionChangedEvent').toHaveBeenTriggeredOn(document);
    expect(testSelectionChangedEvent.mostRecentCall.data).toEqual({
      selectedIds: this.component.getSelectedIds()
    });
  });

  it('unselects when toggleItemSelect is called on a selected item', function() {
    var $selectedElem = $('#mail_1');
    this.component.attr.selectedIds = ['#mail_1'];
    $selectedElem.addClass(this.component.attr.selectedClass);
    this.component.toggleItemSelect(null, {el: $selectedElem});
    expect(this.component.getSelectedIds().length).toBe(0);
    expect($selectedElem).not.toBe('.' + this.component.attr.selectedClass);
  });

  it('selects when toggleItemSelect is called on an unselected item', function() {
    var $selectedElem = $('#mail_1');
    this.component.toggleItemSelect(null, {el: $selectedElem});
    expect(this.component.getSelectedIds().length).toBe(1);
    expect($selectedElem).toBe('.' + this.component.attr.selectedClass);
  });

  it('adds selected items to selectedIds when initializeSelections called', function() {
    $('#mail_1').addClass(this.component.attr.selectedClass);
    $('#mail_2').addClass(this.component.attr.selectedClass);
    this.component.initializeSelections();
    expect(this.component.getSelectedIds()).toEqual(['mail_1', 'mail_2']);
  });

});
