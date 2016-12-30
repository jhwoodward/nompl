
function gcd2(x, y) {
  if ((typeof x !== 'number') || (typeof y !== 'number'))
    return false;
  x = Math.abs(x);
  y = Math.abs(y);
  while (y) {
    var t = y;
    y = x % y;
    x = t;
  }
  return x;
}

var api = {
  loop: function (phrase, n) {
    var out = '';
    for (var i = 1; i <= n; i++) {
      out += phrase;
    }
    return out;
  },
  barRest: function (n) {
    n = n || 1;
    return api.loop('192,^', n);
  },
  getLcm: function (input) {
    if (toString.call(input) !== "[object Array]")
      return false;
    var len, a, b;
    len = input.length;
    if (!len) {
      return null;
    }
    a = input[0];
    for (var i = 1; i < len; i++) {
      b = input[i];
      a = lcm2(a, b);
    }
    return a;

    function lcm2(x, y) {
      return x * y / gcd2(x, y);
    }

  },
  getGcd: function (input) {
    if (toString.call(input) !== "[object Array]")
      return false;
    var len, a, b;
    len = input.length;
    if (!len) {
      return null;
    }
    a = input[0];
    for (var i = 1; i < len; i++) {
      b = input[i];
      a = gcd2(a, b);
    }
    return a;
  }
};

module.exports = api;

/*
  getLcm: function (input_array) {
    if (toString.call(input_array) !== "[object Array]")
      return false;
    var r1 = 0, r2 = 0;
    var l = input_array.length;
    for (i = 0; i < l; i++) {
      r1 = input_array[i] % input_array[i + 1];
      if (r1 === 0) {
        input_array[i + 1] = (input_array[i] * input_array[i + 1]) / input_array[i + 1];
      }
      else {
        r2 = input_array[i + 1] % r1;
        if (r2 === 0) {
          input_array[i + 1] = (input_array[i] * input_array[i + 1]) / r1;
        }
        else {
          input_array[i + 1] = (input_array[i] * input_array[i + 1]) / r2;
        }
      }
    }

    function lcm2(x, y) {
      return x * y / gcd2(x, y);
    }
    return Math.round(input_array[l - 1]);
  },
  */