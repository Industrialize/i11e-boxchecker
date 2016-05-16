const boxchecker = require('../lib');
const Box = require('i11e-box');

exports['test boxchecker'] = {
  'test primitive type check': (test) => {
    var box = new Box({
      a: 100,
      b: 'this is a string',
      c: true
    });

    try {
      var valid = boxchecker(box, {
        a: 100,
        b: 'this is a string',
        c: true
      });
      test.equal(valid, true);
    } catch (err) {
      test.ok(false, err.message);
    }

    test.done();
  },

  'test optional type check': (test) => {
    var box = new Box({
      a: 100,
      b: 'this is a string',
      c: true
    });

    try {
      var valid = boxchecker(box, {
        "a:?=": 100,
        b: 'this is a string',
        c: true,
        "d:?=": 'another optional field'
      });

      test.equal(valid, true);
    } catch (err) {
      console.error(err.stack);
      test.ok(false, err.message);
    }

    test.done();
  },

  'test not null': (test) => {
    var box = new Box({
      a: 100,
      b: 'this is a string',
      c: true
    });

    try {
      var valid = boxchecker(box, {
        "a:!": 100,
        "b:!": 'this is a string',
        "c:!": true,
      });

      test.equal(valid, true);
    } catch (err) {
      console.error(err.stack);
      test.ok(false, err.message);
    }

    test.done();
  },

  'test failed on null': (test) => {
    var box = new Box({
      a: 100
    });

    try {
      var valid = boxchecker(box, {
        "a": 100,
        "b:!": 'this is a string',
      });

      test.equal(valid, true);
    } catch (err) {
      test.ok(true, err.message);
      test.done();
      return;
    }

    test.done();
  },

  'test deep equal': (test) => {
    var box = new Box({
      a: {
        b: {
          c: 100
        }
      }
    });

    try {
      var valid = boxchecker(box, {
        "a:#": {
          "b:#": {
            c: 100
          }
        }
      });

      test.equal(valid, true);
    } catch (err) {
      console.error(err.stack);
      test.ok(false, err.message);
    }

    test.done();
  },

  'test check type': (test) => {
    var box = new Box({
      a: 100,
      b: 'string',
      c: false
    });

    try {
      var valid = boxchecker(box, {
        "a:&": 100,
        "b:&": 'this is a string',
        "c:&": true,
      });

      test.equal(valid, true);
    } catch (err) {
      console.error(err.stack);
      test.ok(false, err.message);
    }

    test.done();
  },

  'test not check': (test) => {
    var box = new Box({
      a: 100,
      b: 'string',
      c: false
    });

    try {
      var valid = boxchecker(box, {
        "a:-": 101,
        "b:&": 'this is a string',
        "c:&": true,
      });

      test.equal(valid, true);
    } catch (err) {
      console.error(err.stack);
      test.ok(false, err.message);
    }

    test.done();
  },

  'test must be null or undefined': (test) => {
    var box = new Box({
      a: 100,
      b: 'string',
      c: false
    });

    try {
      var valid = boxchecker(box, {
        "d:^": 'string',
        "e:^": 100
      });

      test.equal(valid, true);
    } catch (err) {
      console.error(err.stack);
      test.ok(false, err.message);
    }

    test.done();
  }
}
