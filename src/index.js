const Box = require('i11e-box');

const Constants = {
  SEPARATOR: ':'
}

/**
 * parse the key and return the list of operations
 * @param  {String} key key to parse
 * @return {Array}     an array of operations {key, op}
 */
function parseKey(key) {
  var parts = key.split(Constants.SEPARATOR);
  if (parts.length == 1) {
    return {
      key: key,
      ops: ['=']
    }
  }

  var ops = parts.splice(-1, 1)[0];
  var field = parts.join(Constants.SEPARATOR);
  var ret = [];
  for (var i = 0; i < ops.length; i++) {
    var op = ops.charAt(i);

    if (op != '!' // not null
      && op != '?' // optional, check only if it is not null or not undefined
      && op != '=' // equal
      && op != '#' // deep equal, recursively check the children
      && op != '&' // check type
      && op != '-' // do not check
      && op != '^') { // must be null or undefined

      op = '=';
    }

    ret.push(op);
  }

  return {
    key: field,
    ops: ret
  };
}

function _check(box, template, rootPath) {
  var currentPath = null;

  for (let key in template) {
    if (template.hasOwnProperty(key)) {
      let parsedKey = parseKey(key);
      let field = parsedKey.key;
      let ops = parsedKey.ops;

      currentPath = rootPath.slice(); // copy root path
      currentPath.push(field);

      if (ops.indexOf('?') >= 0) {
        // optional
        let v = box.get(currentPath);
        if (v === null || v === undefined) {
          // skip the checking
          continue;
        }
      }

      for (let op of ops) {
        switch(op) {
          case '-': // do not check, skip
            break;
          case '?': // already handled before, do nothing here
            break;
          case '^': // must be null or undefined
            if (box.get(currentPath)) {
              throw new Error('Data path "' + currentPath.join('.') + 'MUST be null or undefined');
            }
            break;
          case '&': // type check
            if (typeof template[key] != typeof box.get(currentPath)) {
              throw new Error('Expect type of "' + currentPath.join('.') + '" as [' + (typeof template[key]) +
                '], but got [' + (typeof box.get(currentPath)) + ']');
            }
            break;
          case '!': // not null
            if (box.get(currentPath) == null || box.get(currentPath) == undefined ) {
              throw new Error('Expect "' + currentPath.join('.') + '" not null, but got ', box.get(currentPath));
            }
            break;
          case '#': // deep equal
            var newRootPath = rootPath.slice();
            newRootPath.push(field);

            if (typeof template[key] == 'object') {
              _check(box, template[key], newRootPath);
            } else if (typeof template[key] == 'function') {
              let fn = template[key];
              if (!fn(box.get(currentPath), box)) {
                throw new Error(`Failed to check path:${currentPath.join('.')}`);
              }
            } else {
              throw new Error('Expect "' + currentPath.join('.') + '" to be an object');
            }
            break;
          default: // default '=' equal
            if (typeof template[key] === 'object') {
              var newRootPath = rootPath.slice(); // just copy current root path
              newRootPath.push(field);
              _check(box, template[key], newRootPath);
            } else if (typeof template[key] === 'function') {
              let fn = template[key];
              if (!fn(box.get(currentPath), box)) {
                throw new Error(`Failed to check path:${currentPath.join('.')}`);
              }
            } else {
              if (template[key] != box.get(currentPath)) {
                throw new Error('Expect "' + currentPath.join('.') + '" as [' + template[key] +
                  '], but got [' + box.get(currentPath) + ']');
              }
            }
            break;
        }
      }
    }
  }
}

/**
 * Check a box with template
 *
 * Supported operations
 * - !: not null
 * - ?: optional, check only if it is not null or not undefined
 * - =: equal
 * - #: deep equal, recursively check the children
 * - &: check type
 * - -: do not check
 * - ^: must be null or undefined
 *
 * @param  {Box} box      the box to check
 * @param  {JSONV} template   jsonv template
 * @param  {Boolean} throwException   if throw exception, default true
 * @return {Boolean}          true if box is ok otherwise throw exception
 */
function check(box, template, throwException = true) {
  try{
    _check(box, template, [])
  } catch (err) {
    if (throwException) throw err;
    return false;
  }

  return true;
}

module.exports = check;
