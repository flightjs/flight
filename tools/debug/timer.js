define(

  [],

  function() {
    /*
      usage:
          var t1 = timer('merge options');
          //merge options code
          t1(); //'merge options 232 ms'
    */
    return function(name) {
      var startAt = Date.now();
      return function() {
        console.log(name, Date.now() - startAt, 'ms');
      }
    }
  }
);