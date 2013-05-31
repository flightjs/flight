"use strict";

define(['lib/component', 'lib/advice'], function (defineComponent, advice) {

  var Component = (function () {
    return defineComponent(function fnTest() {
    });
  })();

  describe('(Core) advice', function () {

    afterEach(function () {
      Component.teardownAll();
    });

    it('should call the "before" function before the base function and return the base function', function () {
      var test1 = "";

      function base(arg) {
        test1 += 'Base: ' + arg;
        return 'base';
      }

      var advised = advice.before(base, function (arg) {
        test1 += "Before: " + arg + ', ';
        return 'before';
      });

      expect(advised('Dan')).toBe('base');
      expect(test1).toBe('Before: Dan, Base: Dan');
    });

    it('should call the "after" function after the base function, but return the base function', function () {
      var test1 = "";

      function base(arg) {
        test1 += 'Base: ' + arg;
        return 'base';
      }

      var advised = advice.after(base, function (arg) {
        test1 += ", After: " + arg;
        return 'after';
      });

      expect(advised('Dan')).toBe('base');
      expect(test1).toBe('Base: Dan, After: Dan');
    });

    it('should wrap the the first "around" argument with the second argument', function () {
      var test1 = "";

      function base(arg) {
        test1 += 'Base: ' + arg;
        return 'base';
      }

      var advised = advice.around(base, function (orig, arg) {
        test1 += '|';
        orig(arg);
        test1 += '|';
        return 'around';
      });

      expect(advised('Dan')).toBe('around');
      expect(test1).toBe('|Base: Dan|');
    });

    describe("withAdvice", function () {
      it('should add "before", "after" and "around" to an object', function () {
        var subject = {
          testa: '',
          testb: '',
          testc: '',
          a: function () {
            this.testa += 'A!';
          },
          b: function () {
            this.testb += 'B!';
          },
          c: function () {
            this.testc += 'C!';
          }
        }

        advice.withAdvice.call(subject);

        subject.before('a', function () {
          this.testa += 'BEFORE!';
        });

        subject.after('b', function () {
          this.testb += 'AFTER!';
        });

        subject.around('c', function (orig) {
          this.testc += '|';
          orig.call(subject);
          this.testc += '|';
        });

        subject.a();
        expect(subject.testa).toBe('BEFORE!A!');

        subject.b();
        expect(subject.testb).toBe('B!AFTER!');

        subject.c();
        expect(subject.testc).toBe('|C!|');
      });
    });

  });

});