'use strict';

define(

  [
    'components/flight/lib/component'
  ],

  function(defineComponent) {

    return defineComponent(composeBox);

    function composeBox() {

      var selectedFolders = ['inbox']; //FIX ME
      var selectedMailItems;

      this.defaultAttrs({
        newMailType: 'new',
        forwardMailType: 'forward',
        replyMailType: 'reply',
        hintClass: 'hint',

        //selectors
        composeControl: '.compose',
        newControlSelector: '#new_mail',
        cancelSelector: '#cancel_composed',
        sendSelector: '#send_composed',
        toSelector: '#compose_to',
        subjectSelector: '#compose_subject',
        messageSelector: '#compose_message',
        recipientSelector: '#recipient_select',
        recipientHintSelector: '#recipient_hint',
        selectedRecipientSelector: '#recipient_select :selected',
        hintSelector: 'div.hint'
      });

      this.newMail = function() {
        this.requestComposeBox(this.attr.newMailType);
      };

      this.forward = function() {
        this.requestComposeBox(this.attr.forwardMailType, selectedMailItems);
      };

      this.reply = function() {
        this.requestComposeBox(this.attr.replyMailType, selectedMailItems);
      };

      this.requestComposeBox = function(type, relatedMailId) {
        this.trigger('uiComposeBoxRequested', {type: type, relatedMailId: relatedMailId});
      };

      this.launchComposeBox = function(ev, data) {
        var focusSelector = (data.type == this.attr.replyMailType) ? 'messageSelector' : 'toSelector';
        this.$node.html(data.markup).show();
        this.select(focusSelector).focus();
      };

      this.cancel = function() {
        this.$node.html('').hide();
      };

      this.requestSend = function() {
        var data = {
          to_id: this.select('selectedRecipientSelector').attr('id'),
          subject: this.select('subjectSelector').text(),
          message: this.select('messageSelector').text(),
          currentFolder: selectedFolders[0]
        };
        this.trigger('uiSendRequested', data);
        this.$node.hide();
      };

      this.enableSend = function() {
        this.select('recipientHintSelector').attr('disabled', 'disabled');
        this.select('sendSelector').removeAttr('disabled');
      };

      this.removeHint = function(ev, data) {
        $(ev.target).html('').removeClass(this.attr.hintClass);
      };

      this.updateMailItemSelections = function(ev, data) {
        selectedMailItems = data.selectedIds;
      }

      this.updateFolderSelections = function(ev, data) {
        selectedFolders = data.selectedIds;
      }

      this.after('initialize', function() {
        this.on(document, 'dataComposeBoxServed', this.launchComposeBox);
        this.on(document, 'uiForwardMail', this.forward);
        this.on(document, 'uiReplyToMail', this.reply);
        this.on(document, 'uiMailItemSelectionChanged', this.updateMailItemSelections);
        this.on(document, 'uiFolderSelectionChanged', this.updateFolderSelections);

        //the following bindings use delegation so that the event target is read at event time
        this.on(document, "click", {
          'cancelSelector': this.cancel,
          'sendSelector': this.requestSend,
          'newControlSelector': this.newMail
        });
        this.on('change', {
          'recipientSelector': this.enableSend
        });
        this.on('keydown', {
          'hintSelector': this.removeHint
        });
      });
    }
  }
);
