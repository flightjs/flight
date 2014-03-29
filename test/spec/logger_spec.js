"use strict";

define(['lib/component', 'lib/debug'], function(defineComponent, debug) {

  var instance;
  var Component;
  var div = $('<div class="myDiv"></div>').appendTo('body')[0];
  var span = $('<span class="mySpan"></span>').appendTo('body')[0];

  describe('(Core) logger', function () {

    beforeEach(function () {
      debug.enable(true);
      debug.events.logAll();
      Component = (function () {
        return defineComponent(function() {
          this.handler = function() {};
        });
      })();
      instance = (new Component).initialize(div);
    });

    afterEach(function () {
      debug.enable(false);
      debug.events.logNone();
      Component.teardownAll();
    });

    describe('trigger logging', function () {
      it('logs trigger for default node', function () {
        spyOn(console, 'info');
        instance.trigger('click');
        expect(console.info).toHaveBeenCalledWith('->', 'trigger', '[click]', '\'div.myDiv\'', '');
      });

      it('logs trigger for custom node', function () {
        spyOn(console, 'info');
        instance.trigger('document', 'click');
        expect(console.info).toHaveBeenCalledWith('->', 'trigger', '[click]', 'document', '');
      });

      it('logs trigger with payload', function () {
        var data = {a:2};
        spyOn(console, 'info');
        instance.trigger('click', data);
        expect(console.info).toHaveBeenCalledWith('->', 'trigger', '[click]', data, '\'div.myDiv\'', '');
      });

      it('logs trigger with event object', function () {
        spyOn(console, 'info');
        instance.trigger({type:'click'});
        expect(console.info).toHaveBeenCalledWith('->', 'trigger', '[click]', '\'div.myDiv\'', '');
      });

      it('logs trigger for custom node with event object', function () {
        spyOn(console, 'info');
        instance.trigger('document', {type:'click'});
        expect(console.info).toHaveBeenCalledWith('->', 'trigger', '[click]', 'document', '');
      });

      it('logs trigger with event object and payload', function () {
        var data = {a:2};
        spyOn(console, 'info');
        instance.trigger({type:'click'}, data);
        expect(console.info).toHaveBeenCalledWith('->', 'trigger', '[click]', data, '\'div.myDiv\'', '');
      });

      it('logs trigger for custom node with event object and payload', function () {
        var data = {a:2};
        spyOn(console, 'info');
        instance.trigger('document', {type:'click'}, data);
        expect(console.info).toHaveBeenCalledWith('->', 'trigger', '[click]', data, 'document', '');
      });
    });

    describe('on logging', function () {
      it('logs on events for default node', function () {
        spyOn(console, 'info');
        instance.on('start', instance.handler);
        expect(console.info).toHaveBeenCalledWith('<-', 'on', '[start]', '\'div.myDiv\'', '');
      });

      it('logs on events for custom node', function () {
        spyOn(console, 'info');
        instance.on('body', 'start', instance.handler);
        expect(console.info).toHaveBeenCalledWith('<-', 'on', '[start]', 'body', '');
      });
    });

    describe('off logging', function () {
      it('logs off events for default node and no handler', function () {
        spyOn(console, 'info');
        instance.off('start');
        expect(console.info).toHaveBeenCalledWith('x ', 'off', '[start]', '\'div.myDiv\'', '');
      });

      it('logs off events for default node with handler', function () {
        spyOn(console, 'info');
        instance.off('start', instance.handler);
        expect(console.info).toHaveBeenCalledWith('x ', 'off', '[start]', '\'div.myDiv\'', '');
      });

      it('logs off events for custom node with handler', function () {
        spyOn(console, 'info');
        instance.off('.mySpan', 'start', instance.handler);
        expect(console.info).toHaveBeenCalledWith('x ', 'off', '[start]', '.mySpan', '');
      });
    });

    describe('log filters', function () {
      it('only logs filtered actions', function () {
        debug.events.logByAction('on', 'off');
        spyOn(console, 'info');
        instance.trigger('click');
        expect(console.info).not.toHaveBeenCalled();

        console.info.isSpy = false;
        spyOn(console, 'info');
        instance.on('click', instance.handler);
        expect(console.info).toHaveBeenCalled();

        console.info.isSpy = false;
        spyOn(console, 'info');
        instance.off('click', instance.handler);
        expect(console.info).toHaveBeenCalled();
      });

      it('only logs filtered event names', function () {
        debug.events.logByName('click', 'clack');
        spyOn(console, 'info');
        instance.trigger('click');
        expect(console.info).toHaveBeenCalled();

        console.info.isSpy = false;
        spyOn(console, 'info');
        instance.on('clack', instance.handler);
        expect(console.info).toHaveBeenCalled();

        console.info.isSpy = false;
        spyOn(console, 'info');
        instance.off('cluck', instance.handler);
        expect(console.info).not.toHaveBeenCalled();
      });

      it('only logs filtered event objects', function () {
        debug.events.logByName('click', 'clack');
        spyOn(console, 'info');
        instance.trigger({type:'click'});
        expect(console.info).toHaveBeenCalled();

        console.info.isSpy = false;
        spyOn(console, 'info');
        instance.on({type:'clack'}, instance.handler);
        expect(console.info).toHaveBeenCalled();

        console.info.isSpy = false;
        spyOn(console, 'info');
        instance.off({type:'cluck'}, instance.handler);
        expect(console.info).not.toHaveBeenCalled();
      });

      it('logs nothing when filter set to none', function () {
        debug.events.logNone();
        spyOn(console, 'info');
        instance.trigger('click');
        expect(console.info).not.toHaveBeenCalled();

        console.info.isSpy = false;
        spyOn(console, 'info');
        instance.on('click', instance.handler);
        expect(console.info).not.toHaveBeenCalled();

        console.info.isSpy = false;
        spyOn(console, 'info');
        instance.off('click', instance.handler);
        expect(console.info).not.toHaveBeenCalled();

        console.info.isSpy = false;
        spyOn(console, 'info');
        instance.trigger('click');
        expect(console.info).not.toHaveBeenCalled();

        console.info.isSpy = false;
        spyOn(console, 'info');
        instance.on('clack', instance.handler);
        expect(console.info).not.toHaveBeenCalled();

        console.info.isSpy = false;
        spyOn(console, 'info');
        instance.off('cluck', instance.handler);
        expect(console.info).not.toHaveBeenCalled();
      });
    });
  });
});
