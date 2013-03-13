"use strict";

define(['lib/component'], function (defineComponent) {

  describe('attachTo', function() {

    var $node;

    var Component = (function () {
      return defineComponent(function testComponent() {
        this.after('initialize', function() {
          $node = this.$node;
        })
      });
    })();


    it('should retain DOM selector in $node of attached component', function() {
      Component.attachTo('body');
      expect($node.selector).toEqual('body');
    });

  });

});
