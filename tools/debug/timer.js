define(

  [],

  function() {
    /*
      usage:
          var t1 = timer('merge options');
          //merge options code
          t1(); //'merge options 232 ms'

          var t1 = timer('merge options', 300);
          //merge options code
          t1(); //[nothing to report]
    */
    return function(name, threshold) {
      var startAt = Date.now();
      return function() {
        var duration = Date.now() - startAt;
        (threshold || 0) <= duration && console.log(name, Date.now() - startAt, 'ms');
      }
    }
  }
);