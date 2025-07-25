#!/usr/bin/env node
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to =
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, "default", { value: mod, enumerable: true })
      : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (
  mod || cb((mod = { exports: {} }).exports, mod),
  mod.exports
);
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => (all[name] = () => newValue)
    });
};

// node_modules/uri-js/dist/es5/uri.all.js
var require_uri_all = __commonJS((exports, module) => {
  (function (global, factory) {
    typeof exports === "object" && typeof module !== "undefined"
      ? factory(exports)
      : typeof define === "function" && define.amd
        ? define(["exports"], factory)
        : factory((global.URI = global.URI || {}));
  })(exports, function (exports2) {
    function merge() {
      for (
        var _len = arguments.length, sets = Array(_len), _key = 0;
        _key < _len;
        _key++
      ) {
        sets[_key] = arguments[_key];
      }
      if (sets.length > 1) {
        sets[0] = sets[0].slice(0, -1);
        var xl = sets.length - 1;
        for (var x = 1; x < xl; ++x) {
          sets[x] = sets[x].slice(1, -1);
        }
        sets[xl] = sets[xl].slice(1);
        return sets.join("");
      } else {
        return sets[0];
      }
    }
    function subexp(str) {
      return "(?:" + str + ")";
    }
    function typeOf(o) {
      return o === undefined
        ? "undefined"
        : o === null
          ? "null"
          : Object.prototype.toString
              .call(o)
              .split(" ")
              .pop()
              .split("]")
              .shift()
              .toLowerCase();
    }
    function toUpperCase(str) {
      return str.toUpperCase();
    }
    function toArray(obj) {
      return obj !== undefined && obj !== null
        ? obj instanceof Array
          ? obj
          : typeof obj.length !== "number" ||
              obj.split ||
              obj.setInterval ||
              obj.call
            ? [obj]
            : Array.prototype.slice.call(obj)
        : [];
    }
    function assign(target, source) {
      var obj = target;
      if (source) {
        for (var key in source) {
          obj[key] = source[key];
        }
      }
      return obj;
    }
    function buildExps(isIRI2) {
      var ALPHA$$ = "[A-Za-z]",
        CR$ = "[\\x0D]",
        DIGIT$$ = "[0-9]",
        DQUOTE$$ = "[\\x22]",
        HEXDIG$$2 = merge(DIGIT$$, "[A-Fa-f]"),
        LF$$ = "[\\x0A]",
        SP$$ = "[\\x20]",
        PCT_ENCODED$2 = subexp(
          subexp(
            "%[EFef]" +
              HEXDIG$$2 +
              "%" +
              HEXDIG$$2 +
              HEXDIG$$2 +
              "%" +
              HEXDIG$$2 +
              HEXDIG$$2
          ) +
            "|" +
            subexp("%[89A-Fa-f]" + HEXDIG$$2 + "%" + HEXDIG$$2 + HEXDIG$$2) +
            "|" +
            subexp("%" + HEXDIG$$2 + HEXDIG$$2)
        ),
        GEN_DELIMS$$ = "[\\:\\/\\?\\#\\[\\]\\@]",
        SUB_DELIMS$$ = "[\\!\\$\\&\\'\\(\\)\\*\\+\\,\\;\\=]",
        RESERVED$$ = merge(GEN_DELIMS$$, SUB_DELIMS$$),
        UCSCHAR$$ = isIRI2
          ? "[\\xA0-\\u200D\\u2010-\\u2029\\u202F-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF]"
          : "[]",
        IPRIVATE$$ = isIRI2 ? "[\\uE000-\\uF8FF]" : "[]",
        UNRESERVED$$2 = merge(ALPHA$$, DIGIT$$, "[\\-\\.\\_\\~]", UCSCHAR$$),
        SCHEME$ = subexp(
          ALPHA$$ + merge(ALPHA$$, DIGIT$$, "[\\+\\-\\.]") + "*"
        ),
        USERINFO$ = subexp(
          subexp(
            PCT_ENCODED$2 + "|" + merge(UNRESERVED$$2, SUB_DELIMS$$, "[\\:]")
          ) + "*"
        ),
        DEC_OCTET$ = subexp(
          subexp("25[0-5]") +
            "|" +
            subexp("2[0-4]" + DIGIT$$) +
            "|" +
            subexp("1" + DIGIT$$ + DIGIT$$) +
            "|" +
            subexp("[1-9]" + DIGIT$$) +
            "|" +
            DIGIT$$
        ),
        DEC_OCTET_RELAXED$ = subexp(
          subexp("25[0-5]") +
            "|" +
            subexp("2[0-4]" + DIGIT$$) +
            "|" +
            subexp("1" + DIGIT$$ + DIGIT$$) +
            "|" +
            subexp("0?[1-9]" + DIGIT$$) +
            "|0?0?" +
            DIGIT$$
        ),
        IPV4ADDRESS$ = subexp(
          DEC_OCTET_RELAXED$ +
            "\\." +
            DEC_OCTET_RELAXED$ +
            "\\." +
            DEC_OCTET_RELAXED$ +
            "\\." +
            DEC_OCTET_RELAXED$
        ),
        H16$ = subexp(HEXDIG$$2 + "{1,4}"),
        LS32$ = subexp(subexp(H16$ + "\\:" + H16$) + "|" + IPV4ADDRESS$),
        IPV6ADDRESS1$ = subexp(subexp(H16$ + "\\:") + "{6}" + LS32$),
        IPV6ADDRESS2$ = subexp("\\:\\:" + subexp(H16$ + "\\:") + "{5}" + LS32$),
        IPV6ADDRESS3$ = subexp(
          subexp(H16$) + "?\\:\\:" + subexp(H16$ + "\\:") + "{4}" + LS32$
        ),
        IPV6ADDRESS4$ = subexp(
          subexp(subexp(H16$ + "\\:") + "{0,1}" + H16$) +
            "?\\:\\:" +
            subexp(H16$ + "\\:") +
            "{3}" +
            LS32$
        ),
        IPV6ADDRESS5$ = subexp(
          subexp(subexp(H16$ + "\\:") + "{0,2}" + H16$) +
            "?\\:\\:" +
            subexp(H16$ + "\\:") +
            "{2}" +
            LS32$
        ),
        IPV6ADDRESS6$ = subexp(
          subexp(subexp(H16$ + "\\:") + "{0,3}" + H16$) +
            "?\\:\\:" +
            H16$ +
            "\\:" +
            LS32$
        ),
        IPV6ADDRESS7$ = subexp(
          subexp(subexp(H16$ + "\\:") + "{0,4}" + H16$) + "?\\:\\:" + LS32$
        ),
        IPV6ADDRESS8$ = subexp(
          subexp(subexp(H16$ + "\\:") + "{0,5}" + H16$) + "?\\:\\:" + H16$
        ),
        IPV6ADDRESS9$ = subexp(
          subexp(subexp(H16$ + "\\:") + "{0,6}" + H16$) + "?\\:\\:"
        ),
        IPV6ADDRESS$ = subexp(
          [
            IPV6ADDRESS1$,
            IPV6ADDRESS2$,
            IPV6ADDRESS3$,
            IPV6ADDRESS4$,
            IPV6ADDRESS5$,
            IPV6ADDRESS6$,
            IPV6ADDRESS7$,
            IPV6ADDRESS8$,
            IPV6ADDRESS9$
          ].join("|")
        ),
        ZONEID$ = subexp(subexp(UNRESERVED$$2 + "|" + PCT_ENCODED$2) + "+"),
        IPV6ADDRZ$ = subexp(IPV6ADDRESS$ + "\\%25" + ZONEID$),
        IPV6ADDRZ_RELAXED$ = subexp(
          IPV6ADDRESS$ + subexp("\\%25|\\%(?!" + HEXDIG$$2 + "{2})") + ZONEID$
        ),
        IPVFUTURE$ = subexp(
          "[vV]" +
            HEXDIG$$2 +
            "+\\." +
            merge(UNRESERVED$$2, SUB_DELIMS$$, "[\\:]") +
            "+"
        ),
        IP_LITERAL$ = subexp(
          "\\[" +
            subexp(IPV6ADDRZ_RELAXED$ + "|" + IPV6ADDRESS$ + "|" + IPVFUTURE$) +
            "\\]"
        ),
        REG_NAME$ = subexp(
          subexp(PCT_ENCODED$2 + "|" + merge(UNRESERVED$$2, SUB_DELIMS$$)) + "*"
        ),
        HOST$ = subexp(
          IP_LITERAL$ +
            "|" +
            IPV4ADDRESS$ +
            "(?!" +
            REG_NAME$ +
            ")" +
            "|" +
            REG_NAME$
        ),
        PORT$ = subexp(DIGIT$$ + "*"),
        AUTHORITY$ = subexp(
          subexp(USERINFO$ + "@") + "?" + HOST$ + subexp("\\:" + PORT$) + "?"
        ),
        PCHAR$ = subexp(
          PCT_ENCODED$2 + "|" + merge(UNRESERVED$$2, SUB_DELIMS$$, "[\\:\\@]")
        ),
        SEGMENT$ = subexp(PCHAR$ + "*"),
        SEGMENT_NZ$ = subexp(PCHAR$ + "+"),
        SEGMENT_NZ_NC$ = subexp(
          subexp(
            PCT_ENCODED$2 + "|" + merge(UNRESERVED$$2, SUB_DELIMS$$, "[\\@]")
          ) + "+"
        ),
        PATH_ABEMPTY$ = subexp(subexp("\\/" + SEGMENT$) + "*"),
        PATH_ABSOLUTE$ = subexp(
          "\\/" + subexp(SEGMENT_NZ$ + PATH_ABEMPTY$) + "?"
        ),
        PATH_NOSCHEME$ = subexp(SEGMENT_NZ_NC$ + PATH_ABEMPTY$),
        PATH_ROOTLESS$ = subexp(SEGMENT_NZ$ + PATH_ABEMPTY$),
        PATH_EMPTY$ = "(?!" + PCHAR$ + ")",
        PATH$ = subexp(
          PATH_ABEMPTY$ +
            "|" +
            PATH_ABSOLUTE$ +
            "|" +
            PATH_NOSCHEME$ +
            "|" +
            PATH_ROOTLESS$ +
            "|" +
            PATH_EMPTY$
        ),
        QUERY$ = subexp(
          subexp(PCHAR$ + "|" + merge("[\\/\\?]", IPRIVATE$$)) + "*"
        ),
        FRAGMENT$ = subexp(subexp(PCHAR$ + "|[\\/\\?]") + "*"),
        HIER_PART$ = subexp(
          subexp("\\/\\/" + AUTHORITY$ + PATH_ABEMPTY$) +
            "|" +
            PATH_ABSOLUTE$ +
            "|" +
            PATH_ROOTLESS$ +
            "|" +
            PATH_EMPTY$
        ),
        URI$ = subexp(
          SCHEME$ +
            "\\:" +
            HIER_PART$ +
            subexp("\\?" + QUERY$) +
            "?" +
            subexp("\\#" + FRAGMENT$) +
            "?"
        ),
        RELATIVE_PART$ = subexp(
          subexp("\\/\\/" + AUTHORITY$ + PATH_ABEMPTY$) +
            "|" +
            PATH_ABSOLUTE$ +
            "|" +
            PATH_NOSCHEME$ +
            "|" +
            PATH_EMPTY$
        ),
        RELATIVE$ = subexp(
          RELATIVE_PART$ +
            subexp("\\?" + QUERY$) +
            "?" +
            subexp("\\#" + FRAGMENT$) +
            "?"
        ),
        URI_REFERENCE$ = subexp(URI$ + "|" + RELATIVE$),
        ABSOLUTE_URI$ = subexp(
          SCHEME$ + "\\:" + HIER_PART$ + subexp("\\?" + QUERY$) + "?"
        ),
        GENERIC_REF$ =
          "^(" +
          SCHEME$ +
          ")\\:" +
          subexp(
            subexp(
              "\\/\\/(" +
                subexp("(" + USERINFO$ + ")@") +
                "?(" +
                HOST$ +
                ")" +
                subexp("\\:(" + PORT$ + ")") +
                "?)"
            ) +
              "?(" +
              PATH_ABEMPTY$ +
              "|" +
              PATH_ABSOLUTE$ +
              "|" +
              PATH_ROOTLESS$ +
              "|" +
              PATH_EMPTY$ +
              ")"
          ) +
          subexp("\\?(" + QUERY$ + ")") +
          "?" +
          subexp("\\#(" + FRAGMENT$ + ")") +
          "?$",
        RELATIVE_REF$ =
          "^(){0}" +
          subexp(
            subexp(
              "\\/\\/(" +
                subexp("(" + USERINFO$ + ")@") +
                "?(" +
                HOST$ +
                ")" +
                subexp("\\:(" + PORT$ + ")") +
                "?)"
            ) +
              "?(" +
              PATH_ABEMPTY$ +
              "|" +
              PATH_ABSOLUTE$ +
              "|" +
              PATH_NOSCHEME$ +
              "|" +
              PATH_EMPTY$ +
              ")"
          ) +
          subexp("\\?(" + QUERY$ + ")") +
          "?" +
          subexp("\\#(" + FRAGMENT$ + ")") +
          "?$",
        ABSOLUTE_REF$ =
          "^(" +
          SCHEME$ +
          ")\\:" +
          subexp(
            subexp(
              "\\/\\/(" +
                subexp("(" + USERINFO$ + ")@") +
                "?(" +
                HOST$ +
                ")" +
                subexp("\\:(" + PORT$ + ")") +
                "?)"
            ) +
              "?(" +
              PATH_ABEMPTY$ +
              "|" +
              PATH_ABSOLUTE$ +
              "|" +
              PATH_ROOTLESS$ +
              "|" +
              PATH_EMPTY$ +
              ")"
          ) +
          subexp("\\?(" + QUERY$ + ")") +
          "?$",
        SAMEDOC_REF$ = "^" + subexp("\\#(" + FRAGMENT$ + ")") + "?$",
        AUTHORITY_REF$ =
          "^" +
          subexp("(" + USERINFO$ + ")@") +
          "?(" +
          HOST$ +
          ")" +
          subexp("\\:(" + PORT$ + ")") +
          "?$";
      return {
        NOT_SCHEME: new RegExp(
          merge("[^]", ALPHA$$, DIGIT$$, "[\\+\\-\\.]"),
          "g"
        ),
        NOT_USERINFO: new RegExp(
          merge("[^\\%\\:]", UNRESERVED$$2, SUB_DELIMS$$),
          "g"
        ),
        NOT_HOST: new RegExp(
          merge("[^\\%\\[\\]\\:]", UNRESERVED$$2, SUB_DELIMS$$),
          "g"
        ),
        NOT_PATH: new RegExp(
          merge("[^\\%\\/\\:\\@]", UNRESERVED$$2, SUB_DELIMS$$),
          "g"
        ),
        NOT_PATH_NOSCHEME: new RegExp(
          merge("[^\\%\\/\\@]", UNRESERVED$$2, SUB_DELIMS$$),
          "g"
        ),
        NOT_QUERY: new RegExp(
          merge(
            "[^\\%]",
            UNRESERVED$$2,
            SUB_DELIMS$$,
            "[\\:\\@\\/\\?]",
            IPRIVATE$$
          ),
          "g"
        ),
        NOT_FRAGMENT: new RegExp(
          merge("[^\\%]", UNRESERVED$$2, SUB_DELIMS$$, "[\\:\\@\\/\\?]"),
          "g"
        ),
        ESCAPE: new RegExp(merge("[^]", UNRESERVED$$2, SUB_DELIMS$$), "g"),
        UNRESERVED: new RegExp(UNRESERVED$$2, "g"),
        OTHER_CHARS: new RegExp(
          merge("[^\\%]", UNRESERVED$$2, RESERVED$$),
          "g"
        ),
        PCT_ENCODED: new RegExp(PCT_ENCODED$2, "g"),
        IPV4ADDRESS: new RegExp("^(" + IPV4ADDRESS$ + ")$"),
        IPV6ADDRESS: new RegExp(
          "^\\[?(" +
            IPV6ADDRESS$ +
            ")" +
            subexp(
              subexp("\\%25|\\%(?!" + HEXDIG$$2 + "{2})") + "(" + ZONEID$ + ")"
            ) +
            "?\\]?$"
        )
      };
    }
    var URI_PROTOCOL = buildExps(false);
    var IRI_PROTOCOL = buildExps(true);
    var slicedToArray = (function () {
      function sliceIterator(arr, i) {
        var _arr = [];
        var _n = true;
        var _d = false;
        var _e = undefined;
        try {
          for (
            var _i = arr[Symbol.iterator](), _s;
            !(_n = (_s = _i.next()).done);
            _n = true
          ) {
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
          }
        } catch (err) {
          _d = true;
          _e = err;
        } finally {
          try {
            if (!_n && _i["return"]) _i["return"]();
          } finally {
            if (_d) throw _e;
          }
        }
        return _arr;
      }
      return function (arr, i) {
        if (Array.isArray(arr)) {
          return arr;
        } else if (Symbol.iterator in Object(arr)) {
          return sliceIterator(arr, i);
        } else {
          throw new TypeError(
            "Invalid attempt to destructure non-iterable instance"
          );
        }
      };
    })();
    var toConsumableArray = function (arr) {
      if (Array.isArray(arr)) {
        for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++)
          arr2[i] = arr[i];
        return arr2;
      } else {
        return Array.from(arr);
      }
    };
    var maxInt = 2147483647;
    var base = 36;
    var tMin = 1;
    var tMax = 26;
    var skew = 38;
    var damp = 700;
    var initialBias = 72;
    var initialN = 128;
    var delimiter = "-";
    var regexPunycode = /^xn--/;
    var regexNonASCII = /[^\0-\x7E]/;
    var regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g;
    var errors2 = {
      overflow: "Overflow: input needs wider integers to process",
      "not-basic": "Illegal input >= 0x80 (not a basic code point)",
      "invalid-input": "Invalid input"
    };
    var baseMinusTMin = base - tMin;
    var floor = Math.floor;
    var stringFromCharCode = String.fromCharCode;
    function error$1(type) {
      throw new RangeError(errors2[type]);
    }
    function map(array, fn) {
      var result = [];
      var length = array.length;
      while (length--) {
        result[length] = fn(array[length]);
      }
      return result;
    }
    function mapDomain(string, fn) {
      var parts = string.split("@");
      var result = "";
      if (parts.length > 1) {
        result = parts[0] + "@";
        string = parts[1];
      }
      string = string.replace(regexSeparators, ".");
      var labels = string.split(".");
      var encoded = map(labels, fn).join(".");
      return result + encoded;
    }
    function ucs2decode(string) {
      var output = [];
      var counter = 0;
      var length = string.length;
      while (counter < length) {
        var value = string.charCodeAt(counter++);
        if (value >= 55296 && value <= 56319 && counter < length) {
          var extra = string.charCodeAt(counter++);
          if ((extra & 64512) == 56320) {
            output.push(((value & 1023) << 10) + (extra & 1023) + 65536);
          } else {
            output.push(value);
            counter--;
          }
        } else {
          output.push(value);
        }
      }
      return output;
    }
    var ucs2encode = function ucs2encode(array) {
      return String.fromCodePoint.apply(String, toConsumableArray(array));
    };
    var basicToDigit = function basicToDigit(codePoint) {
      if (codePoint - 48 < 10) {
        return codePoint - 22;
      }
      if (codePoint - 65 < 26) {
        return codePoint - 65;
      }
      if (codePoint - 97 < 26) {
        return codePoint - 97;
      }
      return base;
    };
    var digitToBasic = function digitToBasic(digit, flag) {
      return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
    };
    var adapt = function adapt(delta, numPoints, firstTime) {
      var k = 0;
      delta = firstTime ? floor(delta / damp) : delta >> 1;
      delta += floor(delta / numPoints);
      for (; delta > (baseMinusTMin * tMax) >> 1; k += base) {
        delta = floor(delta / baseMinusTMin);
      }
      return floor(k + ((baseMinusTMin + 1) * delta) / (delta + skew));
    };
    var decode = function decode(input) {
      var output = [];
      var inputLength = input.length;
      var i = 0;
      var n = initialN;
      var bias = initialBias;
      var basic = input.lastIndexOf(delimiter);
      if (basic < 0) {
        basic = 0;
      }
      for (var j = 0; j < basic; ++j) {
        if (input.charCodeAt(j) >= 128) {
          error$1("not-basic");
        }
        output.push(input.charCodeAt(j));
      }
      for (var index = basic > 0 ? basic + 1 : 0; index < inputLength; ) {
        var oldi = i;
        for (var w = 1, k = base; ; k += base) {
          if (index >= inputLength) {
            error$1("invalid-input");
          }
          var digit = basicToDigit(input.charCodeAt(index++));
          if (digit >= base || digit > floor((maxInt - i) / w)) {
            error$1("overflow");
          }
          i += digit * w;
          var t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
          if (digit < t) {
            break;
          }
          var baseMinusT = base - t;
          if (w > floor(maxInt / baseMinusT)) {
            error$1("overflow");
          }
          w *= baseMinusT;
        }
        var out = output.length + 1;
        bias = adapt(i - oldi, out, oldi == 0);
        if (floor(i / out) > maxInt - n) {
          error$1("overflow");
        }
        n += floor(i / out);
        i %= out;
        output.splice(i++, 0, n);
      }
      return String.fromCodePoint.apply(String, output);
    };
    var encode = function encode(input) {
      var output = [];
      input = ucs2decode(input);
      var inputLength = input.length;
      var n = initialN;
      var delta = 0;
      var bias = initialBias;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;
      try {
        for (
          var _iterator = input[Symbol.iterator](), _step;
          !(_iteratorNormalCompletion = (_step = _iterator.next()).done);
          _iteratorNormalCompletion = true
        ) {
          var _currentValue2 = _step.value;
          if (_currentValue2 < 128) {
            output.push(stringFromCharCode(_currentValue2));
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
      var basicLength = output.length;
      var handledCPCount = basicLength;
      if (basicLength) {
        output.push(delimiter);
      }
      while (handledCPCount < inputLength) {
        var m = maxInt;
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;
        try {
          for (
            var _iterator2 = input[Symbol.iterator](), _step2;
            !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done);
            _iteratorNormalCompletion2 = true
          ) {
            var currentValue = _step2.value;
            if (currentValue >= n && currentValue < m) {
              m = currentValue;
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
        var handledCPCountPlusOne = handledCPCount + 1;
        if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
          error$1("overflow");
        }
        delta += (m - n) * handledCPCountPlusOne;
        n = m;
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;
        try {
          for (
            var _iterator3 = input[Symbol.iterator](), _step3;
            !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done);
            _iteratorNormalCompletion3 = true
          ) {
            var _currentValue = _step3.value;
            if (_currentValue < n && ++delta > maxInt) {
              error$1("overflow");
            }
            if (_currentValue == n) {
              var q = delta;
              for (var k = base; ; k += base) {
                var t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
                if (q < t) {
                  break;
                }
                var qMinusT = q - t;
                var baseMinusT = base - t;
                output.push(
                  stringFromCharCode(
                    digitToBasic(t + (qMinusT % baseMinusT), 0)
                  )
                );
                q = floor(qMinusT / baseMinusT);
              }
              output.push(stringFromCharCode(digitToBasic(q, 0)));
              bias = adapt(
                delta,
                handledCPCountPlusOne,
                handledCPCount == basicLength
              );
              delta = 0;
              ++handledCPCount;
            }
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }
        ++delta;
        ++n;
      }
      return output.join("");
    };
    var toUnicode = function toUnicode(input) {
      return mapDomain(input, function (string) {
        return regexPunycode.test(string)
          ? decode(string.slice(4).toLowerCase())
          : string;
      });
    };
    var toASCII = function toASCII(input) {
      return mapDomain(input, function (string) {
        return regexNonASCII.test(string) ? "xn--" + encode(string) : string;
      });
    };
    var punycode = {
      version: "2.1.0",
      ucs2: {
        decode: ucs2decode,
        encode: ucs2encode
      },
      decode,
      encode,
      toASCII,
      toUnicode
    };
    var SCHEMES = {};
    function pctEncChar(chr) {
      var c = chr.charCodeAt(0);
      var e = undefined;
      if (c < 16) e = "%0" + c.toString(16).toUpperCase();
      else if (c < 128) e = "%" + c.toString(16).toUpperCase();
      else if (c < 2048)
        e =
          "%" +
          ((c >> 6) | 192).toString(16).toUpperCase() +
          "%" +
          ((c & 63) | 128).toString(16).toUpperCase();
      else
        e =
          "%" +
          ((c >> 12) | 224).toString(16).toUpperCase() +
          "%" +
          (((c >> 6) & 63) | 128).toString(16).toUpperCase() +
          "%" +
          ((c & 63) | 128).toString(16).toUpperCase();
      return e;
    }
    function pctDecChars(str) {
      var newStr = "";
      var i = 0;
      var il = str.length;
      while (i < il) {
        var c = parseInt(str.substr(i + 1, 2), 16);
        if (c < 128) {
          newStr += String.fromCharCode(c);
          i += 3;
        } else if (c >= 194 && c < 224) {
          if (il - i >= 6) {
            var c2 = parseInt(str.substr(i + 4, 2), 16);
            newStr += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
          } else {
            newStr += str.substr(i, 6);
          }
          i += 6;
        } else if (c >= 224) {
          if (il - i >= 9) {
            var _c = parseInt(str.substr(i + 4, 2), 16);
            var c3 = parseInt(str.substr(i + 7, 2), 16);
            newStr += String.fromCharCode(
              ((c & 15) << 12) | ((_c & 63) << 6) | (c3 & 63)
            );
          } else {
            newStr += str.substr(i, 9);
          }
          i += 9;
        } else {
          newStr += str.substr(i, 3);
          i += 3;
        }
      }
      return newStr;
    }
    function _normalizeComponentEncoding(components, protocol) {
      function decodeUnreserved2(str) {
        var decStr = pctDecChars(str);
        return !decStr.match(protocol.UNRESERVED) ? str : decStr;
      }
      if (components.scheme)
        components.scheme = String(components.scheme)
          .replace(protocol.PCT_ENCODED, decodeUnreserved2)
          .toLowerCase()
          .replace(protocol.NOT_SCHEME, "");
      if (components.userinfo !== undefined)
        components.userinfo = String(components.userinfo)
          .replace(protocol.PCT_ENCODED, decodeUnreserved2)
          .replace(protocol.NOT_USERINFO, pctEncChar)
          .replace(protocol.PCT_ENCODED, toUpperCase);
      if (components.host !== undefined)
        components.host = String(components.host)
          .replace(protocol.PCT_ENCODED, decodeUnreserved2)
          .toLowerCase()
          .replace(protocol.NOT_HOST, pctEncChar)
          .replace(protocol.PCT_ENCODED, toUpperCase);
      if (components.path !== undefined)
        components.path = String(components.path)
          .replace(protocol.PCT_ENCODED, decodeUnreserved2)
          .replace(
            components.scheme ? protocol.NOT_PATH : protocol.NOT_PATH_NOSCHEME,
            pctEncChar
          )
          .replace(protocol.PCT_ENCODED, toUpperCase);
      if (components.query !== undefined)
        components.query = String(components.query)
          .replace(protocol.PCT_ENCODED, decodeUnreserved2)
          .replace(protocol.NOT_QUERY, pctEncChar)
          .replace(protocol.PCT_ENCODED, toUpperCase);
      if (components.fragment !== undefined)
        components.fragment = String(components.fragment)
          .replace(protocol.PCT_ENCODED, decodeUnreserved2)
          .replace(protocol.NOT_FRAGMENT, pctEncChar)
          .replace(protocol.PCT_ENCODED, toUpperCase);
      return components;
    }
    function _stripLeadingZeros(str) {
      return str.replace(/^0*(.*)/, "$1") || "0";
    }
    function _normalizeIPv4(host, protocol) {
      var matches = host.match(protocol.IPV4ADDRESS) || [];
      var _matches = slicedToArray(matches, 2),
        address = _matches[1];
      if (address) {
        return address.split(".").map(_stripLeadingZeros).join(".");
      } else {
        return host;
      }
    }
    function _normalizeIPv6(host, protocol) {
      var matches = host.match(protocol.IPV6ADDRESS) || [];
      var _matches2 = slicedToArray(matches, 3),
        address = _matches2[1],
        zone = _matches2[2];
      if (address) {
        var _address$toLowerCase$ = address.toLowerCase().split("::").reverse(),
          _address$toLowerCase$2 = slicedToArray(_address$toLowerCase$, 2),
          last = _address$toLowerCase$2[0],
          first = _address$toLowerCase$2[1];
        var firstFields = first ? first.split(":").map(_stripLeadingZeros) : [];
        var lastFields = last.split(":").map(_stripLeadingZeros);
        var isLastFieldIPv4Address = protocol.IPV4ADDRESS.test(
          lastFields[lastFields.length - 1]
        );
        var fieldCount = isLastFieldIPv4Address ? 7 : 8;
        var lastFieldsStart = lastFields.length - fieldCount;
        var fields = Array(fieldCount);
        for (var x = 0; x < fieldCount; ++x) {
          fields[x] = firstFields[x] || lastFields[lastFieldsStart + x] || "";
        }
        if (isLastFieldIPv4Address) {
          fields[fieldCount - 1] = _normalizeIPv4(
            fields[fieldCount - 1],
            protocol
          );
        }
        var allZeroFields = fields.reduce(function (acc, field, index) {
          if (!field || field === "0") {
            var lastLongest = acc[acc.length - 1];
            if (
              lastLongest &&
              lastLongest.index + lastLongest.length === index
            ) {
              lastLongest.length++;
            } else {
              acc.push({ index, length: 1 });
            }
          }
          return acc;
        }, []);
        var longestZeroFields = allZeroFields.sort(function (a, b) {
          return b.length - a.length;
        })[0];
        var newHost = undefined;
        if (longestZeroFields && longestZeroFields.length > 1) {
          var newFirst = fields.slice(0, longestZeroFields.index);
          var newLast = fields.slice(
            longestZeroFields.index + longestZeroFields.length
          );
          newHost = newFirst.join(":") + "::" + newLast.join(":");
        } else {
          newHost = fields.join(":");
        }
        if (zone) {
          newHost += "%" + zone;
        }
        return newHost;
      } else {
        return host;
      }
    }
    var URI_PARSE =
      /^(?:([^:\/?#]+):)?(?:\/\/((?:([^\/?#@]*)@)?(\[[^\/?#\]]+\]|[^\/?#:]*)(?:\:(\d*))?))?([^?#]*)(?:\?([^#]*))?(?:#((?:.|\n|\r)*))?/i;
    var NO_MATCH_IS_UNDEFINED = "".match(/(){0}/)[1] === undefined;
    function parse(uriString) {
      var options =
        arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var components = {};
      var protocol = options.iri !== false ? IRI_PROTOCOL : URI_PROTOCOL;
      if (options.reference === "suffix")
        uriString =
          (options.scheme ? options.scheme + ":" : "") + "//" + uriString;
      var matches = uriString.match(URI_PARSE);
      if (matches) {
        if (NO_MATCH_IS_UNDEFINED) {
          components.scheme = matches[1];
          components.userinfo = matches[3];
          components.host = matches[4];
          components.port = parseInt(matches[5], 10);
          components.path = matches[6] || "";
          components.query = matches[7];
          components.fragment = matches[8];
          if (isNaN(components.port)) {
            components.port = matches[5];
          }
        } else {
          components.scheme = matches[1] || undefined;
          components.userinfo =
            uriString.indexOf("@") !== -1 ? matches[3] : undefined;
          components.host =
            uriString.indexOf("//") !== -1 ? matches[4] : undefined;
          components.port = parseInt(matches[5], 10);
          components.path = matches[6] || "";
          components.query =
            uriString.indexOf("?") !== -1 ? matches[7] : undefined;
          components.fragment =
            uriString.indexOf("#") !== -1 ? matches[8] : undefined;
          if (isNaN(components.port)) {
            components.port = uriString.match(/\/\/(?:.|\n)*\:(?:\/|\?|\#|$)/)
              ? matches[4]
              : undefined;
          }
        }
        if (components.host) {
          components.host = _normalizeIPv6(
            _normalizeIPv4(components.host, protocol),
            protocol
          );
        }
        if (
          components.scheme === undefined &&
          components.userinfo === undefined &&
          components.host === undefined &&
          components.port === undefined &&
          !components.path &&
          components.query === undefined
        ) {
          components.reference = "same-document";
        } else if (components.scheme === undefined) {
          components.reference = "relative";
        } else if (components.fragment === undefined) {
          components.reference = "absolute";
        } else {
          components.reference = "uri";
        }
        if (
          options.reference &&
          options.reference !== "suffix" &&
          options.reference !== components.reference
        ) {
          components.error =
            components.error ||
            "URI is not a " + options.reference + " reference.";
        }
        var schemeHandler =
          SCHEMES[(options.scheme || components.scheme || "").toLowerCase()];
        if (
          !options.unicodeSupport &&
          (!schemeHandler || !schemeHandler.unicodeSupport)
        ) {
          if (
            components.host &&
            (options.domainHost || (schemeHandler && schemeHandler.domainHost))
          ) {
            try {
              components.host = punycode.toASCII(
                components.host
                  .replace(protocol.PCT_ENCODED, pctDecChars)
                  .toLowerCase()
              );
            } catch (e) {
              components.error =
                components.error ||
                "Host's domain name can not be converted to ASCII via punycode: " +
                  e;
            }
          }
          _normalizeComponentEncoding(components, URI_PROTOCOL);
        } else {
          _normalizeComponentEncoding(components, protocol);
        }
        if (schemeHandler && schemeHandler.parse) {
          schemeHandler.parse(components, options);
        }
      } else {
        components.error = components.error || "URI can not be parsed.";
      }
      return components;
    }
    function _recomposeAuthority(components, options) {
      var protocol = options.iri !== false ? IRI_PROTOCOL : URI_PROTOCOL;
      var uriTokens = [];
      if (components.userinfo !== undefined) {
        uriTokens.push(components.userinfo);
        uriTokens.push("@");
      }
      if (components.host !== undefined) {
        uriTokens.push(
          _normalizeIPv6(
            _normalizeIPv4(String(components.host), protocol),
            protocol
          ).replace(protocol.IPV6ADDRESS, function (_, $1, $2) {
            return "[" + $1 + ($2 ? "%25" + $2 : "") + "]";
          })
        );
      }
      if (
        typeof components.port === "number" ||
        typeof components.port === "string"
      ) {
        uriTokens.push(":");
        uriTokens.push(String(components.port));
      }
      return uriTokens.length ? uriTokens.join("") : undefined;
    }
    var RDS1 = /^\.\.?\//;
    var RDS2 = /^\/\.(\/|$)/;
    var RDS3 = /^\/\.\.(\/|$)/;
    var RDS5 = /^\/?(?:.|\n)*?(?=\/|$)/;
    function removeDotSegments(input) {
      var output = [];
      while (input.length) {
        if (input.match(RDS1)) {
          input = input.replace(RDS1, "");
        } else if (input.match(RDS2)) {
          input = input.replace(RDS2, "/");
        } else if (input.match(RDS3)) {
          input = input.replace(RDS3, "/");
          output.pop();
        } else if (input === "." || input === "..") {
          input = "";
        } else {
          var im = input.match(RDS5);
          if (im) {
            var s = im[0];
            input = input.slice(s.length);
            output.push(s);
          } else {
            throw new Error("Unexpected dot segment condition");
          }
        }
      }
      return output.join("");
    }
    function serialize(components) {
      var options =
        arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var protocol = options.iri ? IRI_PROTOCOL : URI_PROTOCOL;
      var uriTokens = [];
      var schemeHandler =
        SCHEMES[(options.scheme || components.scheme || "").toLowerCase()];
      if (schemeHandler && schemeHandler.serialize)
        schemeHandler.serialize(components, options);
      if (components.host) {
        if (protocol.IPV6ADDRESS.test(components.host)) {
        } else if (
          options.domainHost ||
          (schemeHandler && schemeHandler.domainHost)
        ) {
          try {
            components.host = !options.iri
              ? punycode.toASCII(
                  components.host
                    .replace(protocol.PCT_ENCODED, pctDecChars)
                    .toLowerCase()
                )
              : punycode.toUnicode(components.host);
          } catch (e) {
            components.error =
              components.error ||
              "Host's domain name can not be converted to " +
                (!options.iri ? "ASCII" : "Unicode") +
                " via punycode: " +
                e;
          }
        }
      }
      _normalizeComponentEncoding(components, protocol);
      if (options.reference !== "suffix" && components.scheme) {
        uriTokens.push(components.scheme);
        uriTokens.push(":");
      }
      var authority = _recomposeAuthority(components, options);
      if (authority !== undefined) {
        if (options.reference !== "suffix") {
          uriTokens.push("//");
        }
        uriTokens.push(authority);
        if (components.path && components.path.charAt(0) !== "/") {
          uriTokens.push("/");
        }
      }
      if (components.path !== undefined) {
        var s = components.path;
        if (
          !options.absolutePath &&
          (!schemeHandler || !schemeHandler.absolutePath)
        ) {
          s = removeDotSegments(s);
        }
        if (authority === undefined) {
          s = s.replace(/^\/\//, "/%2F");
        }
        uriTokens.push(s);
      }
      if (components.query !== undefined) {
        uriTokens.push("?");
        uriTokens.push(components.query);
      }
      if (components.fragment !== undefined) {
        uriTokens.push("#");
        uriTokens.push(components.fragment);
      }
      return uriTokens.join("");
    }
    function resolveComponents(base2, relative) {
      var options =
        arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var skipNormalization = arguments[3];
      var target = {};
      if (!skipNormalization) {
        base2 = parse(serialize(base2, options), options);
        relative = parse(serialize(relative, options), options);
      }
      options = options || {};
      if (!options.tolerant && relative.scheme) {
        target.scheme = relative.scheme;
        target.userinfo = relative.userinfo;
        target.host = relative.host;
        target.port = relative.port;
        target.path = removeDotSegments(relative.path || "");
        target.query = relative.query;
      } else {
        if (
          relative.userinfo !== undefined ||
          relative.host !== undefined ||
          relative.port !== undefined
        ) {
          target.userinfo = relative.userinfo;
          target.host = relative.host;
          target.port = relative.port;
          target.path = removeDotSegments(relative.path || "");
          target.query = relative.query;
        } else {
          if (!relative.path) {
            target.path = base2.path;
            if (relative.query !== undefined) {
              target.query = relative.query;
            } else {
              target.query = base2.query;
            }
          } else {
            if (relative.path.charAt(0) === "/") {
              target.path = removeDotSegments(relative.path);
            } else {
              if (
                (base2.userinfo !== undefined ||
                  base2.host !== undefined ||
                  base2.port !== undefined) &&
                !base2.path
              ) {
                target.path = "/" + relative.path;
              } else if (!base2.path) {
                target.path = relative.path;
              } else {
                target.path =
                  base2.path.slice(0, base2.path.lastIndexOf("/") + 1) +
                  relative.path;
              }
              target.path = removeDotSegments(target.path);
            }
            target.query = relative.query;
          }
          target.userinfo = base2.userinfo;
          target.host = base2.host;
          target.port = base2.port;
        }
        target.scheme = base2.scheme;
      }
      target.fragment = relative.fragment;
      return target;
    }
    function resolve(baseURI, relativeURI, options) {
      var schemelessOptions = assign({ scheme: "null" }, options);
      return serialize(
        resolveComponents(
          parse(baseURI, schemelessOptions),
          parse(relativeURI, schemelessOptions),
          schemelessOptions,
          true
        ),
        schemelessOptions
      );
    }
    function normalize(uri, options) {
      if (typeof uri === "string") {
        uri = serialize(parse(uri, options), options);
      } else if (typeOf(uri) === "object") {
        uri = parse(serialize(uri, options), options);
      }
      return uri;
    }
    function equal(uriA, uriB, options) {
      if (typeof uriA === "string") {
        uriA = serialize(parse(uriA, options), options);
      } else if (typeOf(uriA) === "object") {
        uriA = serialize(uriA, options);
      }
      if (typeof uriB === "string") {
        uriB = serialize(parse(uriB, options), options);
      } else if (typeOf(uriB) === "object") {
        uriB = serialize(uriB, options);
      }
      return uriA === uriB;
    }
    function escapeComponent(str, options) {
      return (
        str &&
        str
          .toString()
          .replace(
            !options || !options.iri
              ? URI_PROTOCOL.ESCAPE
              : IRI_PROTOCOL.ESCAPE,
            pctEncChar
          )
      );
    }
    function unescapeComponent(str, options) {
      return (
        str &&
        str
          .toString()
          .replace(
            !options || !options.iri
              ? URI_PROTOCOL.PCT_ENCODED
              : IRI_PROTOCOL.PCT_ENCODED,
            pctDecChars
          )
      );
    }
    var handler = {
      scheme: "http",
      domainHost: true,
      parse: function parse(components, options) {
        if (!components.host) {
          components.error = components.error || "HTTP URIs must have a host.";
        }
        return components;
      },
      serialize: function serialize(components, options) {
        var secure = String(components.scheme).toLowerCase() === "https";
        if (components.port === (secure ? 443 : 80) || components.port === "") {
          components.port = undefined;
        }
        if (!components.path) {
          components.path = "/";
        }
        return components;
      }
    };
    var handler$1 = {
      scheme: "https",
      domainHost: handler.domainHost,
      parse: handler.parse,
      serialize: handler.serialize
    };
    function isSecure(wsComponents) {
      return typeof wsComponents.secure === "boolean"
        ? wsComponents.secure
        : String(wsComponents.scheme).toLowerCase() === "wss";
    }
    var handler$2 = {
      scheme: "ws",
      domainHost: true,
      parse: function parse(components, options) {
        var wsComponents = components;
        wsComponents.secure = isSecure(wsComponents);
        wsComponents.resourceName =
          (wsComponents.path || "/") +
          (wsComponents.query ? "?" + wsComponents.query : "");
        wsComponents.path = undefined;
        wsComponents.query = undefined;
        return wsComponents;
      },
      serialize: function serialize(wsComponents, options) {
        if (
          wsComponents.port === (isSecure(wsComponents) ? 443 : 80) ||
          wsComponents.port === ""
        ) {
          wsComponents.port = undefined;
        }
        if (typeof wsComponents.secure === "boolean") {
          wsComponents.scheme = wsComponents.secure ? "wss" : "ws";
          wsComponents.secure = undefined;
        }
        if (wsComponents.resourceName) {
          var _wsComponents$resourc = wsComponents.resourceName.split("?"),
            _wsComponents$resourc2 = slicedToArray(_wsComponents$resourc, 2),
            path = _wsComponents$resourc2[0],
            query = _wsComponents$resourc2[1];
          wsComponents.path = path && path !== "/" ? path : undefined;
          wsComponents.query = query;
          wsComponents.resourceName = undefined;
        }
        wsComponents.fragment = undefined;
        return wsComponents;
      }
    };
    var handler$3 = {
      scheme: "wss",
      domainHost: handler$2.domainHost,
      parse: handler$2.parse,
      serialize: handler$2.serialize
    };
    var O = {};
    var isIRI = true;
    var UNRESERVED$$ =
      "[A-Za-z0-9\\-\\.\\_\\~" +
      (isIRI
        ? "\\xA0-\\u200D\\u2010-\\u2029\\u202F-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF"
        : "") +
      "]";
    var HEXDIG$$ = "[0-9A-Fa-f]";
    var PCT_ENCODED$ = subexp(
      subexp(
        "%[EFef]" +
          HEXDIG$$ +
          "%" +
          HEXDIG$$ +
          HEXDIG$$ +
          "%" +
          HEXDIG$$ +
          HEXDIG$$
      ) +
        "|" +
        subexp("%[89A-Fa-f]" + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$) +
        "|" +
        subexp("%" + HEXDIG$$ + HEXDIG$$)
    );
    var ATEXT$$ = "[A-Za-z0-9\\!\\$\\%\\'\\*\\+\\-\\^\\_\\`\\{\\|\\}\\~]";
    var QTEXT$$ = "[\\!\\$\\%\\'\\(\\)\\*\\+\\,\\-\\.0-9\\<\\>A-Z\\x5E-\\x7E]";
    var VCHAR$$ = merge(QTEXT$$, '[\\"\\\\]');
    var SOME_DELIMS$$ = "[\\!\\$\\'\\(\\)\\*\\+\\,\\;\\:\\@]";
    var UNRESERVED = new RegExp(UNRESERVED$$, "g");
    var PCT_ENCODED = new RegExp(PCT_ENCODED$, "g");
    var NOT_LOCAL_PART = new RegExp(
      merge("[^]", ATEXT$$, "[\\.]", '[\\"]', VCHAR$$),
      "g"
    );
    var NOT_HFNAME = new RegExp(merge("[^]", UNRESERVED$$, SOME_DELIMS$$), "g");
    var NOT_HFVALUE = NOT_HFNAME;
    function decodeUnreserved(str) {
      var decStr = pctDecChars(str);
      return !decStr.match(UNRESERVED) ? str : decStr;
    }
    var handler$4 = {
      scheme: "mailto",
      parse: function parse$$1(components, options) {
        var mailtoComponents = components;
        var to = (mailtoComponents.to = mailtoComponents.path
          ? mailtoComponents.path.split(",")
          : []);
        mailtoComponents.path = undefined;
        if (mailtoComponents.query) {
          var unknownHeaders = false;
          var headers = {};
          var hfields = mailtoComponents.query.split("&");
          for (var x = 0, xl = hfields.length; x < xl; ++x) {
            var hfield = hfields[x].split("=");
            switch (hfield[0]) {
              case "to":
                var toAddrs = hfield[1].split(",");
                for (var _x = 0, _xl = toAddrs.length; _x < _xl; ++_x) {
                  to.push(toAddrs[_x]);
                }
                break;
              case "subject":
                mailtoComponents.subject = unescapeComponent(
                  hfield[1],
                  options
                );
                break;
              case "body":
                mailtoComponents.body = unescapeComponent(hfield[1], options);
                break;
              default:
                unknownHeaders = true;
                headers[unescapeComponent(hfield[0], options)] =
                  unescapeComponent(hfield[1], options);
                break;
            }
          }
          if (unknownHeaders) mailtoComponents.headers = headers;
        }
        mailtoComponents.query = undefined;
        for (var _x2 = 0, _xl2 = to.length; _x2 < _xl2; ++_x2) {
          var addr = to[_x2].split("@");
          addr[0] = unescapeComponent(addr[0]);
          if (!options.unicodeSupport) {
            try {
              addr[1] = punycode.toASCII(
                unescapeComponent(addr[1], options).toLowerCase()
              );
            } catch (e) {
              mailtoComponents.error =
                mailtoComponents.error ||
                "Email address's domain name can not be converted to ASCII via punycode: " +
                  e;
            }
          } else {
            addr[1] = unescapeComponent(addr[1], options).toLowerCase();
          }
          to[_x2] = addr.join("@");
        }
        return mailtoComponents;
      },
      serialize: function serialize$$1(mailtoComponents, options) {
        var components = mailtoComponents;
        var to = toArray(mailtoComponents.to);
        if (to) {
          for (var x = 0, xl = to.length; x < xl; ++x) {
            var toAddr = String(to[x]);
            var atIdx = toAddr.lastIndexOf("@");
            var localPart = toAddr
              .slice(0, atIdx)
              .replace(PCT_ENCODED, decodeUnreserved)
              .replace(PCT_ENCODED, toUpperCase)
              .replace(NOT_LOCAL_PART, pctEncChar);
            var domain = toAddr.slice(atIdx + 1);
            try {
              domain = !options.iri
                ? punycode.toASCII(
                    unescapeComponent(domain, options).toLowerCase()
                  )
                : punycode.toUnicode(domain);
            } catch (e) {
              components.error =
                components.error ||
                "Email address's domain name can not be converted to " +
                  (!options.iri ? "ASCII" : "Unicode") +
                  " via punycode: " +
                  e;
            }
            to[x] = localPart + "@" + domain;
          }
          components.path = to.join(",");
        }
        var headers = (mailtoComponents.headers =
          mailtoComponents.headers || {});
        if (mailtoComponents.subject)
          headers["subject"] = mailtoComponents.subject;
        if (mailtoComponents.body) headers["body"] = mailtoComponents.body;
        var fields = [];
        for (var name in headers) {
          if (headers[name] !== O[name]) {
            fields.push(
              name
                .replace(PCT_ENCODED, decodeUnreserved)
                .replace(PCT_ENCODED, toUpperCase)
                .replace(NOT_HFNAME, pctEncChar) +
                "=" +
                headers[name]
                  .replace(PCT_ENCODED, decodeUnreserved)
                  .replace(PCT_ENCODED, toUpperCase)
                  .replace(NOT_HFVALUE, pctEncChar)
            );
          }
        }
        if (fields.length) {
          components.query = fields.join("&");
        }
        return components;
      }
    };
    var URN_PARSE = /^([^\:]+)\:(.*)/;
    var handler$5 = {
      scheme: "urn",
      parse: function parse$$1(components, options) {
        var matches = components.path && components.path.match(URN_PARSE);
        var urnComponents = components;
        if (matches) {
          var scheme = options.scheme || urnComponents.scheme || "urn";
          var nid = matches[1].toLowerCase();
          var nss = matches[2];
          var urnScheme = scheme + ":" + (options.nid || nid);
          var schemeHandler = SCHEMES[urnScheme];
          urnComponents.nid = nid;
          urnComponents.nss = nss;
          urnComponents.path = undefined;
          if (schemeHandler) {
            urnComponents = schemeHandler.parse(urnComponents, options);
          }
        } else {
          urnComponents.error = urnComponents.error || "URN can not be parsed.";
        }
        return urnComponents;
      },
      serialize: function serialize$$1(urnComponents, options) {
        var scheme = options.scheme || urnComponents.scheme || "urn";
        var nid = urnComponents.nid;
        var urnScheme = scheme + ":" + (options.nid || nid);
        var schemeHandler = SCHEMES[urnScheme];
        if (schemeHandler) {
          urnComponents = schemeHandler.serialize(urnComponents, options);
        }
        var uriComponents = urnComponents;
        var nss = urnComponents.nss;
        uriComponents.path = (nid || options.nid) + ":" + nss;
        return uriComponents;
      }
    };
    var UUID = /^[0-9A-Fa-f]{8}(?:\-[0-9A-Fa-f]{4}){3}\-[0-9A-Fa-f]{12}$/;
    var handler$6 = {
      scheme: "urn:uuid",
      parse: function parse(urnComponents, options) {
        var uuidComponents = urnComponents;
        uuidComponents.uuid = uuidComponents.nss;
        uuidComponents.nss = undefined;
        if (
          !options.tolerant &&
          (!uuidComponents.uuid || !uuidComponents.uuid.match(UUID))
        ) {
          uuidComponents.error = uuidComponents.error || "UUID is not valid.";
        }
        return uuidComponents;
      },
      serialize: function serialize(uuidComponents, options) {
        var urnComponents = uuidComponents;
        urnComponents.nss = (uuidComponents.uuid || "").toLowerCase();
        return urnComponents;
      }
    };
    SCHEMES[handler.scheme] = handler;
    SCHEMES[handler$1.scheme] = handler$1;
    SCHEMES[handler$2.scheme] = handler$2;
    SCHEMES[handler$3.scheme] = handler$3;
    SCHEMES[handler$4.scheme] = handler$4;
    SCHEMES[handler$5.scheme] = handler$5;
    SCHEMES[handler$6.scheme] = handler$6;
    exports2.SCHEMES = SCHEMES;
    exports2.pctEncChar = pctEncChar;
    exports2.pctDecChars = pctDecChars;
    exports2.parse = parse;
    exports2.removeDotSegments = removeDotSegments;
    exports2.serialize = serialize;
    exports2.resolveComponents = resolveComponents;
    exports2.resolve = resolve;
    exports2.normalize = normalize;
    exports2.equal = equal;
    exports2.escapeComponent = escapeComponent;
    exports2.unescapeComponent = unescapeComponent;
    Object.defineProperty(exports2, "__esModule", { value: true });
  });
});

// node_modules/fast-deep-equal/index.js
var require_fast_deep_equal = __commonJS((exports, module) => {
  module.exports = function equal(a, b) {
    if (a === b) return true;
    if (a && b && typeof a == "object" && typeof b == "object") {
      if (a.constructor !== b.constructor) return false;
      var length, i, keys;
      if (Array.isArray(a)) {
        length = a.length;
        if (length != b.length) return false;
        for (i = length; i-- !== 0; ) if (!equal(a[i], b[i])) return false;
        return true;
      }
      if (a.constructor === RegExp)
        return a.source === b.source && a.flags === b.flags;
      if (a.valueOf !== Object.prototype.valueOf)
        return a.valueOf() === b.valueOf();
      if (a.toString !== Object.prototype.toString)
        return a.toString() === b.toString();
      keys = Object.keys(a);
      length = keys.length;
      if (length !== Object.keys(b).length) return false;
      for (i = length; i-- !== 0; )
        if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
      for (i = length; i-- !== 0; ) {
        var key = keys[i];
        if (!equal(a[key], b[key])) return false;
      }
      return true;
    }
    return a !== a && b !== b;
  };
});

// node_modules/ajv/lib/compile/ucs2length.js
var require_ucs2length = __commonJS((exports, module) => {
  module.exports = function ucs2length(str) {
    var length = 0,
      len = str.length,
      pos = 0,
      value;
    while (pos < len) {
      length++;
      value = str.charCodeAt(pos++);
      if (value >= 55296 && value <= 56319 && pos < len) {
        value = str.charCodeAt(pos);
        if ((value & 64512) == 56320) pos++;
      }
    }
    return length;
  };
});

// node_modules/ajv/lib/compile/util.js
var require_util = __commonJS((exports, module) => {
  module.exports = {
    copy,
    checkDataType,
    checkDataTypes,
    coerceToTypes,
    toHash,
    getProperty,
    escapeQuotes,
    equal: require_fast_deep_equal(),
    ucs2length: require_ucs2length(),
    varOccurences,
    varReplace,
    schemaHasRules,
    schemaHasRulesExcept,
    schemaUnknownRules,
    toQuotedString,
    getPathExpr,
    getPath,
    getData,
    unescapeFragment,
    unescapeJsonPointer,
    escapeFragment,
    escapeJsonPointer
  };
  function copy(o, to) {
    to = to || {};
    for (var key in o) to[key] = o[key];
    return to;
  }
  function checkDataType(dataType, data, strictNumbers, negate) {
    var EQUAL = negate ? " !== " : " === ",
      AND = negate ? " || " : " && ",
      OK2 = negate ? "!" : "",
      NOT = negate ? "" : "!";
    switch (dataType) {
      case "null":
        return data + EQUAL + "null";
      case "array":
        return OK2 + "Array.isArray(" + data + ")";
      case "object":
        return (
          "(" +
          OK2 +
          data +
          AND +
          "typeof " +
          data +
          EQUAL +
          '"object"' +
          AND +
          NOT +
          "Array.isArray(" +
          data +
          "))"
        );
      case "integer":
        return (
          "(typeof " +
          data +
          EQUAL +
          '"number"' +
          AND +
          NOT +
          "(" +
          data +
          " % 1)" +
          AND +
          data +
          EQUAL +
          data +
          (strictNumbers ? AND + OK2 + "isFinite(" + data + ")" : "") +
          ")"
        );
      case "number":
        return (
          "(typeof " +
          data +
          EQUAL +
          '"' +
          dataType +
          '"' +
          (strictNumbers ? AND + OK2 + "isFinite(" + data + ")" : "") +
          ")"
        );
      default:
        return "typeof " + data + EQUAL + '"' + dataType + '"';
    }
  }
  function checkDataTypes(dataTypes, data, strictNumbers) {
    switch (dataTypes.length) {
      case 1:
        return checkDataType(dataTypes[0], data, strictNumbers, true);
      default:
        var code = "";
        var types2 = toHash(dataTypes);
        if (types2.array && types2.object) {
          code = types2.null ? "(" : "(!" + data + " || ";
          code += "typeof " + data + ' !== "object")';
          delete types2.null;
          delete types2.array;
          delete types2.object;
        }
        if (types2.number) delete types2.integer;
        for (var t in types2)
          code +=
            (code ? " && " : "") + checkDataType(t, data, strictNumbers, true);
        return code;
    }
  }
  var COERCE_TO_TYPES = toHash([
    "string",
    "number",
    "integer",
    "boolean",
    "null"
  ]);
  function coerceToTypes(optionCoerceTypes, dataTypes) {
    if (Array.isArray(dataTypes)) {
      var types2 = [];
      for (var i = 0; i < dataTypes.length; i++) {
        var t = dataTypes[i];
        if (COERCE_TO_TYPES[t]) types2[types2.length] = t;
        else if (optionCoerceTypes === "array" && t === "array")
          types2[types2.length] = t;
      }
      if (types2.length) return types2;
    } else if (COERCE_TO_TYPES[dataTypes]) {
      return [dataTypes];
    } else if (optionCoerceTypes === "array" && dataTypes === "array") {
      return ["array"];
    }
  }
  function toHash(arr) {
    var hash = {};
    for (var i = 0; i < arr.length; i++) hash[arr[i]] = true;
    return hash;
  }
  var IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
  var SINGLE_QUOTE = /'|\\/g;
  function getProperty(key) {
    return typeof key == "number"
      ? "[" + key + "]"
      : IDENTIFIER.test(key)
        ? "." + key
        : "['" + escapeQuotes(key) + "']";
  }
  function escapeQuotes(str) {
    return str
      .replace(SINGLE_QUOTE, "\\$&")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\f/g, "\\f")
      .replace(/\t/g, "\\t");
  }
  function varOccurences(str, dataVar) {
    dataVar += "[^0-9]";
    var matches = str.match(new RegExp(dataVar, "g"));
    return matches ? matches.length : 0;
  }
  function varReplace(str, dataVar, expr) {
    dataVar += "([^0-9])";
    expr = expr.replace(/\$/g, "$$$$");
    return str.replace(new RegExp(dataVar, "g"), expr + "$1");
  }
  function schemaHasRules(schema, rules) {
    if (typeof schema == "boolean") return !schema;
    for (var key in schema) if (rules[key]) return true;
  }
  function schemaHasRulesExcept(schema, rules, exceptKeyword) {
    if (typeof schema == "boolean") return !schema && exceptKeyword != "not";
    for (var key in schema) if (key != exceptKeyword && rules[key]) return true;
  }
  function schemaUnknownRules(schema, rules) {
    if (typeof schema == "boolean") return;
    for (var key in schema) if (!rules[key]) return key;
  }
  function toQuotedString(str) {
    return "'" + escapeQuotes(str) + "'";
  }
  function getPathExpr(currentPath, expr, jsonPointers, isNumber) {
    var path = jsonPointers
      ? "'/' + " +
        expr +
        (isNumber ? "" : ".replace(/~/g, '~0').replace(/\\//g, '~1')")
      : isNumber
        ? "'[' + " + expr + " + ']'"
        : "'[\\'' + " + expr + " + '\\']'";
    return joinPaths(currentPath, path);
  }
  function getPath(currentPath, prop, jsonPointers) {
    var path = jsonPointers
      ? toQuotedString("/" + escapeJsonPointer(prop))
      : toQuotedString(getProperty(prop));
    return joinPaths(currentPath, path);
  }
  var JSON_POINTER = /^\/(?:[^~]|~0|~1)*$/;
  var RELATIVE_JSON_POINTER = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function getData($data, lvl, paths) {
    var up, jsonPointer, data, matches;
    if ($data === "") return "rootData";
    if ($data[0] == "/") {
      if (!JSON_POINTER.test($data))
        throw new Error("Invalid JSON-pointer: " + $data);
      jsonPointer = $data;
      data = "rootData";
    } else {
      matches = $data.match(RELATIVE_JSON_POINTER);
      if (!matches) throw new Error("Invalid JSON-pointer: " + $data);
      up = +matches[1];
      jsonPointer = matches[2];
      if (jsonPointer == "#") {
        if (up >= lvl)
          throw new Error(
            "Cannot access property/index " +
              up +
              " levels up, current level is " +
              lvl
          );
        return paths[lvl - up];
      }
      if (up > lvl)
        throw new Error(
          "Cannot access data " + up + " levels up, current level is " + lvl
        );
      data = "data" + (lvl - up || "");
      if (!jsonPointer) return data;
    }
    var expr = data;
    var segments = jsonPointer.split("/");
    for (var i = 0; i < segments.length; i++) {
      var segment = segments[i];
      if (segment) {
        data += getProperty(unescapeJsonPointer(segment));
        expr += " && " + data;
      }
    }
    return expr;
  }
  function joinPaths(a, b) {
    if (a == '""') return b;
    return (a + " + " + b).replace(/([^\\])' \+ '/g, "$1");
  }
  function unescapeFragment(str) {
    return unescapeJsonPointer(decodeURIComponent(str));
  }
  function escapeFragment(str) {
    return encodeURIComponent(escapeJsonPointer(str));
  }
  function escapeJsonPointer(str) {
    return str.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  function unescapeJsonPointer(str) {
    return str.replace(/~1/g, "/").replace(/~0/g, "~");
  }
});

// node_modules/ajv/lib/compile/schema_obj.js
var require_schema_obj = __commonJS((exports, module) => {
  var util3 = require_util();
  module.exports = SchemaObject;
  function SchemaObject(obj) {
    util3.copy(obj, this);
  }
});

// node_modules/json-schema-traverse/index.js
var require_json_schema_traverse = __commonJS((exports, module) => {
  var traverse = (module.exports = function (schema, opts, cb) {
    if (typeof opts == "function") {
      cb = opts;
      opts = {};
    }
    cb = opts.cb || cb;
    var pre = typeof cb == "function" ? cb : cb.pre || function () {};
    var post = cb.post || function () {};
    _traverse(opts, pre, post, schema, "", schema);
  });
  traverse.keywords = {
    additionalItems: true,
    items: true,
    contains: true,
    additionalProperties: true,
    propertyNames: true,
    not: true
  };
  traverse.arrayKeywords = {
    items: true,
    allOf: true,
    anyOf: true,
    oneOf: true
  };
  traverse.propsKeywords = {
    definitions: true,
    properties: true,
    patternProperties: true,
    dependencies: true
  };
  traverse.skipKeywords = {
    default: true,
    enum: true,
    const: true,
    required: true,
    maximum: true,
    minimum: true,
    exclusiveMaximum: true,
    exclusiveMinimum: true,
    multipleOf: true,
    maxLength: true,
    minLength: true,
    pattern: true,
    format: true,
    maxItems: true,
    minItems: true,
    uniqueItems: true,
    maxProperties: true,
    minProperties: true
  };
  function _traverse(
    opts,
    pre,
    post,
    schema,
    jsonPtr,
    rootSchema,
    parentJsonPtr,
    parentKeyword,
    parentSchema,
    keyIndex
  ) {
    if (schema && typeof schema == "object" && !Array.isArray(schema)) {
      pre(
        schema,
        jsonPtr,
        rootSchema,
        parentJsonPtr,
        parentKeyword,
        parentSchema,
        keyIndex
      );
      for (var key in schema) {
        var sch = schema[key];
        if (Array.isArray(sch)) {
          if (key in traverse.arrayKeywords) {
            for (var i = 0; i < sch.length; i++)
              _traverse(
                opts,
                pre,
                post,
                sch[i],
                jsonPtr + "/" + key + "/" + i,
                rootSchema,
                jsonPtr,
                key,
                schema,
                i
              );
          }
        } else if (key in traverse.propsKeywords) {
          if (sch && typeof sch == "object") {
            for (var prop in sch)
              _traverse(
                opts,
                pre,
                post,
                sch[prop],
                jsonPtr + "/" + key + "/" + escapeJsonPtr(prop),
                rootSchema,
                jsonPtr,
                key,
                schema,
                prop
              );
          }
        } else if (
          key in traverse.keywords ||
          (opts.allKeys && !(key in traverse.skipKeywords))
        ) {
          _traverse(
            opts,
            pre,
            post,
            sch,
            jsonPtr + "/" + key,
            rootSchema,
            jsonPtr,
            key,
            schema
          );
        }
      }
      post(
        schema,
        jsonPtr,
        rootSchema,
        parentJsonPtr,
        parentKeyword,
        parentSchema,
        keyIndex
      );
    }
  }
  function escapeJsonPtr(str) {
    return str.replace(/~/g, "~0").replace(/\//g, "~1");
  }
});

// node_modules/ajv/lib/compile/resolve.js
var require_resolve = __commonJS((exports, module) => {
  var URI = require_uri_all();
  var equal = require_fast_deep_equal();
  var util3 = require_util();
  var SchemaObject = require_schema_obj();
  var traverse = require_json_schema_traverse();
  module.exports = resolve;
  resolve.normalizeId = normalizeId;
  resolve.fullPath = getFullPath;
  resolve.url = resolveUrl;
  resolve.ids = resolveIds;
  resolve.inlineRef = inlineRef;
  resolve.schema = resolveSchema;
  function resolve(compile, root, ref) {
    var refVal = this._refs[ref];
    if (typeof refVal == "string") {
      if (this._refs[refVal]) refVal = this._refs[refVal];
      else return resolve.call(this, compile, root, refVal);
    }
    refVal = refVal || this._schemas[ref];
    if (refVal instanceof SchemaObject) {
      return inlineRef(refVal.schema, this._opts.inlineRefs)
        ? refVal.schema
        : refVal.validate || this._compile(refVal);
    }
    var res = resolveSchema.call(this, root, ref);
    var schema, v, baseId;
    if (res) {
      schema = res.schema;
      root = res.root;
      baseId = res.baseId;
    }
    if (schema instanceof SchemaObject) {
      v =
        schema.validate ||
        compile.call(this, schema.schema, root, undefined, baseId);
    } else if (schema !== undefined) {
      v = inlineRef(schema, this._opts.inlineRefs)
        ? schema
        : compile.call(this, schema, root, undefined, baseId);
    }
    return v;
  }
  function resolveSchema(root, ref) {
    var p = URI.parse(ref),
      refPath = _getFullPath(p),
      baseId = getFullPath(this._getId(root.schema));
    if (Object.keys(root.schema).length === 0 || refPath !== baseId) {
      var id = normalizeId(refPath);
      var refVal = this._refs[id];
      if (typeof refVal == "string") {
        return resolveRecursive.call(this, root, refVal, p);
      } else if (refVal instanceof SchemaObject) {
        if (!refVal.validate) this._compile(refVal);
        root = refVal;
      } else {
        refVal = this._schemas[id];
        if (refVal instanceof SchemaObject) {
          if (!refVal.validate) this._compile(refVal);
          if (id == normalizeId(ref)) return { schema: refVal, root, baseId };
          root = refVal;
        } else {
          return;
        }
      }
      if (!root.schema) return;
      baseId = getFullPath(this._getId(root.schema));
    }
    return getJsonPointer.call(this, p, baseId, root.schema, root);
  }
  function resolveRecursive(root, ref, parsedRef) {
    var res = resolveSchema.call(this, root, ref);
    if (res) {
      var schema = res.schema;
      var baseId = res.baseId;
      root = res.root;
      var id = this._getId(schema);
      if (id) baseId = resolveUrl(baseId, id);
      return getJsonPointer.call(this, parsedRef, baseId, schema, root);
    }
  }
  var PREVENT_SCOPE_CHANGE = util3.toHash([
    "properties",
    "patternProperties",
    "enum",
    "dependencies",
    "definitions"
  ]);
  function getJsonPointer(parsedRef, baseId, schema, root) {
    parsedRef.fragment = parsedRef.fragment || "";
    if (parsedRef.fragment.slice(0, 1) != "/") return;
    var parts = parsedRef.fragment.split("/");
    for (var i = 1; i < parts.length; i++) {
      var part = parts[i];
      if (part) {
        part = util3.unescapeFragment(part);
        schema = schema[part];
        if (schema === undefined) break;
        var id;
        if (!PREVENT_SCOPE_CHANGE[part]) {
          id = this._getId(schema);
          if (id) baseId = resolveUrl(baseId, id);
          if (schema.$ref) {
            var $ref = resolveUrl(baseId, schema.$ref);
            var res = resolveSchema.call(this, root, $ref);
            if (res) {
              schema = res.schema;
              root = res.root;
              baseId = res.baseId;
            }
          }
        }
      }
    }
    if (schema !== undefined && schema !== root.schema)
      return { schema, root, baseId };
  }
  var SIMPLE_INLINED = util3.toHash([
    "type",
    "format",
    "pattern",
    "maxLength",
    "minLength",
    "maxProperties",
    "minProperties",
    "maxItems",
    "minItems",
    "maximum",
    "minimum",
    "uniqueItems",
    "multipleOf",
    "required",
    "enum"
  ]);
  function inlineRef(schema, limit) {
    if (limit === false) return false;
    if (limit === undefined || limit === true) return checkNoRef(schema);
    else if (limit) return countKeys(schema) <= limit;
  }
  function checkNoRef(schema) {
    var item;
    if (Array.isArray(schema)) {
      for (var i = 0; i < schema.length; i++) {
        item = schema[i];
        if (typeof item == "object" && !checkNoRef(item)) return false;
      }
    } else {
      for (var key in schema) {
        if (key == "$ref") return false;
        item = schema[key];
        if (typeof item == "object" && !checkNoRef(item)) return false;
      }
    }
    return true;
  }
  function countKeys(schema) {
    var count = 0,
      item;
    if (Array.isArray(schema)) {
      for (var i = 0; i < schema.length; i++) {
        item = schema[i];
        if (typeof item == "object") count += countKeys(item);
        if (count == Infinity) return Infinity;
      }
    } else {
      for (var key in schema) {
        if (key == "$ref") return Infinity;
        if (SIMPLE_INLINED[key]) {
          count++;
        } else {
          item = schema[key];
          if (typeof item == "object") count += countKeys(item) + 1;
          if (count == Infinity) return Infinity;
        }
      }
    }
    return count;
  }
  function getFullPath(id, normalize) {
    if (normalize !== false) id = normalizeId(id);
    var p = URI.parse(id);
    return _getFullPath(p);
  }
  function _getFullPath(p) {
    return URI.serialize(p).split("#")[0] + "#";
  }
  var TRAILING_SLASH_HASH = /#\/?$/;
  function normalizeId(id) {
    return id ? id.replace(TRAILING_SLASH_HASH, "") : "";
  }
  function resolveUrl(baseId, id) {
    id = normalizeId(id);
    return URI.resolve(baseId, id);
  }
  function resolveIds(schema) {
    var schemaId = normalizeId(this._getId(schema));
    var baseIds = { "": schemaId };
    var fullPaths = { "": getFullPath(schemaId, false) };
    var localRefs = {};
    var self = this;
    traverse(
      schema,
      { allKeys: true },
      function (
        sch,
        jsonPtr,
        rootSchema,
        parentJsonPtr,
        parentKeyword,
        parentSchema,
        keyIndex
      ) {
        if (jsonPtr === "") return;
        var id = self._getId(sch);
        var baseId = baseIds[parentJsonPtr];
        var fullPath = fullPaths[parentJsonPtr] + "/" + parentKeyword;
        if (keyIndex !== undefined)
          fullPath +=
            "/" +
            (typeof keyIndex == "number"
              ? keyIndex
              : util3.escapeFragment(keyIndex));
        if (typeof id == "string") {
          id = baseId = normalizeId(baseId ? URI.resolve(baseId, id) : id);
          var refVal = self._refs[id];
          if (typeof refVal == "string") refVal = self._refs[refVal];
          if (refVal && refVal.schema) {
            if (!equal(sch, refVal.schema))
              throw new Error(
                'id "' + id + '" resolves to more than one schema'
              );
          } else if (id != normalizeId(fullPath)) {
            if (id[0] == "#") {
              if (localRefs[id] && !equal(sch, localRefs[id]))
                throw new Error(
                  'id "' + id + '" resolves to more than one schema'
                );
              localRefs[id] = sch;
            } else {
              self._refs[id] = fullPath;
            }
          }
        }
        baseIds[jsonPtr] = baseId;
        fullPaths[jsonPtr] = fullPath;
      }
    );
    return localRefs;
  }
});

// node_modules/ajv/lib/compile/error_classes.js
var require_error_classes = __commonJS((exports, module) => {
  var resolve = require_resolve();
  module.exports = {
    Validation: errorSubclass(ValidationError),
    MissingRef: errorSubclass(MissingRefError)
  };
  function ValidationError(errors2) {
    this.message = "validation failed";
    this.errors = errors2;
    this.ajv = this.validation = true;
  }
  MissingRefError.message = function (baseId, ref) {
    return "can't resolve reference " + ref + " from id " + baseId;
  };
  function MissingRefError(baseId, ref, message) {
    this.message = message || MissingRefError.message(baseId, ref);
    this.missingRef = resolve.url(baseId, ref);
    this.missingSchema = resolve.normalizeId(resolve.fullPath(this.missingRef));
  }
  function errorSubclass(Subclass) {
    Subclass.prototype = Object.create(Error.prototype);
    Subclass.prototype.constructor = Subclass;
    return Subclass;
  }
});

// node_modules/fast-json-stable-stringify/index.js
var require_fast_json_stable_stringify = __commonJS((exports, module) => {
  module.exports = function (data, opts) {
    if (!opts) opts = {};
    if (typeof opts === "function") opts = { cmp: opts };
    var cycles = typeof opts.cycles === "boolean" ? opts.cycles : false;
    var cmp =
      opts.cmp &&
      (function (f) {
        return function (node) {
          return function (a, b) {
            var aobj = { key: a, value: node[a] };
            var bobj = { key: b, value: node[b] };
            return f(aobj, bobj);
          };
        };
      })(opts.cmp);
    var seen = [];
    return (function stringify(node) {
      if (node && node.toJSON && typeof node.toJSON === "function") {
        node = node.toJSON();
      }
      if (node === undefined) return;
      if (typeof node == "number") return isFinite(node) ? "" + node : "null";
      if (typeof node !== "object") return JSON.stringify(node);
      var i, out;
      if (Array.isArray(node)) {
        out = "[";
        for (i = 0; i < node.length; i++) {
          if (i) out += ",";
          out += stringify(node[i]) || "null";
        }
        return out + "]";
      }
      if (node === null) return "null";
      if (seen.indexOf(node) !== -1) {
        if (cycles) return JSON.stringify("__cycle__");
        throw new TypeError("Converting circular structure to JSON");
      }
      var seenIndex = seen.push(node) - 1;
      var keys = Object.keys(node).sort(cmp && cmp(node));
      out = "";
      for (i = 0; i < keys.length; i++) {
        var key = keys[i];
        var value = stringify(node[key]);
        if (!value) continue;
        if (out) out += ",";
        out += JSON.stringify(key) + ":" + value;
      }
      seen.splice(seenIndex, 1);
      return "{" + out + "}";
    })(data);
  };
});

// node_modules/ajv/lib/dotjs/validate.js
var require_validate = __commonJS((exports, module) => {
  module.exports = function generate_validate(it, $keyword, $ruleType) {
    var out = "";
    var $async = it.schema.$async === true,
      $refKeywords = it.util.schemaHasRulesExcept(
        it.schema,
        it.RULES.all,
        "$ref"
      ),
      $id = it.self._getId(it.schema);
    if (it.opts.strictKeywords) {
      var $unknownKwd = it.util.schemaUnknownRules(
        it.schema,
        it.RULES.keywords
      );
      if ($unknownKwd) {
        var $keywordsMsg = "unknown keyword: " + $unknownKwd;
        if (it.opts.strictKeywords === "log") it.logger.warn($keywordsMsg);
        else throw new Error($keywordsMsg);
      }
    }
    if (it.isTop) {
      out += " var validate = ";
      if ($async) {
        it.async = true;
        out += "async ";
      }
      out +=
        "function(data, dataPath, parentData, parentDataProperty, rootData) { 'use strict'; ";
      if ($id && (it.opts.sourceCode || it.opts.processCode)) {
        out += " " + ("/*# sourceURL=" + $id + " */") + " ";
      }
    }
    if (typeof it.schema == "boolean" || !($refKeywords || it.schema.$ref)) {
      var $keyword = "false schema";
      var $lvl = it.level;
      var $dataLvl = it.dataLevel;
      var $schema = it.schema[$keyword];
      var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
      var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
      var $breakOnError = !it.opts.allErrors;
      var $errorKeyword;
      var $data = "data" + ($dataLvl || "");
      var $valid = "valid" + $lvl;
      if (it.schema === false) {
        if (it.isTop) {
          $breakOnError = true;
        } else {
          out += " var " + $valid + " = false; ";
        }
        var $$outStack = $$outStack || [];
        $$outStack.push(out);
        out = "";
        if (it.createErrors !== false) {
          out +=
            " { keyword: '" +
            ($errorKeyword || "false schema") +
            "' , dataPath: (dataPath || '') + " +
            it.errorPath +
            " , schemaPath: " +
            it.util.toQuotedString($errSchemaPath) +
            " , params: {} ";
          if (it.opts.messages !== false) {
            out += " , message: 'boolean schema is false' ";
          }
          if (it.opts.verbose) {
            out +=
              " , schema: false , parentSchema: validate.schema" +
              it.schemaPath +
              " , data: " +
              $data +
              " ";
          }
          out += " } ";
        } else {
          out += " {} ";
        }
        var __err = out;
        out = $$outStack.pop();
        if (!it.compositeRule && $breakOnError) {
          if (it.async) {
            out += " throw new ValidationError([" + __err + "]); ";
          } else {
            out += " validate.errors = [" + __err + "]; return false; ";
          }
        } else {
          out +=
            " var err = " +
            __err +
            ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
        }
      } else {
        if (it.isTop) {
          if ($async) {
            out += " return data; ";
          } else {
            out += " validate.errors = null; return true; ";
          }
        } else {
          out += " var " + $valid + " = true; ";
        }
      }
      if (it.isTop) {
        out += " }; return validate; ";
      }
      return out;
    }
    if (it.isTop) {
      var $top = it.isTop,
        $lvl = (it.level = 0),
        $dataLvl = (it.dataLevel = 0),
        $data = "data";
      it.rootId = it.resolve.fullPath(it.self._getId(it.root.schema));
      it.baseId = it.baseId || it.rootId;
      delete it.isTop;
      it.dataPathArr = [""];
      if (
        it.schema.default !== undefined &&
        it.opts.useDefaults &&
        it.opts.strictDefaults
      ) {
        var $defaultMsg = "default is ignored in the schema root";
        if (it.opts.strictDefaults === "log") it.logger.warn($defaultMsg);
        else throw new Error($defaultMsg);
      }
      out += " var vErrors = null; ";
      out += " var errors = 0;     ";
      out += " if (rootData === undefined) rootData = data; ";
    } else {
      var { level: $lvl, dataLevel: $dataLvl } = it,
        $data = "data" + ($dataLvl || "");
      if ($id) it.baseId = it.resolve.url(it.baseId, $id);
      if ($async && !it.async) throw new Error("async schema in sync schema");
      out += " var errs_" + $lvl + " = errors;";
    }
    var $valid = "valid" + $lvl,
      $breakOnError = !it.opts.allErrors,
      $closingBraces1 = "",
      $closingBraces2 = "";
    var $errorKeyword;
    var $typeSchema = it.schema.type,
      $typeIsArray = Array.isArray($typeSchema);
    if ($typeSchema && it.opts.nullable && it.schema.nullable === true) {
      if ($typeIsArray) {
        if ($typeSchema.indexOf("null") == -1)
          $typeSchema = $typeSchema.concat("null");
      } else if ($typeSchema != "null") {
        $typeSchema = [$typeSchema, "null"];
        $typeIsArray = true;
      }
    }
    if ($typeIsArray && $typeSchema.length == 1) {
      $typeSchema = $typeSchema[0];
      $typeIsArray = false;
    }
    if (it.schema.$ref && $refKeywords) {
      if (it.opts.extendRefs == "fail") {
        throw new Error(
          '$ref: validation keywords used in schema at path "' +
            it.errSchemaPath +
            '" (see option extendRefs)'
        );
      } else if (it.opts.extendRefs !== true) {
        $refKeywords = false;
        it.logger.warn(
          '$ref: keywords ignored in schema at path "' + it.errSchemaPath + '"'
        );
      }
    }
    if (it.schema.$comment && it.opts.$comment) {
      out += " " + it.RULES.all.$comment.code(it, "$comment");
    }
    if ($typeSchema) {
      if (it.opts.coerceTypes) {
        var $coerceToTypes = it.util.coerceToTypes(
          it.opts.coerceTypes,
          $typeSchema
        );
      }
      var $rulesGroup = it.RULES.types[$typeSchema];
      if (
        $coerceToTypes ||
        $typeIsArray ||
        $rulesGroup === true ||
        ($rulesGroup && !$shouldUseGroup($rulesGroup))
      ) {
        var $schemaPath = it.schemaPath + ".type",
          $errSchemaPath = it.errSchemaPath + "/type";
        var $schemaPath = it.schemaPath + ".type",
          $errSchemaPath = it.errSchemaPath + "/type",
          $method = $typeIsArray ? "checkDataTypes" : "checkDataType";
        out +=
          " if (" +
          it.util[$method]($typeSchema, $data, it.opts.strictNumbers, true) +
          ") { ";
        if ($coerceToTypes) {
          var $dataType = "dataType" + $lvl,
            $coerced = "coerced" + $lvl;
          out +=
            " var " +
            $dataType +
            " = typeof " +
            $data +
            "; var " +
            $coerced +
            " = undefined; ";
          if (it.opts.coerceTypes == "array") {
            out +=
              " if (" +
              $dataType +
              " == 'object' && Array.isArray(" +
              $data +
              ") && " +
              $data +
              ".length == 1) { " +
              $data +
              " = " +
              $data +
              "[0]; " +
              $dataType +
              " = typeof " +
              $data +
              "; if (" +
              it.util.checkDataType(
                it.schema.type,
                $data,
                it.opts.strictNumbers
              ) +
              ") " +
              $coerced +
              " = " +
              $data +
              "; } ";
          }
          out += " if (" + $coerced + " !== undefined) ; ";
          var arr1 = $coerceToTypes;
          if (arr1) {
            var $type,
              $i = -1,
              l1 = arr1.length - 1;
            while ($i < l1) {
              $type = arr1[($i += 1)];
              if ($type == "string") {
                out +=
                  " else if (" +
                  $dataType +
                  " == 'number' || " +
                  $dataType +
                  " == 'boolean') " +
                  $coerced +
                  " = '' + " +
                  $data +
                  "; else if (" +
                  $data +
                  " === null) " +
                  $coerced +
                  " = ''; ";
              } else if ($type == "number" || $type == "integer") {
                out +=
                  " else if (" +
                  $dataType +
                  " == 'boolean' || " +
                  $data +
                  " === null || (" +
                  $dataType +
                  " == 'string' && " +
                  $data +
                  " && " +
                  $data +
                  " == +" +
                  $data +
                  " ";
                if ($type == "integer") {
                  out += " && !(" + $data + " % 1)";
                }
                out += ")) " + $coerced + " = +" + $data + "; ";
              } else if ($type == "boolean") {
                out +=
                  " else if (" +
                  $data +
                  " === 'false' || " +
                  $data +
                  " === 0 || " +
                  $data +
                  " === null) " +
                  $coerced +
                  " = false; else if (" +
                  $data +
                  " === 'true' || " +
                  $data +
                  " === 1) " +
                  $coerced +
                  " = true; ";
              } else if ($type == "null") {
                out +=
                  " else if (" +
                  $data +
                  " === '' || " +
                  $data +
                  " === 0 || " +
                  $data +
                  " === false) " +
                  $coerced +
                  " = null; ";
              } else if (it.opts.coerceTypes == "array" && $type == "array") {
                out +=
                  " else if (" +
                  $dataType +
                  " == 'string' || " +
                  $dataType +
                  " == 'number' || " +
                  $dataType +
                  " == 'boolean' || " +
                  $data +
                  " == null) " +
                  $coerced +
                  " = [" +
                  $data +
                  "]; ";
              }
            }
          }
          out += " else {   ";
          var $$outStack = $$outStack || [];
          $$outStack.push(out);
          out = "";
          if (it.createErrors !== false) {
            out +=
              " { keyword: '" +
              ($errorKeyword || "type") +
              "' , dataPath: (dataPath || '') + " +
              it.errorPath +
              " , schemaPath: " +
              it.util.toQuotedString($errSchemaPath) +
              " , params: { type: '";
            if ($typeIsArray) {
              out += "" + $typeSchema.join(",");
            } else {
              out += "" + $typeSchema;
            }
            out += "' } ";
            if (it.opts.messages !== false) {
              out += " , message: 'should be ";
              if ($typeIsArray) {
                out += "" + $typeSchema.join(",");
              } else {
                out += "" + $typeSchema;
              }
              out += "' ";
            }
            if (it.opts.verbose) {
              out +=
                " , schema: validate.schema" +
                $schemaPath +
                " , parentSchema: validate.schema" +
                it.schemaPath +
                " , data: " +
                $data +
                " ";
            }
            out += " } ";
          } else {
            out += " {} ";
          }
          var __err = out;
          out = $$outStack.pop();
          if (!it.compositeRule && $breakOnError) {
            if (it.async) {
              out += " throw new ValidationError([" + __err + "]); ";
            } else {
              out += " validate.errors = [" + __err + "]; return false; ";
            }
          } else {
            out +=
              " var err = " +
              __err +
              ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
          }
          out += " } if (" + $coerced + " !== undefined) {  ";
          var $parentData = $dataLvl
              ? "data" + ($dataLvl - 1 || "")
              : "parentData",
            $parentDataProperty = $dataLvl
              ? it.dataPathArr[$dataLvl]
              : "parentDataProperty";
          out += " " + $data + " = " + $coerced + "; ";
          if (!$dataLvl) {
            out += "if (" + $parentData + " !== undefined)";
          }
          out +=
            " " +
            $parentData +
            "[" +
            $parentDataProperty +
            "] = " +
            $coerced +
            "; } ";
        } else {
          var $$outStack = $$outStack || [];
          $$outStack.push(out);
          out = "";
          if (it.createErrors !== false) {
            out +=
              " { keyword: '" +
              ($errorKeyword || "type") +
              "' , dataPath: (dataPath || '') + " +
              it.errorPath +
              " , schemaPath: " +
              it.util.toQuotedString($errSchemaPath) +
              " , params: { type: '";
            if ($typeIsArray) {
              out += "" + $typeSchema.join(",");
            } else {
              out += "" + $typeSchema;
            }
            out += "' } ";
            if (it.opts.messages !== false) {
              out += " , message: 'should be ";
              if ($typeIsArray) {
                out += "" + $typeSchema.join(",");
              } else {
                out += "" + $typeSchema;
              }
              out += "' ";
            }
            if (it.opts.verbose) {
              out +=
                " , schema: validate.schema" +
                $schemaPath +
                " , parentSchema: validate.schema" +
                it.schemaPath +
                " , data: " +
                $data +
                " ";
            }
            out += " } ";
          } else {
            out += " {} ";
          }
          var __err = out;
          out = $$outStack.pop();
          if (!it.compositeRule && $breakOnError) {
            if (it.async) {
              out += " throw new ValidationError([" + __err + "]); ";
            } else {
              out += " validate.errors = [" + __err + "]; return false; ";
            }
          } else {
            out +=
              " var err = " +
              __err +
              ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
          }
        }
        out += " } ";
      }
    }
    if (it.schema.$ref && !$refKeywords) {
      out += " " + it.RULES.all.$ref.code(it, "$ref") + " ";
      if ($breakOnError) {
        out += " } if (errors === ";
        if ($top) {
          out += "0";
        } else {
          out += "errs_" + $lvl;
        }
        out += ") { ";
        $closingBraces2 += "}";
      }
    } else {
      var arr2 = it.RULES;
      if (arr2) {
        var $rulesGroup,
          i2 = -1,
          l2 = arr2.length - 1;
        while (i2 < l2) {
          $rulesGroup = arr2[(i2 += 1)];
          if ($shouldUseGroup($rulesGroup)) {
            if ($rulesGroup.type) {
              out +=
                " if (" +
                it.util.checkDataType(
                  $rulesGroup.type,
                  $data,
                  it.opts.strictNumbers
                ) +
                ") { ";
            }
            if (it.opts.useDefaults) {
              if ($rulesGroup.type == "object" && it.schema.properties) {
                var $schema = it.schema.properties,
                  $schemaKeys = Object.keys($schema);
                var arr3 = $schemaKeys;
                if (arr3) {
                  var $propertyKey,
                    i3 = -1,
                    l3 = arr3.length - 1;
                  while (i3 < l3) {
                    $propertyKey = arr3[(i3 += 1)];
                    var $sch = $schema[$propertyKey];
                    if ($sch.default !== undefined) {
                      var $passData = $data + it.util.getProperty($propertyKey);
                      if (it.compositeRule) {
                        if (it.opts.strictDefaults) {
                          var $defaultMsg =
                            "default is ignored for: " + $passData;
                          if (it.opts.strictDefaults === "log")
                            it.logger.warn($defaultMsg);
                          else throw new Error($defaultMsg);
                        }
                      } else {
                        out += " if (" + $passData + " === undefined ";
                        if (it.opts.useDefaults == "empty") {
                          out +=
                            " || " +
                            $passData +
                            " === null || " +
                            $passData +
                            " === '' ";
                        }
                        out += " ) " + $passData + " = ";
                        if (it.opts.useDefaults == "shared") {
                          out += " " + it.useDefault($sch.default) + " ";
                        } else {
                          out += " " + JSON.stringify($sch.default) + " ";
                        }
                        out += "; ";
                      }
                    }
                  }
                }
              } else if (
                $rulesGroup.type == "array" &&
                Array.isArray(it.schema.items)
              ) {
                var arr4 = it.schema.items;
                if (arr4) {
                  var $sch,
                    $i = -1,
                    l4 = arr4.length - 1;
                  while ($i < l4) {
                    $sch = arr4[($i += 1)];
                    if ($sch.default !== undefined) {
                      var $passData = $data + "[" + $i + "]";
                      if (it.compositeRule) {
                        if (it.opts.strictDefaults) {
                          var $defaultMsg =
                            "default is ignored for: " + $passData;
                          if (it.opts.strictDefaults === "log")
                            it.logger.warn($defaultMsg);
                          else throw new Error($defaultMsg);
                        }
                      } else {
                        out += " if (" + $passData + " === undefined ";
                        if (it.opts.useDefaults == "empty") {
                          out +=
                            " || " +
                            $passData +
                            " === null || " +
                            $passData +
                            " === '' ";
                        }
                        out += " ) " + $passData + " = ";
                        if (it.opts.useDefaults == "shared") {
                          out += " " + it.useDefault($sch.default) + " ";
                        } else {
                          out += " " + JSON.stringify($sch.default) + " ";
                        }
                        out += "; ";
                      }
                    }
                  }
                }
              }
            }
            var arr5 = $rulesGroup.rules;
            if (arr5) {
              var $rule,
                i5 = -1,
                l5 = arr5.length - 1;
              while (i5 < l5) {
                $rule = arr5[(i5 += 1)];
                if ($shouldUseRule($rule)) {
                  var $code = $rule.code(it, $rule.keyword, $rulesGroup.type);
                  if ($code) {
                    out += " " + $code + " ";
                    if ($breakOnError) {
                      $closingBraces1 += "}";
                    }
                  }
                }
              }
            }
            if ($breakOnError) {
              out += " " + $closingBraces1 + " ";
              $closingBraces1 = "";
            }
            if ($rulesGroup.type) {
              out += " } ";
              if (
                $typeSchema &&
                $typeSchema === $rulesGroup.type &&
                !$coerceToTypes
              ) {
                out += " else { ";
                var $schemaPath = it.schemaPath + ".type",
                  $errSchemaPath = it.errSchemaPath + "/type";
                var $$outStack = $$outStack || [];
                $$outStack.push(out);
                out = "";
                if (it.createErrors !== false) {
                  out +=
                    " { keyword: '" +
                    ($errorKeyword || "type") +
                    "' , dataPath: (dataPath || '') + " +
                    it.errorPath +
                    " , schemaPath: " +
                    it.util.toQuotedString($errSchemaPath) +
                    " , params: { type: '";
                  if ($typeIsArray) {
                    out += "" + $typeSchema.join(",");
                  } else {
                    out += "" + $typeSchema;
                  }
                  out += "' } ";
                  if (it.opts.messages !== false) {
                    out += " , message: 'should be ";
                    if ($typeIsArray) {
                      out += "" + $typeSchema.join(",");
                    } else {
                      out += "" + $typeSchema;
                    }
                    out += "' ";
                  }
                  if (it.opts.verbose) {
                    out +=
                      " , schema: validate.schema" +
                      $schemaPath +
                      " , parentSchema: validate.schema" +
                      it.schemaPath +
                      " , data: " +
                      $data +
                      " ";
                  }
                  out += " } ";
                } else {
                  out += " {} ";
                }
                var __err = out;
                out = $$outStack.pop();
                if (!it.compositeRule && $breakOnError) {
                  if (it.async) {
                    out += " throw new ValidationError([" + __err + "]); ";
                  } else {
                    out += " validate.errors = [" + __err + "]; return false; ";
                  }
                } else {
                  out +=
                    " var err = " +
                    __err +
                    ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
                }
                out += " } ";
              }
            }
            if ($breakOnError) {
              out += " if (errors === ";
              if ($top) {
                out += "0";
              } else {
                out += "errs_" + $lvl;
              }
              out += ") { ";
              $closingBraces2 += "}";
            }
          }
        }
      }
    }
    if ($breakOnError) {
      out += " " + $closingBraces2 + " ";
    }
    if ($top) {
      if ($async) {
        out += " if (errors === 0) return data;           ";
        out += " else throw new ValidationError(vErrors); ";
      } else {
        out += " validate.errors = vErrors; ";
        out += " return errors === 0;       ";
      }
      out += " }; return validate;";
    } else {
      out += " var " + $valid + " = errors === errs_" + $lvl + ";";
    }
    function $shouldUseGroup($rulesGroup2) {
      var rules = $rulesGroup2.rules;
      for (var i = 0; i < rules.length; i++)
        if ($shouldUseRule(rules[i])) return true;
    }
    function $shouldUseRule($rule2) {
      return (
        it.schema[$rule2.keyword] !== undefined ||
        ($rule2.implements && $ruleImplementsSomeKeyword($rule2))
      );
    }
    function $ruleImplementsSomeKeyword($rule2) {
      var impl = $rule2.implements;
      for (var i = 0; i < impl.length; i++)
        if (it.schema[impl[i]] !== undefined) return true;
    }
    return out;
  };
});

// node_modules/ajv/lib/compile/index.js
var require_compile = __commonJS((exports, module) => {
  var resolve = require_resolve();
  var util3 = require_util();
  var errorClasses = require_error_classes();
  var stableStringify = require_fast_json_stable_stringify();
  var validateGenerator = require_validate();
  var ucs2length = util3.ucs2length;
  var equal = require_fast_deep_equal();
  var ValidationError = errorClasses.Validation;
  module.exports = compile;
  function compile(schema, root, localRefs, baseId) {
    var self = this,
      opts = this._opts,
      refVal = [undefined],
      refs = {},
      patterns = [],
      patternsHash = {},
      defaults = [],
      defaultsHash = {},
      customRules = [];
    root = root || { schema, refVal, refs };
    var c = checkCompiling.call(this, schema, root, baseId);
    var compilation = this._compilations[c.index];
    if (c.compiling) return (compilation.callValidate = callValidate);
    var formats = this._formats;
    var RULES = this.RULES;
    try {
      var v = localCompile(schema, root, localRefs, baseId);
      compilation.validate = v;
      var cv = compilation.callValidate;
      if (cv) {
        cv.schema = v.schema;
        cv.errors = null;
        cv.refs = v.refs;
        cv.refVal = v.refVal;
        cv.root = v.root;
        cv.$async = v.$async;
        if (opts.sourceCode) cv.source = v.source;
      }
      return v;
    } finally {
      endCompiling.call(this, schema, root, baseId);
    }
    function callValidate() {
      var validate = compilation.validate;
      var result = validate.apply(this, arguments);
      callValidate.errors = validate.errors;
      return result;
    }
    function localCompile(_schema, _root, localRefs2, baseId2) {
      var isRoot = !_root || (_root && _root.schema == _schema);
      if (_root.schema != root.schema)
        return compile.call(self, _schema, _root, localRefs2, baseId2);
      var $async = _schema.$async === true;
      var sourceCode = validateGenerator({
        isTop: true,
        schema: _schema,
        isRoot,
        baseId: baseId2,
        root: _root,
        schemaPath: "",
        errSchemaPath: "#",
        errorPath: '""',
        MissingRefError: errorClasses.MissingRef,
        RULES,
        validate: validateGenerator,
        util: util3,
        resolve,
        resolveRef,
        usePattern,
        useDefault,
        useCustomRule,
        opts,
        formats,
        logger: self.logger,
        self
      });
      sourceCode =
        vars(refVal, refValCode) +
        vars(patterns, patternCode) +
        vars(defaults, defaultCode) +
        vars(customRules, customRuleCode) +
        sourceCode;
      if (opts.processCode) sourceCode = opts.processCode(sourceCode, _schema);
      var validate;
      try {
        var makeValidate = new Function(
          "self",
          "RULES",
          "formats",
          "root",
          "refVal",
          "defaults",
          "customRules",
          "equal",
          "ucs2length",
          "ValidationError",
          sourceCode
        );
        validate = makeValidate(
          self,
          RULES,
          formats,
          root,
          refVal,
          defaults,
          customRules,
          equal,
          ucs2length,
          ValidationError
        );
        refVal[0] = validate;
      } catch (e) {
        self.logger.error("Error compiling schema, function code:", sourceCode);
        throw e;
      }
      validate.schema = _schema;
      validate.errors = null;
      validate.refs = refs;
      validate.refVal = refVal;
      validate.root = isRoot ? validate : _root;
      if ($async) validate.$async = true;
      if (opts.sourceCode === true) {
        validate.source = {
          code: sourceCode,
          patterns,
          defaults
        };
      }
      return validate;
    }
    function resolveRef(baseId2, ref, isRoot) {
      ref = resolve.url(baseId2, ref);
      var refIndex = refs[ref];
      var _refVal, refCode;
      if (refIndex !== undefined) {
        _refVal = refVal[refIndex];
        refCode = "refVal[" + refIndex + "]";
        return resolvedRef(_refVal, refCode);
      }
      if (!isRoot && root.refs) {
        var rootRefId = root.refs[ref];
        if (rootRefId !== undefined) {
          _refVal = root.refVal[rootRefId];
          refCode = addLocalRef(ref, _refVal);
          return resolvedRef(_refVal, refCode);
        }
      }
      refCode = addLocalRef(ref);
      var v2 = resolve.call(self, localCompile, root, ref);
      if (v2 === undefined) {
        var localSchema = localRefs && localRefs[ref];
        if (localSchema) {
          v2 = resolve.inlineRef(localSchema, opts.inlineRefs)
            ? localSchema
            : compile.call(self, localSchema, root, localRefs, baseId2);
        }
      }
      if (v2 === undefined) {
        removeLocalRef(ref);
      } else {
        replaceLocalRef(ref, v2);
        return resolvedRef(v2, refCode);
      }
    }
    function addLocalRef(ref, v2) {
      var refId = refVal.length;
      refVal[refId] = v2;
      refs[ref] = refId;
      return "refVal" + refId;
    }
    function removeLocalRef(ref) {
      delete refs[ref];
    }
    function replaceLocalRef(ref, v2) {
      var refId = refs[ref];
      refVal[refId] = v2;
    }
    function resolvedRef(refVal2, code) {
      return typeof refVal2 == "object" || typeof refVal2 == "boolean"
        ? { code, schema: refVal2, inline: true }
        : { code, $async: refVal2 && !!refVal2.$async };
    }
    function usePattern(regexStr) {
      var index = patternsHash[regexStr];
      if (index === undefined) {
        index = patternsHash[regexStr] = patterns.length;
        patterns[index] = regexStr;
      }
      return "pattern" + index;
    }
    function useDefault(value) {
      switch (typeof value) {
        case "boolean":
        case "number":
          return "" + value;
        case "string":
          return util3.toQuotedString(value);
        case "object":
          if (value === null) return "null";
          var valueStr = stableStringify(value);
          var index = defaultsHash[valueStr];
          if (index === undefined) {
            index = defaultsHash[valueStr] = defaults.length;
            defaults[index] = value;
          }
          return "default" + index;
      }
    }
    function useCustomRule(rule, schema2, parentSchema, it) {
      if (self._opts.validateSchema !== false) {
        var deps = rule.definition.dependencies;
        if (
          deps &&
          !deps.every(function (keyword) {
            return Object.prototype.hasOwnProperty.call(parentSchema, keyword);
          })
        )
          throw new Error(
            "parent schema must have all required keywords: " + deps.join(",")
          );
        var validateSchema = rule.definition.validateSchema;
        if (validateSchema) {
          var valid = validateSchema(schema2);
          if (!valid) {
            var message =
              "keyword schema is invalid: " +
              self.errorsText(validateSchema.errors);
            if (self._opts.validateSchema == "log") self.logger.error(message);
            else throw new Error(message);
          }
        }
      }
      var compile2 = rule.definition.compile,
        inline = rule.definition.inline,
        macro = rule.definition.macro;
      var validate;
      if (compile2) {
        validate = compile2.call(self, schema2, parentSchema, it);
      } else if (macro) {
        validate = macro.call(self, schema2, parentSchema, it);
        if (opts.validateSchema !== false) self.validateSchema(validate, true);
      } else if (inline) {
        validate = inline.call(self, it, rule.keyword, schema2, parentSchema);
      } else {
        validate = rule.definition.validate;
        if (!validate) return;
      }
      if (validate === undefined)
        throw new Error(
          'custom keyword "' + rule.keyword + '"failed to compile'
        );
      var index = customRules.length;
      customRules[index] = validate;
      return {
        code: "customRule" + index,
        validate
      };
    }
  }
  function checkCompiling(schema, root, baseId) {
    var index = compIndex.call(this, schema, root, baseId);
    if (index >= 0) return { index, compiling: true };
    index = this._compilations.length;
    this._compilations[index] = {
      schema,
      root,
      baseId
    };
    return { index, compiling: false };
  }
  function endCompiling(schema, root, baseId) {
    var i = compIndex.call(this, schema, root, baseId);
    if (i >= 0) this._compilations.splice(i, 1);
  }
  function compIndex(schema, root, baseId) {
    for (var i = 0; i < this._compilations.length; i++) {
      var c = this._compilations[i];
      if (c.schema == schema && c.root == root && c.baseId == baseId) return i;
    }
    return -1;
  }
  function patternCode(i, patterns) {
    return (
      "var pattern" +
      i +
      " = new RegExp(" +
      util3.toQuotedString(patterns[i]) +
      ");"
    );
  }
  function defaultCode(i) {
    return "var default" + i + " = defaults[" + i + "];";
  }
  function refValCode(i, refVal) {
    return refVal[i] === undefined
      ? ""
      : "var refVal" + i + " = refVal[" + i + "];";
  }
  function customRuleCode(i) {
    return "var customRule" + i + " = customRules[" + i + "];";
  }
  function vars(arr, statement) {
    if (!arr.length) return "";
    var code = "";
    for (var i = 0; i < arr.length; i++) code += statement(i, arr);
    return code;
  }
});

// node_modules/ajv/lib/cache.js
var require_cache = __commonJS((exports, module) => {
  var Cache = (module.exports = function Cache() {
    this._cache = {};
  });
  Cache.prototype.put = function Cache_put(key, value) {
    this._cache[key] = value;
  };
  Cache.prototype.get = function Cache_get(key) {
    return this._cache[key];
  };
  Cache.prototype.del = function Cache_del(key) {
    delete this._cache[key];
  };
  Cache.prototype.clear = function Cache_clear() {
    this._cache = {};
  };
});

// node_modules/ajv/lib/compile/formats.js
var require_formats = __commonJS((exports, module) => {
  var util3 = require_util();
  var DATE = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;
  var DAYS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var TIME = /^(\d\d):(\d\d):(\d\d)(\.\d+)?(z|[+-]\d\d(?::?\d\d)?)?$/i;
  var HOSTNAME =
    /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i;
  var URI =
    /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
  var URIREF =
    /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
  var URITEMPLATE =
    /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i;
  var URL2 =
    /^(?:(?:http[s\u017F]?|ftp):\/\/)(?:(?:[\0-\x08\x0E-\x1F!-\x9F\xA1-\u167F\u1681-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+(?::(?:[\0-\x08\x0E-\x1F!-\x9F\xA1-\u167F\u1681-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])*)?@)?(?:(?!10(?:\.[0-9]{1,3}){3})(?!127(?:\.[0-9]{1,3}){3})(?!169\.254(?:\.[0-9]{1,3}){2})(?!192\.168(?:\.[0-9]{1,3}){2})(?!172\.(?:1[6-9]|2[0-9]|3[01])(?:\.[0-9]{1,3}){2})(?:[1-9][0-9]?|1[0-9][0-9]|2[01][0-9]|22[0-3])(?:\.(?:1?[0-9]{1,2}|2[0-4][0-9]|25[0-5])){2}(?:\.(?:[1-9][0-9]?|1[0-9][0-9]|2[0-4][0-9]|25[0-4]))|(?:(?:(?:[0-9a-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+-)*(?:[0-9a-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+)(?:\.(?:(?:[0-9a-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+-)*(?:[0-9a-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+)*(?:\.(?:(?:[a-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]){2,})))(?::[0-9]{2,5})?(?:\/(?:[\0-\x08\x0E-\x1F!-\x9F\xA1-\u167F\u1681-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])*)?$/i;
  var UUID = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
  var JSON_POINTER = /^(?:\/(?:[^~/]|~0|~1)*)*$/;
  var JSON_POINTER_URI_FRAGMENT =
    /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i;
  var RELATIVE_JSON_POINTER =
    /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/;
  module.exports = formats;
  function formats(mode) {
    mode = mode == "full" ? "full" : "fast";
    return util3.copy(formats[mode]);
  }
  formats.fast = {
    date: /^\d\d\d\d-[0-1]\d-[0-3]\d$/,
    time: /^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i,
    "date-time":
      /^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i,
    uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
    "uri-reference":
      /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
    "uri-template": URITEMPLATE,
    url: URL2,
    email:
      /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i,
    hostname: HOSTNAME,
    ipv4: /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
    ipv6: /^\s*(?:(?:(?:[0-9a-f]{1,4}:){7}(?:[0-9a-f]{1,4}|:))|(?:(?:[0-9a-f]{1,4}:){6}(?::[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[0-9a-f]{1,4}:){5}(?:(?:(?::[0-9a-f]{1,4}){1,2})|:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[0-9a-f]{1,4}:){4}(?:(?:(?::[0-9a-f]{1,4}){1,3})|(?:(?::[0-9a-f]{1,4})?:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){3}(?:(?:(?::[0-9a-f]{1,4}){1,4})|(?:(?::[0-9a-f]{1,4}){0,2}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){2}(?:(?:(?::[0-9a-f]{1,4}){1,5})|(?:(?::[0-9a-f]{1,4}){0,3}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){1}(?:(?:(?::[0-9a-f]{1,4}){1,6})|(?:(?::[0-9a-f]{1,4}){0,4}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?::(?:(?:(?::[0-9a-f]{1,4}){1,7})|(?:(?::[0-9a-f]{1,4}){0,5}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(?:%.+)?\s*$/i,
    regex,
    uuid: UUID,
    "json-pointer": JSON_POINTER,
    "json-pointer-uri-fragment": JSON_POINTER_URI_FRAGMENT,
    "relative-json-pointer": RELATIVE_JSON_POINTER
  };
  formats.full = {
    date,
    time,
    "date-time": date_time,
    uri,
    "uri-reference": URIREF,
    "uri-template": URITEMPLATE,
    url: URL2,
    email:
      /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
    hostname: HOSTNAME,
    ipv4: /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
    ipv6: /^\s*(?:(?:(?:[0-9a-f]{1,4}:){7}(?:[0-9a-f]{1,4}|:))|(?:(?:[0-9a-f]{1,4}:){6}(?::[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[0-9a-f]{1,4}:){5}(?:(?:(?::[0-9a-f]{1,4}){1,2})|:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[0-9a-f]{1,4}:){4}(?:(?:(?::[0-9a-f]{1,4}){1,3})|(?:(?::[0-9a-f]{1,4})?:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){3}(?:(?:(?::[0-9a-f]{1,4}){1,4})|(?:(?::[0-9a-f]{1,4}){0,2}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){2}(?:(?:(?::[0-9a-f]{1,4}){1,5})|(?:(?::[0-9a-f]{1,4}){0,3}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){1}(?:(?:(?::[0-9a-f]{1,4}){1,6})|(?:(?::[0-9a-f]{1,4}){0,4}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?::(?:(?:(?::[0-9a-f]{1,4}){1,7})|(?:(?::[0-9a-f]{1,4}){0,5}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(?:%.+)?\s*$/i,
    regex,
    uuid: UUID,
    "json-pointer": JSON_POINTER,
    "json-pointer-uri-fragment": JSON_POINTER_URI_FRAGMENT,
    "relative-json-pointer": RELATIVE_JSON_POINTER
  };
  function isLeapYear(year) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  }
  function date(str) {
    var matches = str.match(DATE);
    if (!matches) return false;
    var year = +matches[1];
    var month = +matches[2];
    var day = +matches[3];
    return (
      month >= 1 &&
      month <= 12 &&
      day >= 1 &&
      day <= (month == 2 && isLeapYear(year) ? 29 : DAYS[month])
    );
  }
  function time(str, full) {
    var matches = str.match(TIME);
    if (!matches) return false;
    var hour = matches[1];
    var minute = matches[2];
    var second = matches[3];
    var timeZone = matches[5];
    return (
      ((hour <= 23 && minute <= 59 && second <= 59) ||
        (hour == 23 && minute == 59 && second == 60)) &&
      (!full || timeZone)
    );
  }
  var DATE_TIME_SEPARATOR = /t|\s/i;
  function date_time(str) {
    var dateTime = str.split(DATE_TIME_SEPARATOR);
    return dateTime.length == 2 && date(dateTime[0]) && time(dateTime[1], true);
  }
  var NOT_URI_FRAGMENT = /\/|:/;
  function uri(str) {
    return NOT_URI_FRAGMENT.test(str) && URI.test(str);
  }
  var Z_ANCHOR = /[^\\]\\Z/;
  function regex(str) {
    if (Z_ANCHOR.test(str)) return false;
    try {
      new RegExp(str);
      return true;
    } catch (e) {
      return false;
    }
  }
});

// node_modules/ajv/lib/dotjs/ref.js
var require_ref = __commonJS((exports, module) => {
  module.exports = function generate_ref(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema = it.schema[$keyword];
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $data = "data" + ($dataLvl || "");
    var $valid = "valid" + $lvl;
    var $async, $refCode;
    if ($schema == "#" || $schema == "#/") {
      if (it.isRoot) {
        $async = it.async;
        $refCode = "validate";
      } else {
        $async = it.root.schema.$async === true;
        $refCode = "root.refVal[0]";
      }
    } else {
      var $refVal = it.resolveRef(it.baseId, $schema, it.isRoot);
      if ($refVal === undefined) {
        var $message = it.MissingRefError.message(it.baseId, $schema);
        if (it.opts.missingRefs == "fail") {
          it.logger.error($message);
          var $$outStack = $$outStack || [];
          $$outStack.push(out);
          out = "";
          if (it.createErrors !== false) {
            out +=
              " { keyword: '" +
              "$ref" +
              "' , dataPath: (dataPath || '') + " +
              it.errorPath +
              " , schemaPath: " +
              it.util.toQuotedString($errSchemaPath) +
              " , params: { ref: '" +
              it.util.escapeQuotes($schema) +
              "' } ";
            if (it.opts.messages !== false) {
              out +=
                " , message: 'can\\'t resolve reference " +
                it.util.escapeQuotes($schema) +
                "' ";
            }
            if (it.opts.verbose) {
              out +=
                " , schema: " +
                it.util.toQuotedString($schema) +
                " , parentSchema: validate.schema" +
                it.schemaPath +
                " , data: " +
                $data +
                " ";
            }
            out += " } ";
          } else {
            out += " {} ";
          }
          var __err = out;
          out = $$outStack.pop();
          if (!it.compositeRule && $breakOnError) {
            if (it.async) {
              out += " throw new ValidationError([" + __err + "]); ";
            } else {
              out += " validate.errors = [" + __err + "]; return false; ";
            }
          } else {
            out +=
              " var err = " +
              __err +
              ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
          }
          if ($breakOnError) {
            out += " if (false) { ";
          }
        } else if (it.opts.missingRefs == "ignore") {
          it.logger.warn($message);
          if ($breakOnError) {
            out += " if (true) { ";
          }
        } else {
          throw new it.MissingRefError(it.baseId, $schema, $message);
        }
      } else if ($refVal.inline) {
        var $it = it.util.copy(it);
        $it.level++;
        var $nextValid = "valid" + $it.level;
        $it.schema = $refVal.schema;
        $it.schemaPath = "";
        $it.errSchemaPath = $schema;
        var $code = it.validate($it).replace(/validate\.schema/g, $refVal.code);
        out += " " + $code + " ";
        if ($breakOnError) {
          out += " if (" + $nextValid + ") { ";
        }
      } else {
        $async =
          $refVal.$async === true || (it.async && $refVal.$async !== false);
        $refCode = $refVal.code;
      }
    }
    if ($refCode) {
      var $$outStack = $$outStack || [];
      $$outStack.push(out);
      out = "";
      if (it.opts.passContext) {
        out += " " + $refCode + ".call(this, ";
      } else {
        out += " " + $refCode + "( ";
      }
      out += " " + $data + ", (dataPath || '')";
      if (it.errorPath != '""') {
        out += " + " + it.errorPath;
      }
      var $parentData = $dataLvl ? "data" + ($dataLvl - 1 || "") : "parentData",
        $parentDataProperty = $dataLvl
          ? it.dataPathArr[$dataLvl]
          : "parentDataProperty";
      out +=
        " , " + $parentData + " , " + $parentDataProperty + ", rootData)  ";
      var __callValidate = out;
      out = $$outStack.pop();
      if ($async) {
        if (!it.async)
          throw new Error("async schema referenced by sync schema");
        if ($breakOnError) {
          out += " var " + $valid + "; ";
        }
        out += " try { await " + __callValidate + "; ";
        if ($breakOnError) {
          out += " " + $valid + " = true; ";
        }
        out +=
          " } catch (e) { if (!(e instanceof ValidationError)) throw e; if (vErrors === null) vErrors = e.errors; else vErrors = vErrors.concat(e.errors); errors = vErrors.length; ";
        if ($breakOnError) {
          out += " " + $valid + " = false; ";
        }
        out += " } ";
        if ($breakOnError) {
          out += " if (" + $valid + ") { ";
        }
      } else {
        out +=
          " if (!" +
          __callValidate +
          ") { if (vErrors === null) vErrors = " +
          $refCode +
          ".errors; else vErrors = vErrors.concat(" +
          $refCode +
          ".errors); errors = vErrors.length; } ";
        if ($breakOnError) {
          out += " else { ";
        }
      }
    }
    return out;
  };
});

// node_modules/ajv/lib/dotjs/allOf.js
var require_allOf = __commonJS((exports, module) => {
  module.exports = function generate_allOf(it, $keyword, $ruleType) {
    var out = " ";
    var $schema = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $it = it.util.copy(it);
    var $closingBraces = "";
    $it.level++;
    var $nextValid = "valid" + $it.level;
    var $currentBaseId = $it.baseId,
      $allSchemasEmpty = true;
    var arr1 = $schema;
    if (arr1) {
      var $sch,
        $i = -1,
        l1 = arr1.length - 1;
      while ($i < l1) {
        $sch = arr1[($i += 1)];
        if (
          it.opts.strictKeywords
            ? (typeof $sch == "object" && Object.keys($sch).length > 0) ||
              $sch === false
            : it.util.schemaHasRules($sch, it.RULES.all)
        ) {
          $allSchemasEmpty = false;
          $it.schema = $sch;
          $it.schemaPath = $schemaPath + "[" + $i + "]";
          $it.errSchemaPath = $errSchemaPath + "/" + $i;
          out += "  " + it.validate($it) + " ";
          $it.baseId = $currentBaseId;
          if ($breakOnError) {
            out += " if (" + $nextValid + ") { ";
            $closingBraces += "}";
          }
        }
      }
    }
    if ($breakOnError) {
      if ($allSchemasEmpty) {
        out += " if (true) { ";
      } else {
        out += " " + $closingBraces.slice(0, -1) + " ";
      }
    }
    return out;
  };
});

// node_modules/ajv/lib/dotjs/anyOf.js
var require_anyOf = __commonJS((exports, module) => {
  module.exports = function generate_anyOf(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $data = "data" + ($dataLvl || "");
    var $valid = "valid" + $lvl;
    var $errs = "errs__" + $lvl;
    var $it = it.util.copy(it);
    var $closingBraces = "";
    $it.level++;
    var $nextValid = "valid" + $it.level;
    var $noEmptySchema = $schema.every(function ($sch2) {
      return it.opts.strictKeywords
        ? (typeof $sch2 == "object" && Object.keys($sch2).length > 0) ||
            $sch2 === false
        : it.util.schemaHasRules($sch2, it.RULES.all);
    });
    if ($noEmptySchema) {
      var $currentBaseId = $it.baseId;
      out += " var " + $errs + " = errors; var " + $valid + " = false;  ";
      var $wasComposite = it.compositeRule;
      it.compositeRule = $it.compositeRule = true;
      var arr1 = $schema;
      if (arr1) {
        var $sch,
          $i = -1,
          l1 = arr1.length - 1;
        while ($i < l1) {
          $sch = arr1[($i += 1)];
          $it.schema = $sch;
          $it.schemaPath = $schemaPath + "[" + $i + "]";
          $it.errSchemaPath = $errSchemaPath + "/" + $i;
          out += "  " + it.validate($it) + " ";
          $it.baseId = $currentBaseId;
          out +=
            " " +
            $valid +
            " = " +
            $valid +
            " || " +
            $nextValid +
            "; if (!" +
            $valid +
            ") { ";
          $closingBraces += "}";
        }
      }
      it.compositeRule = $it.compositeRule = $wasComposite;
      out += " " + $closingBraces + " if (!" + $valid + ") {   var err =   ";
      if (it.createErrors !== false) {
        out +=
          " { keyword: '" +
          "anyOf" +
          "' , dataPath: (dataPath || '') + " +
          it.errorPath +
          " , schemaPath: " +
          it.util.toQuotedString($errSchemaPath) +
          " , params: {} ";
        if (it.opts.messages !== false) {
          out += " , message: 'should match some schema in anyOf' ";
        }
        if (it.opts.verbose) {
          out +=
            " , schema: validate.schema" +
            $schemaPath +
            " , parentSchema: validate.schema" +
            it.schemaPath +
            " , data: " +
            $data +
            " ";
        }
        out += " } ";
      } else {
        out += " {} ";
      }
      out +=
        ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
      if (!it.compositeRule && $breakOnError) {
        if (it.async) {
          out += " throw new ValidationError(vErrors); ";
        } else {
          out += " validate.errors = vErrors; return false; ";
        }
      }
      out +=
        " } else {  errors = " +
        $errs +
        "; if (vErrors !== null) { if (" +
        $errs +
        ") vErrors.length = " +
        $errs +
        "; else vErrors = null; } ";
      if (it.opts.allErrors) {
        out += " } ";
      }
    } else {
      if ($breakOnError) {
        out += " if (true) { ";
      }
    }
    return out;
  };
});

// node_modules/ajv/lib/dotjs/comment.js
var require_comment = __commonJS((exports, module) => {
  module.exports = function generate_comment(it, $keyword, $ruleType) {
    var out = " ";
    var $schema = it.schema[$keyword];
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $comment = it.util.toQuotedString($schema);
    if (it.opts.$comment === true) {
      out += " console.log(" + $comment + ");";
    } else if (typeof it.opts.$comment == "function") {
      out +=
        " self._opts.$comment(" +
        $comment +
        ", " +
        it.util.toQuotedString($errSchemaPath) +
        ", validate.root.schema);";
    }
    return out;
  };
});

// node_modules/ajv/lib/dotjs/const.js
var require_const = __commonJS((exports, module) => {
  module.exports = function generate_const(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $data = "data" + ($dataLvl || "");
    var $valid = "valid" + $lvl;
    var $isData = it.opts.$data && $schema && $schema.$data,
      $schemaValue;
    if ($isData) {
      out +=
        " var schema" +
        $lvl +
        " = " +
        it.util.getData($schema.$data, $dataLvl, it.dataPathArr) +
        "; ";
      $schemaValue = "schema" + $lvl;
    } else {
      $schemaValue = $schema;
    }
    if (!$isData) {
      out += " var schema" + $lvl + " = validate.schema" + $schemaPath + ";";
    }
    out +=
      "var " +
      $valid +
      " = equal(" +
      $data +
      ", schema" +
      $lvl +
      "); if (!" +
      $valid +
      ") {   ";
    var $$outStack = $$outStack || [];
    $$outStack.push(out);
    out = "";
    if (it.createErrors !== false) {
      out +=
        " { keyword: '" +
        "const" +
        "' , dataPath: (dataPath || '') + " +
        it.errorPath +
        " , schemaPath: " +
        it.util.toQuotedString($errSchemaPath) +
        " , params: { allowedValue: schema" +
        $lvl +
        " } ";
      if (it.opts.messages !== false) {
        out += " , message: 'should be equal to constant' ";
      }
      if (it.opts.verbose) {
        out +=
          " , schema: validate.schema" +
          $schemaPath +
          " , parentSchema: validate.schema" +
          it.schemaPath +
          " , data: " +
          $data +
          " ";
      }
      out += " } ";
    } else {
      out += " {} ";
    }
    var __err = out;
    out = $$outStack.pop();
    if (!it.compositeRule && $breakOnError) {
      if (it.async) {
        out += " throw new ValidationError([" + __err + "]); ";
      } else {
        out += " validate.errors = [" + __err + "]; return false; ";
      }
    } else {
      out +=
        " var err = " +
        __err +
        ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
    }
    out += " }";
    if ($breakOnError) {
      out += " else { ";
    }
    return out;
  };
});

// node_modules/ajv/lib/dotjs/contains.js
var require_contains = __commonJS((exports, module) => {
  module.exports = function generate_contains(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $data = "data" + ($dataLvl || "");
    var $valid = "valid" + $lvl;
    var $errs = "errs__" + $lvl;
    var $it = it.util.copy(it);
    var $closingBraces = "";
    $it.level++;
    var $nextValid = "valid" + $it.level;
    var $idx = "i" + $lvl,
      $dataNxt = ($it.dataLevel = it.dataLevel + 1),
      $nextData = "data" + $dataNxt,
      $currentBaseId = it.baseId,
      $nonEmptySchema = it.opts.strictKeywords
        ? (typeof $schema == "object" && Object.keys($schema).length > 0) ||
          $schema === false
        : it.util.schemaHasRules($schema, it.RULES.all);
    out += "var " + $errs + " = errors;var " + $valid + ";";
    if ($nonEmptySchema) {
      var $wasComposite = it.compositeRule;
      it.compositeRule = $it.compositeRule = true;
      $it.schema = $schema;
      $it.schemaPath = $schemaPath;
      $it.errSchemaPath = $errSchemaPath;
      out +=
        " var " +
        $nextValid +
        " = false; for (var " +
        $idx +
        " = 0; " +
        $idx +
        " < " +
        $data +
        ".length; " +
        $idx +
        "++) { ";
      $it.errorPath = it.util.getPathExpr(
        it.errorPath,
        $idx,
        it.opts.jsonPointers,
        true
      );
      var $passData = $data + "[" + $idx + "]";
      $it.dataPathArr[$dataNxt] = $idx;
      var $code = it.validate($it);
      $it.baseId = $currentBaseId;
      if (it.util.varOccurences($code, $nextData) < 2) {
        out += " " + it.util.varReplace($code, $nextData, $passData) + " ";
      } else {
        out += " var " + $nextData + " = " + $passData + "; " + $code + " ";
      }
      out += " if (" + $nextValid + ") break; }  ";
      it.compositeRule = $it.compositeRule = $wasComposite;
      out += " " + $closingBraces + " if (!" + $nextValid + ") {";
    } else {
      out += " if (" + $data + ".length == 0) {";
    }
    var $$outStack = $$outStack || [];
    $$outStack.push(out);
    out = "";
    if (it.createErrors !== false) {
      out +=
        " { keyword: '" +
        "contains" +
        "' , dataPath: (dataPath || '') + " +
        it.errorPath +
        " , schemaPath: " +
        it.util.toQuotedString($errSchemaPath) +
        " , params: {} ";
      if (it.opts.messages !== false) {
        out += " , message: 'should contain a valid item' ";
      }
      if (it.opts.verbose) {
        out +=
          " , schema: validate.schema" +
          $schemaPath +
          " , parentSchema: validate.schema" +
          it.schemaPath +
          " , data: " +
          $data +
          " ";
      }
      out += " } ";
    } else {
      out += " {} ";
    }
    var __err = out;
    out = $$outStack.pop();
    if (!it.compositeRule && $breakOnError) {
      if (it.async) {
        out += " throw new ValidationError([" + __err + "]); ";
      } else {
        out += " validate.errors = [" + __err + "]; return false; ";
      }
    } else {
      out +=
        " var err = " +
        __err +
        ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
    }
    out += " } else { ";
    if ($nonEmptySchema) {
      out +=
        "  errors = " +
        $errs +
        "; if (vErrors !== null) { if (" +
        $errs +
        ") vErrors.length = " +
        $errs +
        "; else vErrors = null; } ";
    }
    if (it.opts.allErrors) {
      out += " } ";
    }
    return out;
  };
});

// node_modules/ajv/lib/dotjs/dependencies.js
var require_dependencies = __commonJS((exports, module) => {
  module.exports = function generate_dependencies(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $data = "data" + ($dataLvl || "");
    var $errs = "errs__" + $lvl;
    var $it = it.util.copy(it);
    var $closingBraces = "";
    $it.level++;
    var $nextValid = "valid" + $it.level;
    var $schemaDeps = {},
      $propertyDeps = {},
      $ownProperties = it.opts.ownProperties;
    for ($property in $schema) {
      if ($property == "__proto__") continue;
      var $sch = $schema[$property];
      var $deps = Array.isArray($sch) ? $propertyDeps : $schemaDeps;
      $deps[$property] = $sch;
    }
    out += "var " + $errs + " = errors;";
    var $currentErrorPath = it.errorPath;
    out += "var missing" + $lvl + ";";
    for (var $property in $propertyDeps) {
      $deps = $propertyDeps[$property];
      if ($deps.length) {
        out +=
          " if ( " + $data + it.util.getProperty($property) + " !== undefined ";
        if ($ownProperties) {
          out +=
            " && Object.prototype.hasOwnProperty.call(" +
            $data +
            ", '" +
            it.util.escapeQuotes($property) +
            "') ";
        }
        if ($breakOnError) {
          out += " && ( ";
          var arr1 = $deps;
          if (arr1) {
            var $propertyKey,
              $i = -1,
              l1 = arr1.length - 1;
            while ($i < l1) {
              $propertyKey = arr1[($i += 1)];
              if ($i) {
                out += " || ";
              }
              var $prop = it.util.getProperty($propertyKey),
                $useData = $data + $prop;
              out += " ( ( " + $useData + " === undefined ";
              if ($ownProperties) {
                out +=
                  " || ! Object.prototype.hasOwnProperty.call(" +
                  $data +
                  ", '" +
                  it.util.escapeQuotes($propertyKey) +
                  "') ";
              }
              out +=
                ") && (missing" +
                $lvl +
                " = " +
                it.util.toQuotedString(
                  it.opts.jsonPointers ? $propertyKey : $prop
                ) +
                ") ) ";
            }
          }
          out += ")) {  ";
          var $propertyPath = "missing" + $lvl,
            $missingProperty = "' + " + $propertyPath + " + '";
          if (it.opts._errorDataPathProperty) {
            it.errorPath = it.opts.jsonPointers
              ? it.util.getPathExpr($currentErrorPath, $propertyPath, true)
              : $currentErrorPath + " + " + $propertyPath;
          }
          var $$outStack = $$outStack || [];
          $$outStack.push(out);
          out = "";
          if (it.createErrors !== false) {
            out +=
              " { keyword: '" +
              "dependencies" +
              "' , dataPath: (dataPath || '') + " +
              it.errorPath +
              " , schemaPath: " +
              it.util.toQuotedString($errSchemaPath) +
              " , params: { property: '" +
              it.util.escapeQuotes($property) +
              "', missingProperty: '" +
              $missingProperty +
              "', depsCount: " +
              $deps.length +
              ", deps: '" +
              it.util.escapeQuotes(
                $deps.length == 1 ? $deps[0] : $deps.join(", ")
              ) +
              "' } ";
            if (it.opts.messages !== false) {
              out += " , message: 'should have ";
              if ($deps.length == 1) {
                out += "property " + it.util.escapeQuotes($deps[0]);
              } else {
                out += "properties " + it.util.escapeQuotes($deps.join(", "));
              }
              out +=
                " when property " +
                it.util.escapeQuotes($property) +
                " is present' ";
            }
            if (it.opts.verbose) {
              out +=
                " , schema: validate.schema" +
                $schemaPath +
                " , parentSchema: validate.schema" +
                it.schemaPath +
                " , data: " +
                $data +
                " ";
            }
            out += " } ";
          } else {
            out += " {} ";
          }
          var __err = out;
          out = $$outStack.pop();
          if (!it.compositeRule && $breakOnError) {
            if (it.async) {
              out += " throw new ValidationError([" + __err + "]); ";
            } else {
              out += " validate.errors = [" + __err + "]; return false; ";
            }
          } else {
            out +=
              " var err = " +
              __err +
              ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
          }
        } else {
          out += " ) { ";
          var arr2 = $deps;
          if (arr2) {
            var $propertyKey,
              i2 = -1,
              l2 = arr2.length - 1;
            while (i2 < l2) {
              $propertyKey = arr2[(i2 += 1)];
              var $prop = it.util.getProperty($propertyKey),
                $missingProperty = it.util.escapeQuotes($propertyKey),
                $useData = $data + $prop;
              if (it.opts._errorDataPathProperty) {
                it.errorPath = it.util.getPath(
                  $currentErrorPath,
                  $propertyKey,
                  it.opts.jsonPointers
                );
              }
              out += " if ( " + $useData + " === undefined ";
              if ($ownProperties) {
                out +=
                  " || ! Object.prototype.hasOwnProperty.call(" +
                  $data +
                  ", '" +
                  it.util.escapeQuotes($propertyKey) +
                  "') ";
              }
              out += ") {  var err =   ";
              if (it.createErrors !== false) {
                out +=
                  " { keyword: '" +
                  "dependencies" +
                  "' , dataPath: (dataPath || '') + " +
                  it.errorPath +
                  " , schemaPath: " +
                  it.util.toQuotedString($errSchemaPath) +
                  " , params: { property: '" +
                  it.util.escapeQuotes($property) +
                  "', missingProperty: '" +
                  $missingProperty +
                  "', depsCount: " +
                  $deps.length +
                  ", deps: '" +
                  it.util.escapeQuotes(
                    $deps.length == 1 ? $deps[0] : $deps.join(", ")
                  ) +
                  "' } ";
                if (it.opts.messages !== false) {
                  out += " , message: 'should have ";
                  if ($deps.length == 1) {
                    out += "property " + it.util.escapeQuotes($deps[0]);
                  } else {
                    out +=
                      "properties " + it.util.escapeQuotes($deps.join(", "));
                  }
                  out +=
                    " when property " +
                    it.util.escapeQuotes($property) +
                    " is present' ";
                }
                if (it.opts.verbose) {
                  out +=
                    " , schema: validate.schema" +
                    $schemaPath +
                    " , parentSchema: validate.schema" +
                    it.schemaPath +
                    " , data: " +
                    $data +
                    " ";
                }
                out += " } ";
              } else {
                out += " {} ";
              }
              out +=
                ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; } ";
            }
          }
        }
        out += " }   ";
        if ($breakOnError) {
          $closingBraces += "}";
          out += " else { ";
        }
      }
    }
    it.errorPath = $currentErrorPath;
    var $currentBaseId = $it.baseId;
    for (var $property in $schemaDeps) {
      var $sch = $schemaDeps[$property];
      if (
        it.opts.strictKeywords
          ? (typeof $sch == "object" && Object.keys($sch).length > 0) ||
            $sch === false
          : it.util.schemaHasRules($sch, it.RULES.all)
      ) {
        out +=
          " " +
          $nextValid +
          " = true; if ( " +
          $data +
          it.util.getProperty($property) +
          " !== undefined ";
        if ($ownProperties) {
          out +=
            " && Object.prototype.hasOwnProperty.call(" +
            $data +
            ", '" +
            it.util.escapeQuotes($property) +
            "') ";
        }
        out += ") { ";
        $it.schema = $sch;
        $it.schemaPath = $schemaPath + it.util.getProperty($property);
        $it.errSchemaPath =
          $errSchemaPath + "/" + it.util.escapeFragment($property);
        out += "  " + it.validate($it) + " ";
        $it.baseId = $currentBaseId;
        out += " }  ";
        if ($breakOnError) {
          out += " if (" + $nextValid + ") { ";
          $closingBraces += "}";
        }
      }
    }
    if ($breakOnError) {
      out += "   " + $closingBraces + " if (" + $errs + " == errors) {";
    }
    return out;
  };
});

// node_modules/ajv/lib/dotjs/enum.js
var require_enum = __commonJS((exports, module) => {
  module.exports = function generate_enum(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $data = "data" + ($dataLvl || "");
    var $valid = "valid" + $lvl;
    var $isData = it.opts.$data && $schema && $schema.$data,
      $schemaValue;
    if ($isData) {
      out +=
        " var schema" +
        $lvl +
        " = " +
        it.util.getData($schema.$data, $dataLvl, it.dataPathArr) +
        "; ";
      $schemaValue = "schema" + $lvl;
    } else {
      $schemaValue = $schema;
    }
    var $i = "i" + $lvl,
      $vSchema = "schema" + $lvl;
    if (!$isData) {
      out += " var " + $vSchema + " = validate.schema" + $schemaPath + ";";
    }
    out += "var " + $valid + ";";
    if ($isData) {
      out +=
        " if (schema" +
        $lvl +
        " === undefined) " +
        $valid +
        " = true; else if (!Array.isArray(schema" +
        $lvl +
        ")) " +
        $valid +
        " = false; else {";
    }
    out +=
      "" +
      $valid +
      " = false;for (var " +
      $i +
      "=0; " +
      $i +
      "<" +
      $vSchema +
      ".length; " +
      $i +
      "++) if (equal(" +
      $data +
      ", " +
      $vSchema +
      "[" +
      $i +
      "])) { " +
      $valid +
      " = true; break; }";
    if ($isData) {
      out += "  }  ";
    }
    out += " if (!" + $valid + ") {   ";
    var $$outStack = $$outStack || [];
    $$outStack.push(out);
    out = "";
    if (it.createErrors !== false) {
      out +=
        " { keyword: '" +
        "enum" +
        "' , dataPath: (dataPath || '') + " +
        it.errorPath +
        " , schemaPath: " +
        it.util.toQuotedString($errSchemaPath) +
        " , params: { allowedValues: schema" +
        $lvl +
        " } ";
      if (it.opts.messages !== false) {
        out += " , message: 'should be equal to one of the allowed values' ";
      }
      if (it.opts.verbose) {
        out +=
          " , schema: validate.schema" +
          $schemaPath +
          " , parentSchema: validate.schema" +
          it.schemaPath +
          " , data: " +
          $data +
          " ";
      }
      out += " } ";
    } else {
      out += " {} ";
    }
    var __err = out;
    out = $$outStack.pop();
    if (!it.compositeRule && $breakOnError) {
      if (it.async) {
        out += " throw new ValidationError([" + __err + "]); ";
      } else {
        out += " validate.errors = [" + __err + "]; return false; ";
      }
    } else {
      out +=
        " var err = " +
        __err +
        ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
    }
    out += " }";
    if ($breakOnError) {
      out += " else { ";
    }
    return out;
  };
});

// node_modules/ajv/lib/dotjs/format.js
var require_format = __commonJS((exports, module) => {
  module.exports = function generate_format(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $data = "data" + ($dataLvl || "");
    if (it.opts.format === false) {
      if ($breakOnError) {
        out += " if (true) { ";
      }
      return out;
    }
    var $isData = it.opts.$data && $schema && $schema.$data,
      $schemaValue;
    if ($isData) {
      out +=
        " var schema" +
        $lvl +
        " = " +
        it.util.getData($schema.$data, $dataLvl, it.dataPathArr) +
        "; ";
      $schemaValue = "schema" + $lvl;
    } else {
      $schemaValue = $schema;
    }
    var $unknownFormats = it.opts.unknownFormats,
      $allowUnknown = Array.isArray($unknownFormats);
    if ($isData) {
      var $format = "format" + $lvl,
        $isObject = "isObject" + $lvl,
        $formatType = "formatType" + $lvl;
      out +=
        " var " +
        $format +
        " = formats[" +
        $schemaValue +
        "]; var " +
        $isObject +
        " = typeof " +
        $format +
        " == 'object' && !(" +
        $format +
        " instanceof RegExp) && " +
        $format +
        ".validate; var " +
        $formatType +
        " = " +
        $isObject +
        " && " +
        $format +
        ".type || 'string'; if (" +
        $isObject +
        ") { ";
      if (it.async) {
        out += " var async" + $lvl + " = " + $format + ".async; ";
      }
      out += " " + $format + " = " + $format + ".validate; } if (  ";
      if ($isData) {
        out +=
          " (" +
          $schemaValue +
          " !== undefined && typeof " +
          $schemaValue +
          " != 'string') || ";
      }
      out += " (";
      if ($unknownFormats != "ignore") {
        out += " (" + $schemaValue + " && !" + $format + " ";
        if ($allowUnknown) {
          out +=
            " && self._opts.unknownFormats.indexOf(" +
            $schemaValue +
            ") == -1 ";
        }
        out += ") || ";
      }
      out +=
        " (" +
        $format +
        " && " +
        $formatType +
        " == '" +
        $ruleType +
        "' && !(typeof " +
        $format +
        " == 'function' ? ";
      if (it.async) {
        out +=
          " (async" +
          $lvl +
          " ? await " +
          $format +
          "(" +
          $data +
          ") : " +
          $format +
          "(" +
          $data +
          ")) ";
      } else {
        out += " " + $format + "(" + $data + ") ";
      }
      out += " : " + $format + ".test(" + $data + "))))) {";
    } else {
      var $format = it.formats[$schema];
      if (!$format) {
        if ($unknownFormats == "ignore") {
          it.logger.warn(
            'unknown format "' +
              $schema +
              '" ignored in schema at path "' +
              it.errSchemaPath +
              '"'
          );
          if ($breakOnError) {
            out += " if (true) { ";
          }
          return out;
        } else if ($allowUnknown && $unknownFormats.indexOf($schema) >= 0) {
          if ($breakOnError) {
            out += " if (true) { ";
          }
          return out;
        } else {
          throw new Error(
            'unknown format "' +
              $schema +
              '" is used in schema at path "' +
              it.errSchemaPath +
              '"'
          );
        }
      }
      var $isObject =
        typeof $format == "object" &&
        !($format instanceof RegExp) &&
        $format.validate;
      var $formatType = ($isObject && $format.type) || "string";
      if ($isObject) {
        var $async = $format.async === true;
        $format = $format.validate;
      }
      if ($formatType != $ruleType) {
        if ($breakOnError) {
          out += " if (true) { ";
        }
        return out;
      }
      if ($async) {
        if (!it.async) throw new Error("async format in sync schema");
        var $formatRef = "formats" + it.util.getProperty($schema) + ".validate";
        out += " if (!(await " + $formatRef + "(" + $data + "))) { ";
      } else {
        out += " if (! ";
        var $formatRef = "formats" + it.util.getProperty($schema);
        if ($isObject) $formatRef += ".validate";
        if (typeof $format == "function") {
          out += " " + $formatRef + "(" + $data + ") ";
        } else {
          out += " " + $formatRef + ".test(" + $data + ") ";
        }
        out += ") { ";
      }
    }
    var $$outStack = $$outStack || [];
    $$outStack.push(out);
    out = "";
    if (it.createErrors !== false) {
      out +=
        " { keyword: '" +
        "format" +
        "' , dataPath: (dataPath || '') + " +
        it.errorPath +
        " , schemaPath: " +
        it.util.toQuotedString($errSchemaPath) +
        " , params: { format:  ";
      if ($isData) {
        out += "" + $schemaValue;
      } else {
        out += "" + it.util.toQuotedString($schema);
      }
      out += "  } ";
      if (it.opts.messages !== false) {
        out += ` , message: 'should match format "`;
        if ($isData) {
          out += "' + " + $schemaValue + " + '";
        } else {
          out += "" + it.util.escapeQuotes($schema);
        }
        out += `"' `;
      }
      if (it.opts.verbose) {
        out += " , schema:  ";
        if ($isData) {
          out += "validate.schema" + $schemaPath;
        } else {
          out += "" + it.util.toQuotedString($schema);
        }
        out +=
          "         , parentSchema: validate.schema" +
          it.schemaPath +
          " , data: " +
          $data +
          " ";
      }
      out += " } ";
    } else {
      out += " {} ";
    }
    var __err = out;
    out = $$outStack.pop();
    if (!it.compositeRule && $breakOnError) {
      if (it.async) {
        out += " throw new ValidationError([" + __err + "]); ";
      } else {
        out += " validate.errors = [" + __err + "]; return false; ";
      }
    } else {
      out +=
        " var err = " +
        __err +
        ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
    }
    out += " } ";
    if ($breakOnError) {
      out += " else { ";
    }
    return out;
  };
});

// node_modules/ajv/lib/dotjs/if.js
var require_if = __commonJS((exports, module) => {
  module.exports = function generate_if(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $data = "data" + ($dataLvl || "");
    var $valid = "valid" + $lvl;
    var $errs = "errs__" + $lvl;
    var $it = it.util.copy(it);
    $it.level++;
    var $nextValid = "valid" + $it.level;
    var $thenSch = it.schema["then"],
      $elseSch = it.schema["else"],
      $thenPresent =
        $thenSch !== undefined &&
        (it.opts.strictKeywords
          ? (typeof $thenSch == "object" && Object.keys($thenSch).length > 0) ||
            $thenSch === false
          : it.util.schemaHasRules($thenSch, it.RULES.all)),
      $elsePresent =
        $elseSch !== undefined &&
        (it.opts.strictKeywords
          ? (typeof $elseSch == "object" && Object.keys($elseSch).length > 0) ||
            $elseSch === false
          : it.util.schemaHasRules($elseSch, it.RULES.all)),
      $currentBaseId = $it.baseId;
    if ($thenPresent || $elsePresent) {
      var $ifClause;
      $it.createErrors = false;
      $it.schema = $schema;
      $it.schemaPath = $schemaPath;
      $it.errSchemaPath = $errSchemaPath;
      out += " var " + $errs + " = errors; var " + $valid + " = true;  ";
      var $wasComposite = it.compositeRule;
      it.compositeRule = $it.compositeRule = true;
      out += "  " + it.validate($it) + " ";
      $it.baseId = $currentBaseId;
      $it.createErrors = true;
      out +=
        "  errors = " +
        $errs +
        "; if (vErrors !== null) { if (" +
        $errs +
        ") vErrors.length = " +
        $errs +
        "; else vErrors = null; }  ";
      it.compositeRule = $it.compositeRule = $wasComposite;
      if ($thenPresent) {
        out += " if (" + $nextValid + ") {  ";
        $it.schema = it.schema["then"];
        $it.schemaPath = it.schemaPath + ".then";
        $it.errSchemaPath = it.errSchemaPath + "/then";
        out += "  " + it.validate($it) + " ";
        $it.baseId = $currentBaseId;
        out += " " + $valid + " = " + $nextValid + "; ";
        if ($thenPresent && $elsePresent) {
          $ifClause = "ifClause" + $lvl;
          out += " var " + $ifClause + " = 'then'; ";
        } else {
          $ifClause = "'then'";
        }
        out += " } ";
        if ($elsePresent) {
          out += " else { ";
        }
      } else {
        out += " if (!" + $nextValid + ") { ";
      }
      if ($elsePresent) {
        $it.schema = it.schema["else"];
        $it.schemaPath = it.schemaPath + ".else";
        $it.errSchemaPath = it.errSchemaPath + "/else";
        out += "  " + it.validate($it) + " ";
        $it.baseId = $currentBaseId;
        out += " " + $valid + " = " + $nextValid + "; ";
        if ($thenPresent && $elsePresent) {
          $ifClause = "ifClause" + $lvl;
          out += " var " + $ifClause + " = 'else'; ";
        } else {
          $ifClause = "'else'";
        }
        out += " } ";
      }
      out += " if (!" + $valid + ") {   var err =   ";
      if (it.createErrors !== false) {
        out +=
          " { keyword: '" +
          "if" +
          "' , dataPath: (dataPath || '') + " +
          it.errorPath +
          " , schemaPath: " +
          it.util.toQuotedString($errSchemaPath) +
          " , params: { failingKeyword: " +
          $ifClause +
          " } ";
        if (it.opts.messages !== false) {
          out +=
            ` , message: 'should match "' + ` + $ifClause + ` + '" schema' `;
        }
        if (it.opts.verbose) {
          out +=
            " , schema: validate.schema" +
            $schemaPath +
            " , parentSchema: validate.schema" +
            it.schemaPath +
            " , data: " +
            $data +
            " ";
        }
        out += " } ";
      } else {
        out += " {} ";
      }
      out +=
        ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
      if (!it.compositeRule && $breakOnError) {
        if (it.async) {
          out += " throw new ValidationError(vErrors); ";
        } else {
          out += " validate.errors = vErrors; return false; ";
        }
      }
      out += " }   ";
      if ($breakOnError) {
        out += " else { ";
      }
    } else {
      if ($breakOnError) {
        out += " if (true) { ";
      }
    }
    return out;
  };
});

// node_modules/ajv/lib/dotjs/items.js
var require_items = __commonJS((exports, module) => {
  module.exports = function generate_items(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $data = "data" + ($dataLvl || "");
    var $valid = "valid" + $lvl;
    var $errs = "errs__" + $lvl;
    var $it = it.util.copy(it);
    var $closingBraces = "";
    $it.level++;
    var $nextValid = "valid" + $it.level;
    var $idx = "i" + $lvl,
      $dataNxt = ($it.dataLevel = it.dataLevel + 1),
      $nextData = "data" + $dataNxt,
      $currentBaseId = it.baseId;
    out += "var " + $errs + " = errors;var " + $valid + ";";
    if (Array.isArray($schema)) {
      var $additionalItems = it.schema.additionalItems;
      if ($additionalItems === false) {
        out +=
          " " + $valid + " = " + $data + ".length <= " + $schema.length + "; ";
        var $currErrSchemaPath = $errSchemaPath;
        $errSchemaPath = it.errSchemaPath + "/additionalItems";
        out += "  if (!" + $valid + ") {   ";
        var $$outStack = $$outStack || [];
        $$outStack.push(out);
        out = "";
        if (it.createErrors !== false) {
          out +=
            " { keyword: '" +
            "additionalItems" +
            "' , dataPath: (dataPath || '') + " +
            it.errorPath +
            " , schemaPath: " +
            it.util.toQuotedString($errSchemaPath) +
            " , params: { limit: " +
            $schema.length +
            " } ";
          if (it.opts.messages !== false) {
            out +=
              " , message: 'should NOT have more than " +
              $schema.length +
              " items' ";
          }
          if (it.opts.verbose) {
            out +=
              " , schema: false , parentSchema: validate.schema" +
              it.schemaPath +
              " , data: " +
              $data +
              " ";
          }
          out += " } ";
        } else {
          out += " {} ";
        }
        var __err = out;
        out = $$outStack.pop();
        if (!it.compositeRule && $breakOnError) {
          if (it.async) {
            out += " throw new ValidationError([" + __err + "]); ";
          } else {
            out += " validate.errors = [" + __err + "]; return false; ";
          }
        } else {
          out +=
            " var err = " +
            __err +
            ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
        }
        out += " } ";
        $errSchemaPath = $currErrSchemaPath;
        if ($breakOnError) {
          $closingBraces += "}";
          out += " else { ";
        }
      }
      var arr1 = $schema;
      if (arr1) {
        var $sch,
          $i = -1,
          l1 = arr1.length - 1;
        while ($i < l1) {
          $sch = arr1[($i += 1)];
          if (
            it.opts.strictKeywords
              ? (typeof $sch == "object" && Object.keys($sch).length > 0) ||
                $sch === false
              : it.util.schemaHasRules($sch, it.RULES.all)
          ) {
            out +=
              " " +
              $nextValid +
              " = true; if (" +
              $data +
              ".length > " +
              $i +
              ") { ";
            var $passData = $data + "[" + $i + "]";
            $it.schema = $sch;
            $it.schemaPath = $schemaPath + "[" + $i + "]";
            $it.errSchemaPath = $errSchemaPath + "/" + $i;
            $it.errorPath = it.util.getPathExpr(
              it.errorPath,
              $i,
              it.opts.jsonPointers,
              true
            );
            $it.dataPathArr[$dataNxt] = $i;
            var $code = it.validate($it);
            $it.baseId = $currentBaseId;
            if (it.util.varOccurences($code, $nextData) < 2) {
              out +=
                " " + it.util.varReplace($code, $nextData, $passData) + " ";
            } else {
              out +=
                " var " + $nextData + " = " + $passData + "; " + $code + " ";
            }
            out += " }  ";
            if ($breakOnError) {
              out += " if (" + $nextValid + ") { ";
              $closingBraces += "}";
            }
          }
        }
      }
      if (
        typeof $additionalItems == "object" &&
        (it.opts.strictKeywords
          ? (typeof $additionalItems == "object" &&
              Object.keys($additionalItems).length > 0) ||
            $additionalItems === false
          : it.util.schemaHasRules($additionalItems, it.RULES.all))
      ) {
        $it.schema = $additionalItems;
        $it.schemaPath = it.schemaPath + ".additionalItems";
        $it.errSchemaPath = it.errSchemaPath + "/additionalItems";
        out +=
          " " +
          $nextValid +
          " = true; if (" +
          $data +
          ".length > " +
          $schema.length +
          ") {  for (var " +
          $idx +
          " = " +
          $schema.length +
          "; " +
          $idx +
          " < " +
          $data +
          ".length; " +
          $idx +
          "++) { ";
        $it.errorPath = it.util.getPathExpr(
          it.errorPath,
          $idx,
          it.opts.jsonPointers,
          true
        );
        var $passData = $data + "[" + $idx + "]";
        $it.dataPathArr[$dataNxt] = $idx;
        var $code = it.validate($it);
        $it.baseId = $currentBaseId;
        if (it.util.varOccurences($code, $nextData) < 2) {
          out += " " + it.util.varReplace($code, $nextData, $passData) + " ";
        } else {
          out += " var " + $nextData + " = " + $passData + "; " + $code + " ";
        }
        if ($breakOnError) {
          out += " if (!" + $nextValid + ") break; ";
        }
        out += " } }  ";
        if ($breakOnError) {
          out += " if (" + $nextValid + ") { ";
          $closingBraces += "}";
        }
      }
    } else if (
      it.opts.strictKeywords
        ? (typeof $schema == "object" && Object.keys($schema).length > 0) ||
          $schema === false
        : it.util.schemaHasRules($schema, it.RULES.all)
    ) {
      $it.schema = $schema;
      $it.schemaPath = $schemaPath;
      $it.errSchemaPath = $errSchemaPath;
      out +=
        "  for (var " +
        $idx +
        " = " +
        0 +
        "; " +
        $idx +
        " < " +
        $data +
        ".length; " +
        $idx +
        "++) { ";
      $it.errorPath = it.util.getPathExpr(
        it.errorPath,
        $idx,
        it.opts.jsonPointers,
        true
      );
      var $passData = $data + "[" + $idx + "]";
      $it.dataPathArr[$dataNxt] = $idx;
      var $code = it.validate($it);
      $it.baseId = $currentBaseId;
      if (it.util.varOccurences($code, $nextData) < 2) {
        out += " " + it.util.varReplace($code, $nextData, $passData) + " ";
      } else {
        out += " var " + $nextData + " = " + $passData + "; " + $code + " ";
      }
      if ($breakOnError) {
        out += " if (!" + $nextValid + ") break; ";
      }
      out += " }";
    }
    if ($breakOnError) {
      out += " " + $closingBraces + " if (" + $errs + " == errors) {";
    }
    return out;
  };
});

// node_modules/ajv/lib/dotjs/_limit.js
var require__limit = __commonJS((exports, module) => {
  module.exports = function generate__limit(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $errorKeyword;
    var $data = "data" + ($dataLvl || "");
    var $isData = it.opts.$data && $schema && $schema.$data,
      $schemaValue;
    if ($isData) {
      out +=
        " var schema" +
        $lvl +
        " = " +
        it.util.getData($schema.$data, $dataLvl, it.dataPathArr) +
        "; ";
      $schemaValue = "schema" + $lvl;
    } else {
      $schemaValue = $schema;
    }
    var $isMax = $keyword == "maximum",
      $exclusiveKeyword = $isMax ? "exclusiveMaximum" : "exclusiveMinimum",
      $schemaExcl = it.schema[$exclusiveKeyword],
      $isDataExcl = it.opts.$data && $schemaExcl && $schemaExcl.$data,
      $op = $isMax ? "<" : ">",
      $notOp = $isMax ? ">" : "<",
      $errorKeyword = undefined;
    if (!($isData || typeof $schema == "number" || $schema === undefined)) {
      throw new Error($keyword + " must be number");
    }
    if (
      !(
        $isDataExcl ||
        $schemaExcl === undefined ||
        typeof $schemaExcl == "number" ||
        typeof $schemaExcl == "boolean"
      )
    ) {
      throw new Error($exclusiveKeyword + " must be number or boolean");
    }
    if ($isDataExcl) {
      var $schemaValueExcl = it.util.getData(
          $schemaExcl.$data,
          $dataLvl,
          it.dataPathArr
        ),
        $exclusive = "exclusive" + $lvl,
        $exclType = "exclType" + $lvl,
        $exclIsNumber = "exclIsNumber" + $lvl,
        $opExpr = "op" + $lvl,
        $opStr = "' + " + $opExpr + " + '";
      out += " var schemaExcl" + $lvl + " = " + $schemaValueExcl + "; ";
      $schemaValueExcl = "schemaExcl" + $lvl;
      out +=
        " var " +
        $exclusive +
        "; var " +
        $exclType +
        " = typeof " +
        $schemaValueExcl +
        "; if (" +
        $exclType +
        " != 'boolean' && " +
        $exclType +
        " != 'undefined' && " +
        $exclType +
        " != 'number') { ";
      var $errorKeyword = $exclusiveKeyword;
      var $$outStack = $$outStack || [];
      $$outStack.push(out);
      out = "";
      if (it.createErrors !== false) {
        out +=
          " { keyword: '" +
          ($errorKeyword || "_exclusiveLimit") +
          "' , dataPath: (dataPath || '') + " +
          it.errorPath +
          " , schemaPath: " +
          it.util.toQuotedString($errSchemaPath) +
          " , params: {} ";
        if (it.opts.messages !== false) {
          out += " , message: '" + $exclusiveKeyword + " should be boolean' ";
        }
        if (it.opts.verbose) {
          out +=
            " , schema: validate.schema" +
            $schemaPath +
            " , parentSchema: validate.schema" +
            it.schemaPath +
            " , data: " +
            $data +
            " ";
        }
        out += " } ";
      } else {
        out += " {} ";
      }
      var __err = out;
      out = $$outStack.pop();
      if (!it.compositeRule && $breakOnError) {
        if (it.async) {
          out += " throw new ValidationError([" + __err + "]); ";
        } else {
          out += " validate.errors = [" + __err + "]; return false; ";
        }
      } else {
        out +=
          " var err = " +
          __err +
          ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
      }
      out += " } else if ( ";
      if ($isData) {
        out +=
          " (" +
          $schemaValue +
          " !== undefined && typeof " +
          $schemaValue +
          " != 'number') || ";
      }
      out +=
        " " +
        $exclType +
        " == 'number' ? ( (" +
        $exclusive +
        " = " +
        $schemaValue +
        " === undefined || " +
        $schemaValueExcl +
        " " +
        $op +
        "= " +
        $schemaValue +
        ") ? " +
        $data +
        " " +
        $notOp +
        "= " +
        $schemaValueExcl +
        " : " +
        $data +
        " " +
        $notOp +
        " " +
        $schemaValue +
        " ) : ( (" +
        $exclusive +
        " = " +
        $schemaValueExcl +
        " === true) ? " +
        $data +
        " " +
        $notOp +
        "= " +
        $schemaValue +
        " : " +
        $data +
        " " +
        $notOp +
        " " +
        $schemaValue +
        " ) || " +
        $data +
        " !== " +
        $data +
        ") { var op" +
        $lvl +
        " = " +
        $exclusive +
        " ? '" +
        $op +
        "' : '" +
        $op +
        "='; ";
      if ($schema === undefined) {
        $errorKeyword = $exclusiveKeyword;
        $errSchemaPath = it.errSchemaPath + "/" + $exclusiveKeyword;
        $schemaValue = $schemaValueExcl;
        $isData = $isDataExcl;
      }
    } else {
      var $exclIsNumber = typeof $schemaExcl == "number",
        $opStr = $op;
      if ($exclIsNumber && $isData) {
        var $opExpr = "'" + $opStr + "'";
        out += " if ( ";
        if ($isData) {
          out +=
            " (" +
            $schemaValue +
            " !== undefined && typeof " +
            $schemaValue +
            " != 'number') || ";
        }
        out +=
          " ( " +
          $schemaValue +
          " === undefined || " +
          $schemaExcl +
          " " +
          $op +
          "= " +
          $schemaValue +
          " ? " +
          $data +
          " " +
          $notOp +
          "= " +
          $schemaExcl +
          " : " +
          $data +
          " " +
          $notOp +
          " " +
          $schemaValue +
          " ) || " +
          $data +
          " !== " +
          $data +
          ") { ";
      } else {
        if ($exclIsNumber && $schema === undefined) {
          $exclusive = true;
          $errorKeyword = $exclusiveKeyword;
          $errSchemaPath = it.errSchemaPath + "/" + $exclusiveKeyword;
          $schemaValue = $schemaExcl;
          $notOp += "=";
        } else {
          if ($exclIsNumber)
            $schemaValue = Math[$isMax ? "min" : "max"]($schemaExcl, $schema);
          if ($schemaExcl === ($exclIsNumber ? $schemaValue : true)) {
            $exclusive = true;
            $errorKeyword = $exclusiveKeyword;
            $errSchemaPath = it.errSchemaPath + "/" + $exclusiveKeyword;
            $notOp += "=";
          } else {
            $exclusive = false;
            $opStr += "=";
          }
        }
        var $opExpr = "'" + $opStr + "'";
        out += " if ( ";
        if ($isData) {
          out +=
            " (" +
            $schemaValue +
            " !== undefined && typeof " +
            $schemaValue +
            " != 'number') || ";
        }
        out +=
          " " +
          $data +
          " " +
          $notOp +
          " " +
          $schemaValue +
          " || " +
          $data +
          " !== " +
          $data +
          ") { ";
      }
    }
    $errorKeyword = $errorKeyword || $keyword;
    var $$outStack = $$outStack || [];
    $$outStack.push(out);
    out = "";
    if (it.createErrors !== false) {
      out +=
        " { keyword: '" +
        ($errorKeyword || "_limit") +
        "' , dataPath: (dataPath || '') + " +
        it.errorPath +
        " , schemaPath: " +
        it.util.toQuotedString($errSchemaPath) +
        " , params: { comparison: " +
        $opExpr +
        ", limit: " +
        $schemaValue +
        ", exclusive: " +
        $exclusive +
        " } ";
      if (it.opts.messages !== false) {
        out += " , message: 'should be " + $opStr + " ";
        if ($isData) {
          out += "' + " + $schemaValue;
        } else {
          out += "" + $schemaValue + "'";
        }
      }
      if (it.opts.verbose) {
        out += " , schema:  ";
        if ($isData) {
          out += "validate.schema" + $schemaPath;
        } else {
          out += "" + $schema;
        }
        out +=
          "         , parentSchema: validate.schema" +
          it.schemaPath +
          " , data: " +
          $data +
          " ";
      }
      out += " } ";
    } else {
      out += " {} ";
    }
    var __err = out;
    out = $$outStack.pop();
    if (!it.compositeRule && $breakOnError) {
      if (it.async) {
        out += " throw new ValidationError([" + __err + "]); ";
      } else {
        out += " validate.errors = [" + __err + "]; return false; ";
      }
    } else {
      out +=
        " var err = " +
        __err +
        ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
    }
    out += " } ";
    if ($breakOnError) {
      out += " else { ";
    }
    return out;
  };
});

// node_modules/ajv/lib/dotjs/_limitItems.js
var require__limitItems = __commonJS((exports, module) => {
  module.exports = function generate__limitItems(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $errorKeyword;
    var $data = "data" + ($dataLvl || "");
    var $isData = it.opts.$data && $schema && $schema.$data,
      $schemaValue;
    if ($isData) {
      out +=
        " var schema" +
        $lvl +
        " = " +
        it.util.getData($schema.$data, $dataLvl, it.dataPathArr) +
        "; ";
      $schemaValue = "schema" + $lvl;
    } else {
      $schemaValue = $schema;
    }
    if (!($isData || typeof $schema == "number")) {
      throw new Error($keyword + " must be number");
    }
    var $op = $keyword == "maxItems" ? ">" : "<";
    out += "if ( ";
    if ($isData) {
      out +=
        " (" +
        $schemaValue +
        " !== undefined && typeof " +
        $schemaValue +
        " != 'number') || ";
    }
    out += " " + $data + ".length " + $op + " " + $schemaValue + ") { ";
    var $errorKeyword = $keyword;
    var $$outStack = $$outStack || [];
    $$outStack.push(out);
    out = "";
    if (it.createErrors !== false) {
      out +=
        " { keyword: '" +
        ($errorKeyword || "_limitItems") +
        "' , dataPath: (dataPath || '') + " +
        it.errorPath +
        " , schemaPath: " +
        it.util.toQuotedString($errSchemaPath) +
        " , params: { limit: " +
        $schemaValue +
        " } ";
      if (it.opts.messages !== false) {
        out += " , message: 'should NOT have ";
        if ($keyword == "maxItems") {
          out += "more";
        } else {
          out += "fewer";
        }
        out += " than ";
        if ($isData) {
          out += "' + " + $schemaValue + " + '";
        } else {
          out += "" + $schema;
        }
        out += " items' ";
      }
      if (it.opts.verbose) {
        out += " , schema:  ";
        if ($isData) {
          out += "validate.schema" + $schemaPath;
        } else {
          out += "" + $schema;
        }
        out +=
          "         , parentSchema: validate.schema" +
          it.schemaPath +
          " , data: " +
          $data +
          " ";
      }
      out += " } ";
    } else {
      out += " {} ";
    }
    var __err = out;
    out = $$outStack.pop();
    if (!it.compositeRule && $breakOnError) {
      if (it.async) {
        out += " throw new ValidationError([" + __err + "]); ";
      } else {
        out += " validate.errors = [" + __err + "]; return false; ";
      }
    } else {
      out +=
        " var err = " +
        __err +
        ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
    }
    out += "} ";
    if ($breakOnError) {
      out += " else { ";
    }
    return out;
  };
});

// node_modules/ajv/lib/dotjs/_limitLength.js
var require__limitLength = __commonJS((exports, module) => {
  module.exports = function generate__limitLength(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $errorKeyword;
    var $data = "data" + ($dataLvl || "");
    var $isData = it.opts.$data && $schema && $schema.$data,
      $schemaValue;
    if ($isData) {
      out +=
        " var schema" +
        $lvl +
        " = " +
        it.util.getData($schema.$data, $dataLvl, it.dataPathArr) +
        "; ";
      $schemaValue = "schema" + $lvl;
    } else {
      $schemaValue = $schema;
    }
    if (!($isData || typeof $schema == "number")) {
      throw new Error($keyword + " must be number");
    }
    var $op = $keyword == "maxLength" ? ">" : "<";
    out += "if ( ";
    if ($isData) {
      out +=
        " (" +
        $schemaValue +
        " !== undefined && typeof " +
        $schemaValue +
        " != 'number') || ";
    }
    if (it.opts.unicode === false) {
      out += " " + $data + ".length ";
    } else {
      out += " ucs2length(" + $data + ") ";
    }
    out += " " + $op + " " + $schemaValue + ") { ";
    var $errorKeyword = $keyword;
    var $$outStack = $$outStack || [];
    $$outStack.push(out);
    out = "";
    if (it.createErrors !== false) {
      out +=
        " { keyword: '" +
        ($errorKeyword || "_limitLength") +
        "' , dataPath: (dataPath || '') + " +
        it.errorPath +
        " , schemaPath: " +
        it.util.toQuotedString($errSchemaPath) +
        " , params: { limit: " +
        $schemaValue +
        " } ";
      if (it.opts.messages !== false) {
        out += " , message: 'should NOT be ";
        if ($keyword == "maxLength") {
          out += "longer";
        } else {
          out += "shorter";
        }
        out += " than ";
        if ($isData) {
          out += "' + " + $schemaValue + " + '";
        } else {
          out += "" + $schema;
        }
        out += " characters' ";
      }
      if (it.opts.verbose) {
        out += " , schema:  ";
        if ($isData) {
          out += "validate.schema" + $schemaPath;
        } else {
          out += "" + $schema;
        }
        out +=
          "         , parentSchema: validate.schema" +
          it.schemaPath +
          " , data: " +
          $data +
          " ";
      }
      out += " } ";
    } else {
      out += " {} ";
    }
    var __err = out;
    out = $$outStack.pop();
    if (!it.compositeRule && $breakOnError) {
      if (it.async) {
        out += " throw new ValidationError([" + __err + "]); ";
      } else {
        out += " validate.errors = [" + __err + "]; return false; ";
      }
    } else {
      out +=
        " var err = " +
        __err +
        ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
    }
    out += "} ";
    if ($breakOnError) {
      out += " else { ";
    }
    return out;
  };
});

// node_modules/ajv/lib/dotjs/_limitProperties.js
var require__limitProperties = __commonJS((exports, module) => {
  module.exports = function generate__limitProperties(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $errorKeyword;
    var $data = "data" + ($dataLvl || "");
    var $isData = it.opts.$data && $schema && $schema.$data,
      $schemaValue;
    if ($isData) {
      out +=
        " var schema" +
        $lvl +
        " = " +
        it.util.getData($schema.$data, $dataLvl, it.dataPathArr) +
        "; ";
      $schemaValue = "schema" + $lvl;
    } else {
      $schemaValue = $schema;
    }
    if (!($isData || typeof $schema == "number")) {
      throw new Error($keyword + " must be number");
    }
    var $op = $keyword == "maxProperties" ? ">" : "<";
    out += "if ( ";
    if ($isData) {
      out +=
        " (" +
        $schemaValue +
        " !== undefined && typeof " +
        $schemaValue +
        " != 'number') || ";
    }
    out +=
      " Object.keys(" + $data + ").length " + $op + " " + $schemaValue + ") { ";
    var $errorKeyword = $keyword;
    var $$outStack = $$outStack || [];
    $$outStack.push(out);
    out = "";
    if (it.createErrors !== false) {
      out +=
        " { keyword: '" +
        ($errorKeyword || "_limitProperties") +
        "' , dataPath: (dataPath || '') + " +
        it.errorPath +
        " , schemaPath: " +
        it.util.toQuotedString($errSchemaPath) +
        " , params: { limit: " +
        $schemaValue +
        " } ";
      if (it.opts.messages !== false) {
        out += " , message: 'should NOT have ";
        if ($keyword == "maxProperties") {
          out += "more";
        } else {
          out += "fewer";
        }
        out += " than ";
        if ($isData) {
          out += "' + " + $schemaValue + " + '";
        } else {
          out += "" + $schema;
        }
        out += " properties' ";
      }
      if (it.opts.verbose) {
        out += " , schema:  ";
        if ($isData) {
          out += "validate.schema" + $schemaPath;
        } else {
          out += "" + $schema;
        }
        out +=
          "         , parentSchema: validate.schema" +
          it.schemaPath +
          " , data: " +
          $data +
          " ";
      }
      out += " } ";
    } else {
      out += " {} ";
    }
    var __err = out;
    out = $$outStack.pop();
    if (!it.compositeRule && $breakOnError) {
      if (it.async) {
        out += " throw new ValidationError([" + __err + "]); ";
      } else {
        out += " validate.errors = [" + __err + "]; return false; ";
      }
    } else {
      out +=
        " var err = " +
        __err +
        ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
    }
    out += "} ";
    if ($breakOnError) {
      out += " else { ";
    }
    return out;
  };
});

// node_modules/ajv/lib/dotjs/multipleOf.js
var require_multipleOf = __commonJS((exports, module) => {
  module.exports = function generate_multipleOf(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $data = "data" + ($dataLvl || "");
    var $isData = it.opts.$data && $schema && $schema.$data,
      $schemaValue;
    if ($isData) {
      out +=
        " var schema" +
        $lvl +
        " = " +
        it.util.getData($schema.$data, $dataLvl, it.dataPathArr) +
        "; ";
      $schemaValue = "schema" + $lvl;
    } else {
      $schemaValue = $schema;
    }
    if (!($isData || typeof $schema == "number")) {
      throw new Error($keyword + " must be number");
    }
    out += "var division" + $lvl + ";if (";
    if ($isData) {
      out +=
        " " +
        $schemaValue +
        " !== undefined && ( typeof " +
        $schemaValue +
        " != 'number' || ";
    }
    out += " (division" + $lvl + " = " + $data + " / " + $schemaValue + ", ";
    if (it.opts.multipleOfPrecision) {
      out +=
        " Math.abs(Math.round(division" +
        $lvl +
        ") - division" +
        $lvl +
        ") > 1e-" +
        it.opts.multipleOfPrecision +
        " ";
    } else {
      out += " division" + $lvl + " !== parseInt(division" + $lvl + ") ";
    }
    out += " ) ";
    if ($isData) {
      out += "  )  ";
    }
    out += " ) {   ";
    var $$outStack = $$outStack || [];
    $$outStack.push(out);
    out = "";
    if (it.createErrors !== false) {
      out +=
        " { keyword: '" +
        "multipleOf" +
        "' , dataPath: (dataPath || '') + " +
        it.errorPath +
        " , schemaPath: " +
        it.util.toQuotedString($errSchemaPath) +
        " , params: { multipleOf: " +
        $schemaValue +
        " } ";
      if (it.opts.messages !== false) {
        out += " , message: 'should be multiple of ";
        if ($isData) {
          out += "' + " + $schemaValue;
        } else {
          out += "" + $schemaValue + "'";
        }
      }
      if (it.opts.verbose) {
        out += " , schema:  ";
        if ($isData) {
          out += "validate.schema" + $schemaPath;
        } else {
          out += "" + $schema;
        }
        out +=
          "         , parentSchema: validate.schema" +
          it.schemaPath +
          " , data: " +
          $data +
          " ";
      }
      out += " } ";
    } else {
      out += " {} ";
    }
    var __err = out;
    out = $$outStack.pop();
    if (!it.compositeRule && $breakOnError) {
      if (it.async) {
        out += " throw new ValidationError([" + __err + "]); ";
      } else {
        out += " validate.errors = [" + __err + "]; return false; ";
      }
    } else {
      out +=
        " var err = " +
        __err +
        ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
    }
    out += "} ";
    if ($breakOnError) {
      out += " else { ";
    }
    return out;
  };
});

// node_modules/ajv/lib/dotjs/not.js
var require_not = __commonJS((exports, module) => {
  module.exports = function generate_not(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $data = "data" + ($dataLvl || "");
    var $errs = "errs__" + $lvl;
    var $it = it.util.copy(it);
    $it.level++;
    var $nextValid = "valid" + $it.level;
    if (
      it.opts.strictKeywords
        ? (typeof $schema == "object" && Object.keys($schema).length > 0) ||
          $schema === false
        : it.util.schemaHasRules($schema, it.RULES.all)
    ) {
      $it.schema = $schema;
      $it.schemaPath = $schemaPath;
      $it.errSchemaPath = $errSchemaPath;
      out += " var " + $errs + " = errors;  ";
      var $wasComposite = it.compositeRule;
      it.compositeRule = $it.compositeRule = true;
      $it.createErrors = false;
      var $allErrorsOption;
      if ($it.opts.allErrors) {
        $allErrorsOption = $it.opts.allErrors;
        $it.opts.allErrors = false;
      }
      out += " " + it.validate($it) + " ";
      $it.createErrors = true;
      if ($allErrorsOption) $it.opts.allErrors = $allErrorsOption;
      it.compositeRule = $it.compositeRule = $wasComposite;
      out += " if (" + $nextValid + ") {   ";
      var $$outStack = $$outStack || [];
      $$outStack.push(out);
      out = "";
      if (it.createErrors !== false) {
        out +=
          " { keyword: '" +
          "not" +
          "' , dataPath: (dataPath || '') + " +
          it.errorPath +
          " , schemaPath: " +
          it.util.toQuotedString($errSchemaPath) +
          " , params: {} ";
        if (it.opts.messages !== false) {
          out += " , message: 'should NOT be valid' ";
        }
        if (it.opts.verbose) {
          out +=
            " , schema: validate.schema" +
            $schemaPath +
            " , parentSchema: validate.schema" +
            it.schemaPath +
            " , data: " +
            $data +
            " ";
        }
        out += " } ";
      } else {
        out += " {} ";
      }
      var __err = out;
      out = $$outStack.pop();
      if (!it.compositeRule && $breakOnError) {
        if (it.async) {
          out += " throw new ValidationError([" + __err + "]); ";
        } else {
          out += " validate.errors = [" + __err + "]; return false; ";
        }
      } else {
        out +=
          " var err = " +
          __err +
          ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
      }
      out +=
        " } else {  errors = " +
        $errs +
        "; if (vErrors !== null) { if (" +
        $errs +
        ") vErrors.length = " +
        $errs +
        "; else vErrors = null; } ";
      if (it.opts.allErrors) {
        out += " } ";
      }
    } else {
      out += "  var err =   ";
      if (it.createErrors !== false) {
        out +=
          " { keyword: '" +
          "not" +
          "' , dataPath: (dataPath || '') + " +
          it.errorPath +
          " , schemaPath: " +
          it.util.toQuotedString($errSchemaPath) +
          " , params: {} ";
        if (it.opts.messages !== false) {
          out += " , message: 'should NOT be valid' ";
        }
        if (it.opts.verbose) {
          out +=
            " , schema: validate.schema" +
            $schemaPath +
            " , parentSchema: validate.schema" +
            it.schemaPath +
            " , data: " +
            $data +
            " ";
        }
        out += " } ";
      } else {
        out += " {} ";
      }
      out +=
        ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
      if ($breakOnError) {
        out += " if (false) { ";
      }
    }
    return out;
  };
});

// node_modules/ajv/lib/dotjs/oneOf.js
var require_oneOf = __commonJS((exports, module) => {
  module.exports = function generate_oneOf(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $data = "data" + ($dataLvl || "");
    var $valid = "valid" + $lvl;
    var $errs = "errs__" + $lvl;
    var $it = it.util.copy(it);
    var $closingBraces = "";
    $it.level++;
    var $nextValid = "valid" + $it.level;
    var $currentBaseId = $it.baseId,
      $prevValid = "prevValid" + $lvl,
      $passingSchemas = "passingSchemas" + $lvl;
    out +=
      "var " +
      $errs +
      " = errors , " +
      $prevValid +
      " = false , " +
      $valid +
      " = false , " +
      $passingSchemas +
      " = null; ";
    var $wasComposite = it.compositeRule;
    it.compositeRule = $it.compositeRule = true;
    var arr1 = $schema;
    if (arr1) {
      var $sch,
        $i = -1,
        l1 = arr1.length - 1;
      while ($i < l1) {
        $sch = arr1[($i += 1)];
        if (
          it.opts.strictKeywords
            ? (typeof $sch == "object" && Object.keys($sch).length > 0) ||
              $sch === false
            : it.util.schemaHasRules($sch, it.RULES.all)
        ) {
          $it.schema = $sch;
          $it.schemaPath = $schemaPath + "[" + $i + "]";
          $it.errSchemaPath = $errSchemaPath + "/" + $i;
          out += "  " + it.validate($it) + " ";
          $it.baseId = $currentBaseId;
        } else {
          out += " var " + $nextValid + " = true; ";
        }
        if ($i) {
          out +=
            " if (" +
            $nextValid +
            " && " +
            $prevValid +
            ") { " +
            $valid +
            " = false; " +
            $passingSchemas +
            " = [" +
            $passingSchemas +
            ", " +
            $i +
            "]; } else { ";
          $closingBraces += "}";
        }
        out +=
          " if (" +
          $nextValid +
          ") { " +
          $valid +
          " = " +
          $prevValid +
          " = true; " +
          $passingSchemas +
          " = " +
          $i +
          "; }";
      }
    }
    it.compositeRule = $it.compositeRule = $wasComposite;
    out += "" + $closingBraces + "if (!" + $valid + ") {   var err =   ";
    if (it.createErrors !== false) {
      out +=
        " { keyword: '" +
        "oneOf" +
        "' , dataPath: (dataPath || '') + " +
        it.errorPath +
        " , schemaPath: " +
        it.util.toQuotedString($errSchemaPath) +
        " , params: { passingSchemas: " +
        $passingSchemas +
        " } ";
      if (it.opts.messages !== false) {
        out += " , message: 'should match exactly one schema in oneOf' ";
      }
      if (it.opts.verbose) {
        out +=
          " , schema: validate.schema" +
          $schemaPath +
          " , parentSchema: validate.schema" +
          it.schemaPath +
          " , data: " +
          $data +
          " ";
      }
      out += " } ";
    } else {
      out += " {} ";
    }
    out +=
      ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
    if (!it.compositeRule && $breakOnError) {
      if (it.async) {
        out += " throw new ValidationError(vErrors); ";
      } else {
        out += " validate.errors = vErrors; return false; ";
      }
    }
    out +=
      "} else {  errors = " +
      $errs +
      "; if (vErrors !== null) { if (" +
      $errs +
      ") vErrors.length = " +
      $errs +
      "; else vErrors = null; }";
    if (it.opts.allErrors) {
      out += " } ";
    }
    return out;
  };
});

// node_modules/ajv/lib/dotjs/pattern.js
var require_pattern = __commonJS((exports, module) => {
  module.exports = function generate_pattern(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $data = "data" + ($dataLvl || "");
    var $isData = it.opts.$data && $schema && $schema.$data,
      $schemaValue;
    if ($isData) {
      out +=
        " var schema" +
        $lvl +
        " = " +
        it.util.getData($schema.$data, $dataLvl, it.dataPathArr) +
        "; ";
      $schemaValue = "schema" + $lvl;
    } else {
      $schemaValue = $schema;
    }
    var $regexp = $isData
      ? "(new RegExp(" + $schemaValue + "))"
      : it.usePattern($schema);
    out += "if ( ";
    if ($isData) {
      out +=
        " (" +
        $schemaValue +
        " !== undefined && typeof " +
        $schemaValue +
        " != 'string') || ";
    }
    out += " !" + $regexp + ".test(" + $data + ") ) {   ";
    var $$outStack = $$outStack || [];
    $$outStack.push(out);
    out = "";
    if (it.createErrors !== false) {
      out +=
        " { keyword: '" +
        "pattern" +
        "' , dataPath: (dataPath || '') + " +
        it.errorPath +
        " , schemaPath: " +
        it.util.toQuotedString($errSchemaPath) +
        " , params: { pattern:  ";
      if ($isData) {
        out += "" + $schemaValue;
      } else {
        out += "" + it.util.toQuotedString($schema);
      }
      out += "  } ";
      if (it.opts.messages !== false) {
        out += ` , message: 'should match pattern "`;
        if ($isData) {
          out += "' + " + $schemaValue + " + '";
        } else {
          out += "" + it.util.escapeQuotes($schema);
        }
        out += `"' `;
      }
      if (it.opts.verbose) {
        out += " , schema:  ";
        if ($isData) {
          out += "validate.schema" + $schemaPath;
        } else {
          out += "" + it.util.toQuotedString($schema);
        }
        out +=
          "         , parentSchema: validate.schema" +
          it.schemaPath +
          " , data: " +
          $data +
          " ";
      }
      out += " } ";
    } else {
      out += " {} ";
    }
    var __err = out;
    out = $$outStack.pop();
    if (!it.compositeRule && $breakOnError) {
      if (it.async) {
        out += " throw new ValidationError([" + __err + "]); ";
      } else {
        out += " validate.errors = [" + __err + "]; return false; ";
      }
    } else {
      out +=
        " var err = " +
        __err +
        ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
    }
    out += "} ";
    if ($breakOnError) {
      out += " else { ";
    }
    return out;
  };
});

// node_modules/ajv/lib/dotjs/properties.js
var require_properties = __commonJS((exports, module) => {
  module.exports = function generate_properties(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $data = "data" + ($dataLvl || "");
    var $errs = "errs__" + $lvl;
    var $it = it.util.copy(it);
    var $closingBraces = "";
    $it.level++;
    var $nextValid = "valid" + $it.level;
    var $key = "key" + $lvl,
      $idx = "idx" + $lvl,
      $dataNxt = ($it.dataLevel = it.dataLevel + 1),
      $nextData = "data" + $dataNxt,
      $dataProperties = "dataProperties" + $lvl;
    var $schemaKeys = Object.keys($schema || {}).filter(notProto),
      $pProperties = it.schema.patternProperties || {},
      $pPropertyKeys = Object.keys($pProperties).filter(notProto),
      $aProperties = it.schema.additionalProperties,
      $someProperties = $schemaKeys.length || $pPropertyKeys.length,
      $noAdditional = $aProperties === false,
      $additionalIsSchema =
        typeof $aProperties == "object" && Object.keys($aProperties).length,
      $removeAdditional = it.opts.removeAdditional,
      $checkAdditional =
        $noAdditional || $additionalIsSchema || $removeAdditional,
      $ownProperties = it.opts.ownProperties,
      $currentBaseId = it.baseId;
    var $required = it.schema.required;
    if (
      $required &&
      !(it.opts.$data && $required.$data) &&
      $required.length < it.opts.loopRequired
    ) {
      var $requiredHash = it.util.toHash($required);
    }
    function notProto(p) {
      return p !== "__proto__";
    }
    out += "var " + $errs + " = errors;var " + $nextValid + " = true;";
    if ($ownProperties) {
      out += " var " + $dataProperties + " = undefined;";
    }
    if ($checkAdditional) {
      if ($ownProperties) {
        out +=
          " " +
          $dataProperties +
          " = " +
          $dataProperties +
          " || Object.keys(" +
          $data +
          "); for (var " +
          $idx +
          "=0; " +
          $idx +
          "<" +
          $dataProperties +
          ".length; " +
          $idx +
          "++) { var " +
          $key +
          " = " +
          $dataProperties +
          "[" +
          $idx +
          "]; ";
      } else {
        out += " for (var " + $key + " in " + $data + ") { ";
      }
      if ($someProperties) {
        out += " var isAdditional" + $lvl + " = !(false ";
        if ($schemaKeys.length) {
          if ($schemaKeys.length > 8) {
            out +=
              " || validate.schema" +
              $schemaPath +
              ".hasOwnProperty(" +
              $key +
              ") ";
          } else {
            var arr1 = $schemaKeys;
            if (arr1) {
              var $propertyKey,
                i1 = -1,
                l1 = arr1.length - 1;
              while (i1 < l1) {
                $propertyKey = arr1[(i1 += 1)];
                out +=
                  " || " +
                  $key +
                  " == " +
                  it.util.toQuotedString($propertyKey) +
                  " ";
              }
            }
          }
        }
        if ($pPropertyKeys.length) {
          var arr2 = $pPropertyKeys;
          if (arr2) {
            var $pProperty,
              $i = -1,
              l2 = arr2.length - 1;
            while ($i < l2) {
              $pProperty = arr2[($i += 1)];
              out +=
                " || " + it.usePattern($pProperty) + ".test(" + $key + ") ";
            }
          }
        }
        out += " ); if (isAdditional" + $lvl + ") { ";
      }
      if ($removeAdditional == "all") {
        out += " delete " + $data + "[" + $key + "]; ";
      } else {
        var $currentErrorPath = it.errorPath;
        var $additionalProperty = "' + " + $key + " + '";
        if (it.opts._errorDataPathProperty) {
          it.errorPath = it.util.getPathExpr(
            it.errorPath,
            $key,
            it.opts.jsonPointers
          );
        }
        if ($noAdditional) {
          if ($removeAdditional) {
            out += " delete " + $data + "[" + $key + "]; ";
          } else {
            out += " " + $nextValid + " = false; ";
            var $currErrSchemaPath = $errSchemaPath;
            $errSchemaPath = it.errSchemaPath + "/additionalProperties";
            var $$outStack = $$outStack || [];
            $$outStack.push(out);
            out = "";
            if (it.createErrors !== false) {
              out +=
                " { keyword: '" +
                "additionalProperties" +
                "' , dataPath: (dataPath || '') + " +
                it.errorPath +
                " , schemaPath: " +
                it.util.toQuotedString($errSchemaPath) +
                " , params: { additionalProperty: '" +
                $additionalProperty +
                "' } ";
              if (it.opts.messages !== false) {
                out += " , message: '";
                if (it.opts._errorDataPathProperty) {
                  out += "is an invalid additional property";
                } else {
                  out += "should NOT have additional properties";
                }
                out += "' ";
              }
              if (it.opts.verbose) {
                out +=
                  " , schema: false , parentSchema: validate.schema" +
                  it.schemaPath +
                  " , data: " +
                  $data +
                  " ";
              }
              out += " } ";
            } else {
              out += " {} ";
            }
            var __err = out;
            out = $$outStack.pop();
            if (!it.compositeRule && $breakOnError) {
              if (it.async) {
                out += " throw new ValidationError([" + __err + "]); ";
              } else {
                out += " validate.errors = [" + __err + "]; return false; ";
              }
            } else {
              out +=
                " var err = " +
                __err +
                ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
            }
            $errSchemaPath = $currErrSchemaPath;
            if ($breakOnError) {
              out += " break; ";
            }
          }
        } else if ($additionalIsSchema) {
          if ($removeAdditional == "failing") {
            out += " var " + $errs + " = errors;  ";
            var $wasComposite = it.compositeRule;
            it.compositeRule = $it.compositeRule = true;
            $it.schema = $aProperties;
            $it.schemaPath = it.schemaPath + ".additionalProperties";
            $it.errSchemaPath = it.errSchemaPath + "/additionalProperties";
            $it.errorPath = it.opts._errorDataPathProperty
              ? it.errorPath
              : it.util.getPathExpr(it.errorPath, $key, it.opts.jsonPointers);
            var $passData = $data + "[" + $key + "]";
            $it.dataPathArr[$dataNxt] = $key;
            var $code = it.validate($it);
            $it.baseId = $currentBaseId;
            if (it.util.varOccurences($code, $nextData) < 2) {
              out +=
                " " + it.util.varReplace($code, $nextData, $passData) + " ";
            } else {
              out +=
                " var " + $nextData + " = " + $passData + "; " + $code + " ";
            }
            out +=
              " if (!" +
              $nextValid +
              ") { errors = " +
              $errs +
              "; if (validate.errors !== null) { if (errors) validate.errors.length = errors; else validate.errors = null; } delete " +
              $data +
              "[" +
              $key +
              "]; }  ";
            it.compositeRule = $it.compositeRule = $wasComposite;
          } else {
            $it.schema = $aProperties;
            $it.schemaPath = it.schemaPath + ".additionalProperties";
            $it.errSchemaPath = it.errSchemaPath + "/additionalProperties";
            $it.errorPath = it.opts._errorDataPathProperty
              ? it.errorPath
              : it.util.getPathExpr(it.errorPath, $key, it.opts.jsonPointers);
            var $passData = $data + "[" + $key + "]";
            $it.dataPathArr[$dataNxt] = $key;
            var $code = it.validate($it);
            $it.baseId = $currentBaseId;
            if (it.util.varOccurences($code, $nextData) < 2) {
              out +=
                " " + it.util.varReplace($code, $nextData, $passData) + " ";
            } else {
              out +=
                " var " + $nextData + " = " + $passData + "; " + $code + " ";
            }
            if ($breakOnError) {
              out += " if (!" + $nextValid + ") break; ";
            }
          }
        }
        it.errorPath = $currentErrorPath;
      }
      if ($someProperties) {
        out += " } ";
      }
      out += " }  ";
      if ($breakOnError) {
        out += " if (" + $nextValid + ") { ";
        $closingBraces += "}";
      }
    }
    var $useDefaults = it.opts.useDefaults && !it.compositeRule;
    if ($schemaKeys.length) {
      var arr3 = $schemaKeys;
      if (arr3) {
        var $propertyKey,
          i3 = -1,
          l3 = arr3.length - 1;
        while (i3 < l3) {
          $propertyKey = arr3[(i3 += 1)];
          var $sch = $schema[$propertyKey];
          if (
            it.opts.strictKeywords
              ? (typeof $sch == "object" && Object.keys($sch).length > 0) ||
                $sch === false
              : it.util.schemaHasRules($sch, it.RULES.all)
          ) {
            var $prop = it.util.getProperty($propertyKey),
              $passData = $data + $prop,
              $hasDefault = $useDefaults && $sch.default !== undefined;
            $it.schema = $sch;
            $it.schemaPath = $schemaPath + $prop;
            $it.errSchemaPath =
              $errSchemaPath + "/" + it.util.escapeFragment($propertyKey);
            $it.errorPath = it.util.getPath(
              it.errorPath,
              $propertyKey,
              it.opts.jsonPointers
            );
            $it.dataPathArr[$dataNxt] = it.util.toQuotedString($propertyKey);
            var $code = it.validate($it);
            $it.baseId = $currentBaseId;
            if (it.util.varOccurences($code, $nextData) < 2) {
              $code = it.util.varReplace($code, $nextData, $passData);
              var $useData = $passData;
            } else {
              var $useData = $nextData;
              out += " var " + $nextData + " = " + $passData + "; ";
            }
            if ($hasDefault) {
              out += " " + $code + " ";
            } else {
              if ($requiredHash && $requiredHash[$propertyKey]) {
                out += " if ( " + $useData + " === undefined ";
                if ($ownProperties) {
                  out +=
                    " || ! Object.prototype.hasOwnProperty.call(" +
                    $data +
                    ", '" +
                    it.util.escapeQuotes($propertyKey) +
                    "') ";
                }
                out += ") { " + $nextValid + " = false; ";
                var $currentErrorPath = it.errorPath,
                  $currErrSchemaPath = $errSchemaPath,
                  $missingProperty = it.util.escapeQuotes($propertyKey);
                if (it.opts._errorDataPathProperty) {
                  it.errorPath = it.util.getPath(
                    $currentErrorPath,
                    $propertyKey,
                    it.opts.jsonPointers
                  );
                }
                $errSchemaPath = it.errSchemaPath + "/required";
                var $$outStack = $$outStack || [];
                $$outStack.push(out);
                out = "";
                if (it.createErrors !== false) {
                  out +=
                    " { keyword: '" +
                    "required" +
                    "' , dataPath: (dataPath || '') + " +
                    it.errorPath +
                    " , schemaPath: " +
                    it.util.toQuotedString($errSchemaPath) +
                    " , params: { missingProperty: '" +
                    $missingProperty +
                    "' } ";
                  if (it.opts.messages !== false) {
                    out += " , message: '";
                    if (it.opts._errorDataPathProperty) {
                      out += "is a required property";
                    } else {
                      out +=
                        "should have required property \\'" +
                        $missingProperty +
                        "\\'";
                    }
                    out += "' ";
                  }
                  if (it.opts.verbose) {
                    out +=
                      " , schema: validate.schema" +
                      $schemaPath +
                      " , parentSchema: validate.schema" +
                      it.schemaPath +
                      " , data: " +
                      $data +
                      " ";
                  }
                  out += " } ";
                } else {
                  out += " {} ";
                }
                var __err = out;
                out = $$outStack.pop();
                if (!it.compositeRule && $breakOnError) {
                  if (it.async) {
                    out += " throw new ValidationError([" + __err + "]); ";
                  } else {
                    out += " validate.errors = [" + __err + "]; return false; ";
                  }
                } else {
                  out +=
                    " var err = " +
                    __err +
                    ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
                }
                $errSchemaPath = $currErrSchemaPath;
                it.errorPath = $currentErrorPath;
                out += " } else { ";
              } else {
                if ($breakOnError) {
                  out += " if ( " + $useData + " === undefined ";
                  if ($ownProperties) {
                    out +=
                      " || ! Object.prototype.hasOwnProperty.call(" +
                      $data +
                      ", '" +
                      it.util.escapeQuotes($propertyKey) +
                      "') ";
                  }
                  out += ") { " + $nextValid + " = true; } else { ";
                } else {
                  out += " if (" + $useData + " !== undefined ";
                  if ($ownProperties) {
                    out +=
                      " &&   Object.prototype.hasOwnProperty.call(" +
                      $data +
                      ", '" +
                      it.util.escapeQuotes($propertyKey) +
                      "') ";
                  }
                  out += " ) { ";
                }
              }
              out += " " + $code + " } ";
            }
          }
          if ($breakOnError) {
            out += " if (" + $nextValid + ") { ";
            $closingBraces += "}";
          }
        }
      }
    }
    if ($pPropertyKeys.length) {
      var arr4 = $pPropertyKeys;
      if (arr4) {
        var $pProperty,
          i4 = -1,
          l4 = arr4.length - 1;
        while (i4 < l4) {
          $pProperty = arr4[(i4 += 1)];
          var $sch = $pProperties[$pProperty];
          if (
            it.opts.strictKeywords
              ? (typeof $sch == "object" && Object.keys($sch).length > 0) ||
                $sch === false
              : it.util.schemaHasRules($sch, it.RULES.all)
          ) {
            $it.schema = $sch;
            $it.schemaPath =
              it.schemaPath +
              ".patternProperties" +
              it.util.getProperty($pProperty);
            $it.errSchemaPath =
              it.errSchemaPath +
              "/patternProperties/" +
              it.util.escapeFragment($pProperty);
            if ($ownProperties) {
              out +=
                " " +
                $dataProperties +
                " = " +
                $dataProperties +
                " || Object.keys(" +
                $data +
                "); for (var " +
                $idx +
                "=0; " +
                $idx +
                "<" +
                $dataProperties +
                ".length; " +
                $idx +
                "++) { var " +
                $key +
                " = " +
                $dataProperties +
                "[" +
                $idx +
                "]; ";
            } else {
              out += " for (var " + $key + " in " + $data + ") { ";
            }
            out +=
              " if (" + it.usePattern($pProperty) + ".test(" + $key + ")) { ";
            $it.errorPath = it.util.getPathExpr(
              it.errorPath,
              $key,
              it.opts.jsonPointers
            );
            var $passData = $data + "[" + $key + "]";
            $it.dataPathArr[$dataNxt] = $key;
            var $code = it.validate($it);
            $it.baseId = $currentBaseId;
            if (it.util.varOccurences($code, $nextData) < 2) {
              out +=
                " " + it.util.varReplace($code, $nextData, $passData) + " ";
            } else {
              out +=
                " var " + $nextData + " = " + $passData + "; " + $code + " ";
            }
            if ($breakOnError) {
              out += " if (!" + $nextValid + ") break; ";
            }
            out += " } ";
            if ($breakOnError) {
              out += " else " + $nextValid + " = true; ";
            }
            out += " }  ";
            if ($breakOnError) {
              out += " if (" + $nextValid + ") { ";
              $closingBraces += "}";
            }
          }
        }
      }
    }
    if ($breakOnError) {
      out += " " + $closingBraces + " if (" + $errs + " == errors) {";
    }
    return out;
  };
});

// node_modules/ajv/lib/dotjs/propertyNames.js
var require_propertyNames = __commonJS((exports, module) => {
  module.exports = function generate_propertyNames(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $data = "data" + ($dataLvl || "");
    var $errs = "errs__" + $lvl;
    var $it = it.util.copy(it);
    var $closingBraces = "";
    $it.level++;
    var $nextValid = "valid" + $it.level;
    out += "var " + $errs + " = errors;";
    if (
      it.opts.strictKeywords
        ? (typeof $schema == "object" && Object.keys($schema).length > 0) ||
          $schema === false
        : it.util.schemaHasRules($schema, it.RULES.all)
    ) {
      $it.schema = $schema;
      $it.schemaPath = $schemaPath;
      $it.errSchemaPath = $errSchemaPath;
      var $key = "key" + $lvl,
        $idx = "idx" + $lvl,
        $i = "i" + $lvl,
        $invalidName = "' + " + $key + " + '",
        $dataNxt = ($it.dataLevel = it.dataLevel + 1),
        $nextData = "data" + $dataNxt,
        $dataProperties = "dataProperties" + $lvl,
        $ownProperties = it.opts.ownProperties,
        $currentBaseId = it.baseId;
      if ($ownProperties) {
        out += " var " + $dataProperties + " = undefined; ";
      }
      if ($ownProperties) {
        out +=
          " " +
          $dataProperties +
          " = " +
          $dataProperties +
          " || Object.keys(" +
          $data +
          "); for (var " +
          $idx +
          "=0; " +
          $idx +
          "<" +
          $dataProperties +
          ".length; " +
          $idx +
          "++) { var " +
          $key +
          " = " +
          $dataProperties +
          "[" +
          $idx +
          "]; ";
      } else {
        out += " for (var " + $key + " in " + $data + ") { ";
      }
      out += " var startErrs" + $lvl + " = errors; ";
      var $passData = $key;
      var $wasComposite = it.compositeRule;
      it.compositeRule = $it.compositeRule = true;
      var $code = it.validate($it);
      $it.baseId = $currentBaseId;
      if (it.util.varOccurences($code, $nextData) < 2) {
        out += " " + it.util.varReplace($code, $nextData, $passData) + " ";
      } else {
        out += " var " + $nextData + " = " + $passData + "; " + $code + " ";
      }
      it.compositeRule = $it.compositeRule = $wasComposite;
      out +=
        " if (!" +
        $nextValid +
        ") { for (var " +
        $i +
        "=startErrs" +
        $lvl +
        "; " +
        $i +
        "<errors; " +
        $i +
        "++) { vErrors[" +
        $i +
        "].propertyName = " +
        $key +
        "; }   var err =   ";
      if (it.createErrors !== false) {
        out +=
          " { keyword: '" +
          "propertyNames" +
          "' , dataPath: (dataPath || '') + " +
          it.errorPath +
          " , schemaPath: " +
          it.util.toQuotedString($errSchemaPath) +
          " , params: { propertyName: '" +
          $invalidName +
          "' } ";
        if (it.opts.messages !== false) {
          out +=
            " , message: 'property name \\'" +
            $invalidName +
            "\\' is invalid' ";
        }
        if (it.opts.verbose) {
          out +=
            " , schema: validate.schema" +
            $schemaPath +
            " , parentSchema: validate.schema" +
            it.schemaPath +
            " , data: " +
            $data +
            " ";
        }
        out += " } ";
      } else {
        out += " {} ";
      }
      out +=
        ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
      if (!it.compositeRule && $breakOnError) {
        if (it.async) {
          out += " throw new ValidationError(vErrors); ";
        } else {
          out += " validate.errors = vErrors; return false; ";
        }
      }
      if ($breakOnError) {
        out += " break; ";
      }
      out += " } }";
    }
    if ($breakOnError) {
      out += " " + $closingBraces + " if (" + $errs + " == errors) {";
    }
    return out;
  };
});

// node_modules/ajv/lib/dotjs/required.js
var require_required = __commonJS((exports, module) => {
  module.exports = function generate_required(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $data = "data" + ($dataLvl || "");
    var $valid = "valid" + $lvl;
    var $isData = it.opts.$data && $schema && $schema.$data,
      $schemaValue;
    if ($isData) {
      out +=
        " var schema" +
        $lvl +
        " = " +
        it.util.getData($schema.$data, $dataLvl, it.dataPathArr) +
        "; ";
      $schemaValue = "schema" + $lvl;
    } else {
      $schemaValue = $schema;
    }
    var $vSchema = "schema" + $lvl;
    if (!$isData) {
      if (
        $schema.length < it.opts.loopRequired &&
        it.schema.properties &&
        Object.keys(it.schema.properties).length
      ) {
        var $required = [];
        var arr1 = $schema;
        if (arr1) {
          var $property,
            i1 = -1,
            l1 = arr1.length - 1;
          while (i1 < l1) {
            $property = arr1[(i1 += 1)];
            var $propertySch = it.schema.properties[$property];
            if (
              !(
                $propertySch &&
                (it.opts.strictKeywords
                  ? (typeof $propertySch == "object" &&
                      Object.keys($propertySch).length > 0) ||
                    $propertySch === false
                  : it.util.schemaHasRules($propertySch, it.RULES.all))
              )
            ) {
              $required[$required.length] = $property;
            }
          }
        }
      } else {
        var $required = $schema;
      }
    }
    if ($isData || $required.length) {
      var $currentErrorPath = it.errorPath,
        $loopRequired = $isData || $required.length >= it.opts.loopRequired,
        $ownProperties = it.opts.ownProperties;
      if ($breakOnError) {
        out += " var missing" + $lvl + "; ";
        if ($loopRequired) {
          if (!$isData) {
            out +=
              " var " + $vSchema + " = validate.schema" + $schemaPath + "; ";
          }
          var $i = "i" + $lvl,
            $propertyPath = "schema" + $lvl + "[" + $i + "]",
            $missingProperty = "' + " + $propertyPath + " + '";
          if (it.opts._errorDataPathProperty) {
            it.errorPath = it.util.getPathExpr(
              $currentErrorPath,
              $propertyPath,
              it.opts.jsonPointers
            );
          }
          out += " var " + $valid + " = true; ";
          if ($isData) {
            out +=
              " if (schema" +
              $lvl +
              " === undefined) " +
              $valid +
              " = true; else if (!Array.isArray(schema" +
              $lvl +
              ")) " +
              $valid +
              " = false; else {";
          }
          out +=
            " for (var " +
            $i +
            " = 0; " +
            $i +
            " < " +
            $vSchema +
            ".length; " +
            $i +
            "++) { " +
            $valid +
            " = " +
            $data +
            "[" +
            $vSchema +
            "[" +
            $i +
            "]] !== undefined ";
          if ($ownProperties) {
            out +=
              " &&   Object.prototype.hasOwnProperty.call(" +
              $data +
              ", " +
              $vSchema +
              "[" +
              $i +
              "]) ";
          }
          out += "; if (!" + $valid + ") break; } ";
          if ($isData) {
            out += "  }  ";
          }
          out += "  if (!" + $valid + ") {   ";
          var $$outStack = $$outStack || [];
          $$outStack.push(out);
          out = "";
          if (it.createErrors !== false) {
            out +=
              " { keyword: '" +
              "required" +
              "' , dataPath: (dataPath || '') + " +
              it.errorPath +
              " , schemaPath: " +
              it.util.toQuotedString($errSchemaPath) +
              " , params: { missingProperty: '" +
              $missingProperty +
              "' } ";
            if (it.opts.messages !== false) {
              out += " , message: '";
              if (it.opts._errorDataPathProperty) {
                out += "is a required property";
              } else {
                out +=
                  "should have required property \\'" +
                  $missingProperty +
                  "\\'";
              }
              out += "' ";
            }
            if (it.opts.verbose) {
              out +=
                " , schema: validate.schema" +
                $schemaPath +
                " , parentSchema: validate.schema" +
                it.schemaPath +
                " , data: " +
                $data +
                " ";
            }
            out += " } ";
          } else {
            out += " {} ";
          }
          var __err = out;
          out = $$outStack.pop();
          if (!it.compositeRule && $breakOnError) {
            if (it.async) {
              out += " throw new ValidationError([" + __err + "]); ";
            } else {
              out += " validate.errors = [" + __err + "]; return false; ";
            }
          } else {
            out +=
              " var err = " +
              __err +
              ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
          }
          out += " } else { ";
        } else {
          out += " if ( ";
          var arr2 = $required;
          if (arr2) {
            var $propertyKey,
              $i = -1,
              l2 = arr2.length - 1;
            while ($i < l2) {
              $propertyKey = arr2[($i += 1)];
              if ($i) {
                out += " || ";
              }
              var $prop = it.util.getProperty($propertyKey),
                $useData = $data + $prop;
              out += " ( ( " + $useData + " === undefined ";
              if ($ownProperties) {
                out +=
                  " || ! Object.prototype.hasOwnProperty.call(" +
                  $data +
                  ", '" +
                  it.util.escapeQuotes($propertyKey) +
                  "') ";
              }
              out +=
                ") && (missing" +
                $lvl +
                " = " +
                it.util.toQuotedString(
                  it.opts.jsonPointers ? $propertyKey : $prop
                ) +
                ") ) ";
            }
          }
          out += ") {  ";
          var $propertyPath = "missing" + $lvl,
            $missingProperty = "' + " + $propertyPath + " + '";
          if (it.opts._errorDataPathProperty) {
            it.errorPath = it.opts.jsonPointers
              ? it.util.getPathExpr($currentErrorPath, $propertyPath, true)
              : $currentErrorPath + " + " + $propertyPath;
          }
          var $$outStack = $$outStack || [];
          $$outStack.push(out);
          out = "";
          if (it.createErrors !== false) {
            out +=
              " { keyword: '" +
              "required" +
              "' , dataPath: (dataPath || '') + " +
              it.errorPath +
              " , schemaPath: " +
              it.util.toQuotedString($errSchemaPath) +
              " , params: { missingProperty: '" +
              $missingProperty +
              "' } ";
            if (it.opts.messages !== false) {
              out += " , message: '";
              if (it.opts._errorDataPathProperty) {
                out += "is a required property";
              } else {
                out +=
                  "should have required property \\'" +
                  $missingProperty +
                  "\\'";
              }
              out += "' ";
            }
            if (it.opts.verbose) {
              out +=
                " , schema: validate.schema" +
                $schemaPath +
                " , parentSchema: validate.schema" +
                it.schemaPath +
                " , data: " +
                $data +
                " ";
            }
            out += " } ";
          } else {
            out += " {} ";
          }
          var __err = out;
          out = $$outStack.pop();
          if (!it.compositeRule && $breakOnError) {
            if (it.async) {
              out += " throw new ValidationError([" + __err + "]); ";
            } else {
              out += " validate.errors = [" + __err + "]; return false; ";
            }
          } else {
            out +=
              " var err = " +
              __err +
              ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
          }
          out += " } else { ";
        }
      } else {
        if ($loopRequired) {
          if (!$isData) {
            out +=
              " var " + $vSchema + " = validate.schema" + $schemaPath + "; ";
          }
          var $i = "i" + $lvl,
            $propertyPath = "schema" + $lvl + "[" + $i + "]",
            $missingProperty = "' + " + $propertyPath + " + '";
          if (it.opts._errorDataPathProperty) {
            it.errorPath = it.util.getPathExpr(
              $currentErrorPath,
              $propertyPath,
              it.opts.jsonPointers
            );
          }
          if ($isData) {
            out +=
              " if (" +
              $vSchema +
              " && !Array.isArray(" +
              $vSchema +
              ")) {  var err =   ";
            if (it.createErrors !== false) {
              out +=
                " { keyword: '" +
                "required" +
                "' , dataPath: (dataPath || '') + " +
                it.errorPath +
                " , schemaPath: " +
                it.util.toQuotedString($errSchemaPath) +
                " , params: { missingProperty: '" +
                $missingProperty +
                "' } ";
              if (it.opts.messages !== false) {
                out += " , message: '";
                if (it.opts._errorDataPathProperty) {
                  out += "is a required property";
                } else {
                  out +=
                    "should have required property \\'" +
                    $missingProperty +
                    "\\'";
                }
                out += "' ";
              }
              if (it.opts.verbose) {
                out +=
                  " , schema: validate.schema" +
                  $schemaPath +
                  " , parentSchema: validate.schema" +
                  it.schemaPath +
                  " , data: " +
                  $data +
                  " ";
              }
              out += " } ";
            } else {
              out += " {} ";
            }
            out +=
              ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; } else if (" +
              $vSchema +
              " !== undefined) { ";
          }
          out +=
            " for (var " +
            $i +
            " = 0; " +
            $i +
            " < " +
            $vSchema +
            ".length; " +
            $i +
            "++) { if (" +
            $data +
            "[" +
            $vSchema +
            "[" +
            $i +
            "]] === undefined ";
          if ($ownProperties) {
            out +=
              " || ! Object.prototype.hasOwnProperty.call(" +
              $data +
              ", " +
              $vSchema +
              "[" +
              $i +
              "]) ";
          }
          out += ") {  var err =   ";
          if (it.createErrors !== false) {
            out +=
              " { keyword: '" +
              "required" +
              "' , dataPath: (dataPath || '') + " +
              it.errorPath +
              " , schemaPath: " +
              it.util.toQuotedString($errSchemaPath) +
              " , params: { missingProperty: '" +
              $missingProperty +
              "' } ";
            if (it.opts.messages !== false) {
              out += " , message: '";
              if (it.opts._errorDataPathProperty) {
                out += "is a required property";
              } else {
                out +=
                  "should have required property \\'" +
                  $missingProperty +
                  "\\'";
              }
              out += "' ";
            }
            if (it.opts.verbose) {
              out +=
                " , schema: validate.schema" +
                $schemaPath +
                " , parentSchema: validate.schema" +
                it.schemaPath +
                " , data: " +
                $data +
                " ";
            }
            out += " } ";
          } else {
            out += " {} ";
          }
          out +=
            ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; } } ";
          if ($isData) {
            out += "  }  ";
          }
        } else {
          var arr3 = $required;
          if (arr3) {
            var $propertyKey,
              i3 = -1,
              l3 = arr3.length - 1;
            while (i3 < l3) {
              $propertyKey = arr3[(i3 += 1)];
              var $prop = it.util.getProperty($propertyKey),
                $missingProperty = it.util.escapeQuotes($propertyKey),
                $useData = $data + $prop;
              if (it.opts._errorDataPathProperty) {
                it.errorPath = it.util.getPath(
                  $currentErrorPath,
                  $propertyKey,
                  it.opts.jsonPointers
                );
              }
              out += " if ( " + $useData + " === undefined ";
              if ($ownProperties) {
                out +=
                  " || ! Object.prototype.hasOwnProperty.call(" +
                  $data +
                  ", '" +
                  it.util.escapeQuotes($propertyKey) +
                  "') ";
              }
              out += ") {  var err =   ";
              if (it.createErrors !== false) {
                out +=
                  " { keyword: '" +
                  "required" +
                  "' , dataPath: (dataPath || '') + " +
                  it.errorPath +
                  " , schemaPath: " +
                  it.util.toQuotedString($errSchemaPath) +
                  " , params: { missingProperty: '" +
                  $missingProperty +
                  "' } ";
                if (it.opts.messages !== false) {
                  out += " , message: '";
                  if (it.opts._errorDataPathProperty) {
                    out += "is a required property";
                  } else {
                    out +=
                      "should have required property \\'" +
                      $missingProperty +
                      "\\'";
                  }
                  out += "' ";
                }
                if (it.opts.verbose) {
                  out +=
                    " , schema: validate.schema" +
                    $schemaPath +
                    " , parentSchema: validate.schema" +
                    it.schemaPath +
                    " , data: " +
                    $data +
                    " ";
                }
                out += " } ";
              } else {
                out += " {} ";
              }
              out +=
                ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; } ";
            }
          }
        }
      }
      it.errorPath = $currentErrorPath;
    } else if ($breakOnError) {
      out += " if (true) {";
    }
    return out;
  };
});

// node_modules/ajv/lib/dotjs/uniqueItems.js
var require_uniqueItems = __commonJS((exports, module) => {
  module.exports = function generate_uniqueItems(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $data = "data" + ($dataLvl || "");
    var $valid = "valid" + $lvl;
    var $isData = it.opts.$data && $schema && $schema.$data,
      $schemaValue;
    if ($isData) {
      out +=
        " var schema" +
        $lvl +
        " = " +
        it.util.getData($schema.$data, $dataLvl, it.dataPathArr) +
        "; ";
      $schemaValue = "schema" + $lvl;
    } else {
      $schemaValue = $schema;
    }
    if (($schema || $isData) && it.opts.uniqueItems !== false) {
      if ($isData) {
        out +=
          " var " +
          $valid +
          "; if (" +
          $schemaValue +
          " === false || " +
          $schemaValue +
          " === undefined) " +
          $valid +
          " = true; else if (typeof " +
          $schemaValue +
          " != 'boolean') " +
          $valid +
          " = false; else { ";
      }
      out +=
        " var i = " +
        $data +
        ".length , " +
        $valid +
        " = true , j; if (i > 1) { ";
      var $itemType = it.schema.items && it.schema.items.type,
        $typeIsArray = Array.isArray($itemType);
      if (
        !$itemType ||
        $itemType == "object" ||
        $itemType == "array" ||
        ($typeIsArray &&
          ($itemType.indexOf("object") >= 0 || $itemType.indexOf("array") >= 0))
      ) {
        out +=
          " outer: for (;i--;) { for (j = i; j--;) { if (equal(" +
          $data +
          "[i], " +
          $data +
          "[j])) { " +
          $valid +
          " = false; break outer; } } } ";
      } else {
        out +=
          " var itemIndices = {}, item; for (;i--;) { var item = " +
          $data +
          "[i]; ";
        var $method = "checkDataType" + ($typeIsArray ? "s" : "");
        out +=
          " if (" +
          it.util[$method]($itemType, "item", it.opts.strictNumbers, true) +
          ") continue; ";
        if ($typeIsArray) {
          out += ` if (typeof item == 'string') item = '"' + item; `;
        }
        out +=
          " if (typeof itemIndices[item] == 'number') { " +
          $valid +
          " = false; j = itemIndices[item]; break; } itemIndices[item] = i; } ";
      }
      out += " } ";
      if ($isData) {
        out += "  }  ";
      }
      out += " if (!" + $valid + ") {   ";
      var $$outStack = $$outStack || [];
      $$outStack.push(out);
      out = "";
      if (it.createErrors !== false) {
        out +=
          " { keyword: '" +
          "uniqueItems" +
          "' , dataPath: (dataPath || '') + " +
          it.errorPath +
          " , schemaPath: " +
          it.util.toQuotedString($errSchemaPath) +
          " , params: { i: i, j: j } ";
        if (it.opts.messages !== false) {
          out +=
            " , message: 'should NOT have duplicate items (items ## ' + j + ' and ' + i + ' are identical)' ";
        }
        if (it.opts.verbose) {
          out += " , schema:  ";
          if ($isData) {
            out += "validate.schema" + $schemaPath;
          } else {
            out += "" + $schema;
          }
          out +=
            "         , parentSchema: validate.schema" +
            it.schemaPath +
            " , data: " +
            $data +
            " ";
        }
        out += " } ";
      } else {
        out += " {} ";
      }
      var __err = out;
      out = $$outStack.pop();
      if (!it.compositeRule && $breakOnError) {
        if (it.async) {
          out += " throw new ValidationError([" + __err + "]); ";
        } else {
          out += " validate.errors = [" + __err + "]; return false; ";
        }
      } else {
        out +=
          " var err = " +
          __err +
          ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
      }
      out += " } ";
      if ($breakOnError) {
        out += " else { ";
      }
    } else {
      if ($breakOnError) {
        out += " if (true) { ";
      }
    }
    return out;
  };
});

// node_modules/ajv/lib/dotjs/index.js
var require_dotjs = __commonJS((exports, module) => {
  module.exports = {
    $ref: require_ref(),
    allOf: require_allOf(),
    anyOf: require_anyOf(),
    $comment: require_comment(),
    const: require_const(),
    contains: require_contains(),
    dependencies: require_dependencies(),
    enum: require_enum(),
    format: require_format(),
    if: require_if(),
    items: require_items(),
    maximum: require__limit(),
    minimum: require__limit(),
    maxItems: require__limitItems(),
    minItems: require__limitItems(),
    maxLength: require__limitLength(),
    minLength: require__limitLength(),
    maxProperties: require__limitProperties(),
    minProperties: require__limitProperties(),
    multipleOf: require_multipleOf(),
    not: require_not(),
    oneOf: require_oneOf(),
    pattern: require_pattern(),
    properties: require_properties(),
    propertyNames: require_propertyNames(),
    required: require_required(),
    uniqueItems: require_uniqueItems(),
    validate: require_validate()
  };
});

// node_modules/ajv/lib/compile/rules.js
var require_rules = __commonJS((exports, module) => {
  var ruleModules = require_dotjs();
  var toHash = require_util().toHash;
  module.exports = function rules() {
    var RULES = [
      {
        type: "number",
        rules: [
          { maximum: ["exclusiveMaximum"] },
          { minimum: ["exclusiveMinimum"] },
          "multipleOf",
          "format"
        ]
      },
      {
        type: "string",
        rules: ["maxLength", "minLength", "pattern", "format"]
      },
      {
        type: "array",
        rules: ["maxItems", "minItems", "items", "contains", "uniqueItems"]
      },
      {
        type: "object",
        rules: [
          "maxProperties",
          "minProperties",
          "required",
          "dependencies",
          "propertyNames",
          { properties: ["additionalProperties", "patternProperties"] }
        ]
      },
      {
        rules: ["$ref", "const", "enum", "not", "anyOf", "oneOf", "allOf", "if"]
      }
    ];
    var ALL = ["type", "$comment"];
    var KEYWORDS = [
      "$schema",
      "$id",
      "id",
      "$data",
      "$async",
      "title",
      "description",
      "default",
      "definitions",
      "examples",
      "readOnly",
      "writeOnly",
      "contentMediaType",
      "contentEncoding",
      "additionalItems",
      "then",
      "else"
    ];
    var TYPES = [
      "number",
      "integer",
      "string",
      "array",
      "object",
      "boolean",
      "null"
    ];
    RULES.all = toHash(ALL);
    RULES.types = toHash(TYPES);
    RULES.forEach(function (group) {
      group.rules = group.rules.map(function (keyword) {
        var implKeywords;
        if (typeof keyword == "object") {
          var key = Object.keys(keyword)[0];
          implKeywords = keyword[key];
          keyword = key;
          implKeywords.forEach(function (k) {
            ALL.push(k);
            RULES.all[k] = true;
          });
        }
        ALL.push(keyword);
        var rule = (RULES.all[keyword] = {
          keyword,
          code: ruleModules[keyword],
          implements: implKeywords
        });
        return rule;
      });
      RULES.all.$comment = {
        keyword: "$comment",
        code: ruleModules.$comment
      };
      if (group.type) RULES.types[group.type] = group;
    });
    RULES.keywords = toHash(ALL.concat(KEYWORDS));
    RULES.custom = {};
    return RULES;
  };
});

// node_modules/ajv/lib/data.js
var require_data = __commonJS((exports, module) => {
  var KEYWORDS = [
    "multipleOf",
    "maximum",
    "exclusiveMaximum",
    "minimum",
    "exclusiveMinimum",
    "maxLength",
    "minLength",
    "pattern",
    "additionalItems",
    "maxItems",
    "minItems",
    "uniqueItems",
    "maxProperties",
    "minProperties",
    "required",
    "additionalProperties",
    "enum",
    "format",
    "const"
  ];
  module.exports = function (metaSchema, keywordsJsonPointers) {
    for (var i = 0; i < keywordsJsonPointers.length; i++) {
      metaSchema = JSON.parse(JSON.stringify(metaSchema));
      var segments = keywordsJsonPointers[i].split("/");
      var keywords = metaSchema;
      var j;
      for (j = 1; j < segments.length; j++) keywords = keywords[segments[j]];
      for (j = 0; j < KEYWORDS.length; j++) {
        var key = KEYWORDS[j];
        var schema = keywords[key];
        if (schema) {
          keywords[key] = {
            anyOf: [
              schema,
              {
                $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
              }
            ]
          };
        }
      }
    }
    return metaSchema;
  };
});

// node_modules/ajv/lib/compile/async.js
var require_async = __commonJS((exports, module) => {
  var MissingRefError = require_error_classes().MissingRef;
  module.exports = compileAsync;
  function compileAsync(schema, meta, callback) {
    var self = this;
    if (typeof this._opts.loadSchema != "function")
      throw new Error("options.loadSchema should be a function");
    if (typeof meta == "function") {
      callback = meta;
      meta = undefined;
    }
    var p = loadMetaSchemaOf(schema).then(function () {
      var schemaObj = self._addSchema(schema, undefined, meta);
      return schemaObj.validate || _compileAsync(schemaObj);
    });
    if (callback) {
      p.then(function (v) {
        callback(null, v);
      }, callback);
    }
    return p;
    function loadMetaSchemaOf(sch) {
      var $schema = sch.$schema;
      return $schema && !self.getSchema($schema)
        ? compileAsync.call(self, { $ref: $schema }, true)
        : Promise.resolve();
    }
    function _compileAsync(schemaObj) {
      try {
        return self._compile(schemaObj);
      } catch (e) {
        if (e instanceof MissingRefError) return loadMissingSchema(e);
        throw e;
      }
      function loadMissingSchema(e) {
        var ref = e.missingSchema;
        if (added(ref))
          throw new Error(
            "Schema " +
              ref +
              " is loaded but " +
              e.missingRef +
              " cannot be resolved"
          );
        var schemaPromise = self._loadingSchemas[ref];
        if (!schemaPromise) {
          schemaPromise = self._loadingSchemas[ref] =
            self._opts.loadSchema(ref);
          schemaPromise.then(removePromise, removePromise);
        }
        return schemaPromise
          .then(function (sch) {
            if (!added(ref)) {
              return loadMetaSchemaOf(sch).then(function () {
                if (!added(ref)) self.addSchema(sch, ref, undefined, meta);
              });
            }
          })
          .then(function () {
            return _compileAsync(schemaObj);
          });
        function removePromise() {
          delete self._loadingSchemas[ref];
        }
        function added(ref2) {
          return self._refs[ref2] || self._schemas[ref2];
        }
      }
    }
  }
});

// node_modules/ajv/lib/dotjs/custom.js
var require_custom = __commonJS((exports, module) => {
  module.exports = function generate_custom(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $errorKeyword;
    var $data = "data" + ($dataLvl || "");
    var $valid = "valid" + $lvl;
    var $errs = "errs__" + $lvl;
    var $isData = it.opts.$data && $schema && $schema.$data,
      $schemaValue;
    if ($isData) {
      out +=
        " var schema" +
        $lvl +
        " = " +
        it.util.getData($schema.$data, $dataLvl, it.dataPathArr) +
        "; ";
      $schemaValue = "schema" + $lvl;
    } else {
      $schemaValue = $schema;
    }
    var $rule = this,
      $definition = "definition" + $lvl,
      $rDef = $rule.definition,
      $closingBraces = "";
    var $compile, $inline, $macro, $ruleValidate, $validateCode;
    if ($isData && $rDef.$data) {
      $validateCode = "keywordValidate" + $lvl;
      var $validateSchema = $rDef.validateSchema;
      out +=
        " var " +
        $definition +
        " = RULES.custom['" +
        $keyword +
        "'].definition; var " +
        $validateCode +
        " = " +
        $definition +
        ".validate;";
    } else {
      $ruleValidate = it.useCustomRule($rule, $schema, it.schema, it);
      if (!$ruleValidate) return;
      $schemaValue = "validate.schema" + $schemaPath;
      $validateCode = $ruleValidate.code;
      $compile = $rDef.compile;
      $inline = $rDef.inline;
      $macro = $rDef.macro;
    }
    var $ruleErrs = $validateCode + ".errors",
      $i = "i" + $lvl,
      $ruleErr = "ruleErr" + $lvl,
      $asyncKeyword = $rDef.async;
    if ($asyncKeyword && !it.async)
      throw new Error("async keyword in sync schema");
    if (!($inline || $macro)) {
      out += "" + $ruleErrs + " = null;";
    }
    out += "var " + $errs + " = errors;var " + $valid + ";";
    if ($isData && $rDef.$data) {
      $closingBraces += "}";
      out +=
        " if (" +
        $schemaValue +
        " === undefined) { " +
        $valid +
        " = true; } else { ";
      if ($validateSchema) {
        $closingBraces += "}";
        out +=
          " " +
          $valid +
          " = " +
          $definition +
          ".validateSchema(" +
          $schemaValue +
          "); if (" +
          $valid +
          ") { ";
      }
    }
    if ($inline) {
      if ($rDef.statements) {
        out += " " + $ruleValidate.validate + " ";
      } else {
        out += " " + $valid + " = " + $ruleValidate.validate + "; ";
      }
    } else if ($macro) {
      var $it = it.util.copy(it);
      var $closingBraces = "";
      $it.level++;
      var $nextValid = "valid" + $it.level;
      $it.schema = $ruleValidate.validate;
      $it.schemaPath = "";
      var $wasComposite = it.compositeRule;
      it.compositeRule = $it.compositeRule = true;
      var $code = it.validate($it).replace(/validate\.schema/g, $validateCode);
      it.compositeRule = $it.compositeRule = $wasComposite;
      out += " " + $code;
    } else {
      var $$outStack = $$outStack || [];
      $$outStack.push(out);
      out = "";
      out += "  " + $validateCode + ".call( ";
      if (it.opts.passContext) {
        out += "this";
      } else {
        out += "self";
      }
      if ($compile || $rDef.schema === false) {
        out += " , " + $data + " ";
      } else {
        out +=
          " , " +
          $schemaValue +
          " , " +
          $data +
          " , validate.schema" +
          it.schemaPath +
          " ";
      }
      out += " , (dataPath || '')";
      if (it.errorPath != '""') {
        out += " + " + it.errorPath;
      }
      var $parentData = $dataLvl ? "data" + ($dataLvl - 1 || "") : "parentData",
        $parentDataProperty = $dataLvl
          ? it.dataPathArr[$dataLvl]
          : "parentDataProperty";
      out +=
        " , " + $parentData + " , " + $parentDataProperty + " , rootData )  ";
      var def_callRuleValidate = out;
      out = $$outStack.pop();
      if ($rDef.errors === false) {
        out += " " + $valid + " = ";
        if ($asyncKeyword) {
          out += "await ";
        }
        out += "" + def_callRuleValidate + "; ";
      } else {
        if ($asyncKeyword) {
          $ruleErrs = "customErrors" + $lvl;
          out +=
            " var " +
            $ruleErrs +
            " = null; try { " +
            $valid +
            " = await " +
            def_callRuleValidate +
            "; } catch (e) { " +
            $valid +
            " = false; if (e instanceof ValidationError) " +
            $ruleErrs +
            " = e.errors; else throw e; } ";
        } else {
          out +=
            " " +
            $ruleErrs +
            " = null; " +
            $valid +
            " = " +
            def_callRuleValidate +
            "; ";
        }
      }
    }
    if ($rDef.modifying) {
      out +=
        " if (" +
        $parentData +
        ") " +
        $data +
        " = " +
        $parentData +
        "[" +
        $parentDataProperty +
        "];";
    }
    out += "" + $closingBraces;
    if ($rDef.valid) {
      if ($breakOnError) {
        out += " if (true) { ";
      }
    } else {
      out += " if ( ";
      if ($rDef.valid === undefined) {
        out += " !";
        if ($macro) {
          out += "" + $nextValid;
        } else {
          out += "" + $valid;
        }
      } else {
        out += " " + !$rDef.valid + " ";
      }
      out += ") { ";
      $errorKeyword = $rule.keyword;
      var $$outStack = $$outStack || [];
      $$outStack.push(out);
      out = "";
      var $$outStack = $$outStack || [];
      $$outStack.push(out);
      out = "";
      if (it.createErrors !== false) {
        out +=
          " { keyword: '" +
          ($errorKeyword || "custom") +
          "' , dataPath: (dataPath || '') + " +
          it.errorPath +
          " , schemaPath: " +
          it.util.toQuotedString($errSchemaPath) +
          " , params: { keyword: '" +
          $rule.keyword +
          "' } ";
        if (it.opts.messages !== false) {
          out +=
            ` , message: 'should pass "` +
            $rule.keyword +
            `" keyword validation' `;
        }
        if (it.opts.verbose) {
          out +=
            " , schema: validate.schema" +
            $schemaPath +
            " , parentSchema: validate.schema" +
            it.schemaPath +
            " , data: " +
            $data +
            " ";
        }
        out += " } ";
      } else {
        out += " {} ";
      }
      var __err = out;
      out = $$outStack.pop();
      if (!it.compositeRule && $breakOnError) {
        if (it.async) {
          out += " throw new ValidationError([" + __err + "]); ";
        } else {
          out += " validate.errors = [" + __err + "]; return false; ";
        }
      } else {
        out +=
          " var err = " +
          __err +
          ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
      }
      var def_customError = out;
      out = $$outStack.pop();
      if ($inline) {
        if ($rDef.errors) {
          if ($rDef.errors != "full") {
            out +=
              "  for (var " +
              $i +
              "=" +
              $errs +
              "; " +
              $i +
              "<errors; " +
              $i +
              "++) { var " +
              $ruleErr +
              " = vErrors[" +
              $i +
              "]; if (" +
              $ruleErr +
              ".dataPath === undefined) " +
              $ruleErr +
              ".dataPath = (dataPath || '') + " +
              it.errorPath +
              "; if (" +
              $ruleErr +
              ".schemaPath === undefined) { " +
              $ruleErr +
              '.schemaPath = "' +
              $errSchemaPath +
              '"; } ';
            if (it.opts.verbose) {
              out +=
                " " +
                $ruleErr +
                ".schema = " +
                $schemaValue +
                "; " +
                $ruleErr +
                ".data = " +
                $data +
                "; ";
            }
            out += " } ";
          }
        } else {
          if ($rDef.errors === false) {
            out += " " + def_customError + " ";
          } else {
            out +=
              " if (" +
              $errs +
              " == errors) { " +
              def_customError +
              " } else {  for (var " +
              $i +
              "=" +
              $errs +
              "; " +
              $i +
              "<errors; " +
              $i +
              "++) { var " +
              $ruleErr +
              " = vErrors[" +
              $i +
              "]; if (" +
              $ruleErr +
              ".dataPath === undefined) " +
              $ruleErr +
              ".dataPath = (dataPath || '') + " +
              it.errorPath +
              "; if (" +
              $ruleErr +
              ".schemaPath === undefined) { " +
              $ruleErr +
              '.schemaPath = "' +
              $errSchemaPath +
              '"; } ';
            if (it.opts.verbose) {
              out +=
                " " +
                $ruleErr +
                ".schema = " +
                $schemaValue +
                "; " +
                $ruleErr +
                ".data = " +
                $data +
                "; ";
            }
            out += " } } ";
          }
        }
      } else if ($macro) {
        out += "   var err =   ";
        if (it.createErrors !== false) {
          out +=
            " { keyword: '" +
            ($errorKeyword || "custom") +
            "' , dataPath: (dataPath || '') + " +
            it.errorPath +
            " , schemaPath: " +
            it.util.toQuotedString($errSchemaPath) +
            " , params: { keyword: '" +
            $rule.keyword +
            "' } ";
          if (it.opts.messages !== false) {
            out +=
              ` , message: 'should pass "` +
              $rule.keyword +
              `" keyword validation' `;
          }
          if (it.opts.verbose) {
            out +=
              " , schema: validate.schema" +
              $schemaPath +
              " , parentSchema: validate.schema" +
              it.schemaPath +
              " , data: " +
              $data +
              " ";
          }
          out += " } ";
        } else {
          out += " {} ";
        }
        out +=
          ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
        if (!it.compositeRule && $breakOnError) {
          if (it.async) {
            out += " throw new ValidationError(vErrors); ";
          } else {
            out += " validate.errors = vErrors; return false; ";
          }
        }
      } else {
        if ($rDef.errors === false) {
          out += " " + def_customError + " ";
        } else {
          out +=
            " if (Array.isArray(" +
            $ruleErrs +
            ")) { if (vErrors === null) vErrors = " +
            $ruleErrs +
            "; else vErrors = vErrors.concat(" +
            $ruleErrs +
            "); errors = vErrors.length;  for (var " +
            $i +
            "=" +
            $errs +
            "; " +
            $i +
            "<errors; " +
            $i +
            "++) { var " +
            $ruleErr +
            " = vErrors[" +
            $i +
            "]; if (" +
            $ruleErr +
            ".dataPath === undefined) " +
            $ruleErr +
            ".dataPath = (dataPath || '') + " +
            it.errorPath +
            ";  " +
            $ruleErr +
            '.schemaPath = "' +
            $errSchemaPath +
            '";  ';
          if (it.opts.verbose) {
            out +=
              " " +
              $ruleErr +
              ".schema = " +
              $schemaValue +
              "; " +
              $ruleErr +
              ".data = " +
              $data +
              "; ";
          }
          out += " } } else { " + def_customError + " } ";
        }
      }
      out += " } ";
      if ($breakOnError) {
        out += " else { ";
      }
    }
    return out;
  };
});

// node_modules/ajv/lib/refs/json-schema-draft-07.json
var require_json_schema_draft_07 = __commonJS((exports, module) => {
  module.exports = {
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: "http://json-schema.org/draft-07/schema#",
    title: "Core schema meta-schema",
    definitions: {
      schemaArray: {
        type: "array",
        minItems: 1,
        items: { $ref: "#" }
      },
      nonNegativeInteger: {
        type: "integer",
        minimum: 0
      },
      nonNegativeIntegerDefault0: {
        allOf: [{ $ref: "#/definitions/nonNegativeInteger" }, { default: 0 }]
      },
      simpleTypes: {
        enum: [
          "array",
          "boolean",
          "integer",
          "null",
          "number",
          "object",
          "string"
        ]
      },
      stringArray: {
        type: "array",
        items: { type: "string" },
        uniqueItems: true,
        default: []
      }
    },
    type: ["object", "boolean"],
    properties: {
      $id: {
        type: "string",
        format: "uri-reference"
      },
      $schema: {
        type: "string",
        format: "uri"
      },
      $ref: {
        type: "string",
        format: "uri-reference"
      },
      $comment: {
        type: "string"
      },
      title: {
        type: "string"
      },
      description: {
        type: "string"
      },
      default: true,
      readOnly: {
        type: "boolean",
        default: false
      },
      examples: {
        type: "array",
        items: true
      },
      multipleOf: {
        type: "number",
        exclusiveMinimum: 0
      },
      maximum: {
        type: "number"
      },
      exclusiveMaximum: {
        type: "number"
      },
      minimum: {
        type: "number"
      },
      exclusiveMinimum: {
        type: "number"
      },
      maxLength: { $ref: "#/definitions/nonNegativeInteger" },
      minLength: { $ref: "#/definitions/nonNegativeIntegerDefault0" },
      pattern: {
        type: "string",
        format: "regex"
      },
      additionalItems: { $ref: "#" },
      items: {
        anyOf: [{ $ref: "#" }, { $ref: "#/definitions/schemaArray" }],
        default: true
      },
      maxItems: { $ref: "#/definitions/nonNegativeInteger" },
      minItems: { $ref: "#/definitions/nonNegativeIntegerDefault0" },
      uniqueItems: {
        type: "boolean",
        default: false
      },
      contains: { $ref: "#" },
      maxProperties: { $ref: "#/definitions/nonNegativeInteger" },
      minProperties: { $ref: "#/definitions/nonNegativeIntegerDefault0" },
      required: { $ref: "#/definitions/stringArray" },
      additionalProperties: { $ref: "#" },
      definitions: {
        type: "object",
        additionalProperties: { $ref: "#" },
        default: {}
      },
      properties: {
        type: "object",
        additionalProperties: { $ref: "#" },
        default: {}
      },
      patternProperties: {
        type: "object",
        additionalProperties: { $ref: "#" },
        propertyNames: { format: "regex" },
        default: {}
      },
      dependencies: {
        type: "object",
        additionalProperties: {
          anyOf: [{ $ref: "#" }, { $ref: "#/definitions/stringArray" }]
        }
      },
      propertyNames: { $ref: "#" },
      const: true,
      enum: {
        type: "array",
        items: true,
        minItems: 1,
        uniqueItems: true
      },
      type: {
        anyOf: [
          { $ref: "#/definitions/simpleTypes" },
          {
            type: "array",
            items: { $ref: "#/definitions/simpleTypes" },
            minItems: 1,
            uniqueItems: true
          }
        ]
      },
      format: { type: "string" },
      contentMediaType: { type: "string" },
      contentEncoding: { type: "string" },
      if: { $ref: "#" },
      then: { $ref: "#" },
      else: { $ref: "#" },
      allOf: { $ref: "#/definitions/schemaArray" },
      anyOf: { $ref: "#/definitions/schemaArray" },
      oneOf: { $ref: "#/definitions/schemaArray" },
      not: { $ref: "#" }
    },
    default: true
  };
});

// node_modules/ajv/lib/definition_schema.js
var require_definition_schema = __commonJS((exports, module) => {
  var metaSchema = require_json_schema_draft_07();
  module.exports = {
    $id: "https://github.com/ajv-validator/ajv/blob/master/lib/definition_schema.js",
    definitions: {
      simpleTypes: metaSchema.definitions.simpleTypes
    },
    type: "object",
    dependencies: {
      schema: ["validate"],
      $data: ["validate"],
      statements: ["inline"],
      valid: { not: { required: ["macro"] } }
    },
    properties: {
      type: metaSchema.properties.type,
      schema: { type: "boolean" },
      statements: { type: "boolean" },
      dependencies: {
        type: "array",
        items: { type: "string" }
      },
      metaSchema: { type: "object" },
      modifying: { type: "boolean" },
      valid: { type: "boolean" },
      $data: { type: "boolean" },
      async: { type: "boolean" },
      errors: {
        anyOf: [{ type: "boolean" }, { const: "full" }]
      }
    }
  };
});

// node_modules/ajv/lib/keyword.js
var require_keyword = __commonJS((exports, module) => {
  var IDENTIFIER = /^[a-z_$][a-z0-9_$-]*$/i;
  var customRuleCode = require_custom();
  var definitionSchema = require_definition_schema();
  module.exports = {
    add: addKeyword,
    get: getKeyword,
    remove: removeKeyword,
    validate: validateKeyword
  };
  function addKeyword(keyword, definition) {
    var RULES = this.RULES;
    if (RULES.keywords[keyword])
      throw new Error("Keyword " + keyword + " is already defined");
    if (!IDENTIFIER.test(keyword))
      throw new Error("Keyword " + keyword + " is not a valid identifier");
    if (definition) {
      this.validateKeyword(definition, true);
      var dataType = definition.type;
      if (Array.isArray(dataType)) {
        for (var i = 0; i < dataType.length; i++)
          _addRule(keyword, dataType[i], definition);
      } else {
        _addRule(keyword, dataType, definition);
      }
      var metaSchema = definition.metaSchema;
      if (metaSchema) {
        if (definition.$data && this._opts.$data) {
          metaSchema = {
            anyOf: [
              metaSchema,
              {
                $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
              }
            ]
          };
        }
        definition.validateSchema = this.compile(metaSchema, true);
      }
    }
    RULES.keywords[keyword] = RULES.all[keyword] = true;
    function _addRule(keyword2, dataType2, definition2) {
      var ruleGroup;
      for (var i2 = 0; i2 < RULES.length; i2++) {
        var rg = RULES[i2];
        if (rg.type == dataType2) {
          ruleGroup = rg;
          break;
        }
      }
      if (!ruleGroup) {
        ruleGroup = { type: dataType2, rules: [] };
        RULES.push(ruleGroup);
      }
      var rule = {
        keyword: keyword2,
        definition: definition2,
        custom: true,
        code: customRuleCode,
        implements: definition2.implements
      };
      ruleGroup.rules.push(rule);
      RULES.custom[keyword2] = rule;
    }
    return this;
  }
  function getKeyword(keyword) {
    var rule = this.RULES.custom[keyword];
    return rule ? rule.definition : this.RULES.keywords[keyword] || false;
  }
  function removeKeyword(keyword) {
    var RULES = this.RULES;
    delete RULES.keywords[keyword];
    delete RULES.all[keyword];
    delete RULES.custom[keyword];
    for (var i = 0; i < RULES.length; i++) {
      var rules = RULES[i].rules;
      for (var j = 0; j < rules.length; j++) {
        if (rules[j].keyword == keyword) {
          rules.splice(j, 1);
          break;
        }
      }
    }
    return this;
  }
  function validateKeyword(definition, throwError) {
    validateKeyword.errors = null;
    var v = (this._validateKeyword =
      this._validateKeyword || this.compile(definitionSchema, true));
    if (v(definition)) return true;
    validateKeyword.errors = v.errors;
    if (throwError)
      throw new Error(
        "custom keyword definition is invalid: " + this.errorsText(v.errors)
      );
    else return false;
  }
});

// node_modules/ajv/lib/refs/data.json
var require_data2 = __commonJS((exports, module) => {
  module.exports = {
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#",
    description:
      "Meta-schema for $data reference (JSON Schema extension proposal)",
    type: "object",
    required: ["$data"],
    properties: {
      $data: {
        type: "string",
        anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }]
      }
    },
    additionalProperties: false
  };
});

// node_modules/ajv/lib/ajv.js
var require_ajv = __commonJS((exports, module) => {
  var compileSchema = require_compile();
  var resolve = require_resolve();
  var Cache = require_cache();
  var SchemaObject = require_schema_obj();
  var stableStringify = require_fast_json_stable_stringify();
  var formats = require_formats();
  var rules = require_rules();
  var $dataMetaSchema = require_data();
  var util3 = require_util();
  module.exports = Ajv;
  Ajv.prototype.validate = validate;
  Ajv.prototype.compile = compile;
  Ajv.prototype.addSchema = addSchema;
  Ajv.prototype.addMetaSchema = addMetaSchema;
  Ajv.prototype.validateSchema = validateSchema;
  Ajv.prototype.getSchema = getSchema;
  Ajv.prototype.removeSchema = removeSchema;
  Ajv.prototype.addFormat = addFormat;
  Ajv.prototype.errorsText = errorsText;
  Ajv.prototype._addSchema = _addSchema;
  Ajv.prototype._compile = _compile;
  Ajv.prototype.compileAsync = require_async();
  var customKeyword = require_keyword();
  Ajv.prototype.addKeyword = customKeyword.add;
  Ajv.prototype.getKeyword = customKeyword.get;
  Ajv.prototype.removeKeyword = customKeyword.remove;
  Ajv.prototype.validateKeyword = customKeyword.validate;
  var errorClasses = require_error_classes();
  Ajv.ValidationError = errorClasses.Validation;
  Ajv.MissingRefError = errorClasses.MissingRef;
  Ajv.$dataMetaSchema = $dataMetaSchema;
  var META_SCHEMA_ID = "http://json-schema.org/draft-07/schema";
  var META_IGNORE_OPTIONS = [
    "removeAdditional",
    "useDefaults",
    "coerceTypes",
    "strictDefaults"
  ];
  var META_SUPPORT_DATA = ["/properties"];
  function Ajv(opts) {
    if (!(this instanceof Ajv)) return new Ajv(opts);
    opts = this._opts = util3.copy(opts) || {};
    setLogger(this);
    this._schemas = {};
    this._refs = {};
    this._fragments = {};
    this._formats = formats(opts.format);
    this._cache = opts.cache || new Cache();
    this._loadingSchemas = {};
    this._compilations = [];
    this.RULES = rules();
    this._getId = chooseGetId(opts);
    opts.loopRequired = opts.loopRequired || Infinity;
    if (opts.errorDataPath == "property") opts._errorDataPathProperty = true;
    if (opts.serialize === undefined) opts.serialize = stableStringify;
    this._metaOpts = getMetaSchemaOptions(this);
    if (opts.formats) addInitialFormats(this);
    if (opts.keywords) addInitialKeywords(this);
    addDefaultMetaSchema(this);
    if (typeof opts.meta == "object") this.addMetaSchema(opts.meta);
    if (opts.nullable)
      this.addKeyword("nullable", { metaSchema: { type: "boolean" } });
    addInitialSchemas(this);
  }
  function validate(schemaKeyRef, data) {
    var v;
    if (typeof schemaKeyRef == "string") {
      v = this.getSchema(schemaKeyRef);
      if (!v)
        throw new Error('no schema with key or ref "' + schemaKeyRef + '"');
    } else {
      var schemaObj = this._addSchema(schemaKeyRef);
      v = schemaObj.validate || this._compile(schemaObj);
    }
    var valid = v(data);
    if (v.$async !== true) this.errors = v.errors;
    return valid;
  }
  function compile(schema, _meta) {
    var schemaObj = this._addSchema(schema, undefined, _meta);
    return schemaObj.validate || this._compile(schemaObj);
  }
  function addSchema(schema, key, _skipValidation, _meta) {
    if (Array.isArray(schema)) {
      for (var i = 0; i < schema.length; i++)
        this.addSchema(schema[i], undefined, _skipValidation, _meta);
      return this;
    }
    var id = this._getId(schema);
    if (id !== undefined && typeof id != "string")
      throw new Error("schema id must be string");
    key = resolve.normalizeId(key || id);
    checkUnique(this, key);
    this._schemas[key] = this._addSchema(schema, _skipValidation, _meta, true);
    return this;
  }
  function addMetaSchema(schema, key, skipValidation) {
    this.addSchema(schema, key, skipValidation, true);
    return this;
  }
  function validateSchema(schema, throwOrLogError) {
    var $schema = schema.$schema;
    if ($schema !== undefined && typeof $schema != "string")
      throw new Error("$schema must be a string");
    $schema = $schema || this._opts.defaultMeta || defaultMeta(this);
    if (!$schema) {
      this.logger.warn("meta-schema not available");
      this.errors = null;
      return true;
    }
    var valid = this.validate($schema, schema);
    if (!valid && throwOrLogError) {
      var message = "schema is invalid: " + this.errorsText();
      if (this._opts.validateSchema == "log") this.logger.error(message);
      else throw new Error(message);
    }
    return valid;
  }
  function defaultMeta(self) {
    var meta = self._opts.meta;
    self._opts.defaultMeta =
      typeof meta == "object"
        ? self._getId(meta) || meta
        : self.getSchema(META_SCHEMA_ID)
          ? META_SCHEMA_ID
          : undefined;
    return self._opts.defaultMeta;
  }
  function getSchema(keyRef) {
    var schemaObj = _getSchemaObj(this, keyRef);
    switch (typeof schemaObj) {
      case "object":
        return schemaObj.validate || this._compile(schemaObj);
      case "string":
        return this.getSchema(schemaObj);
      case "undefined":
        return _getSchemaFragment(this, keyRef);
    }
  }
  function _getSchemaFragment(self, ref) {
    var res = resolve.schema.call(self, { schema: {} }, ref);
    if (res) {
      var { schema, root, baseId } = res;
      var v = compileSchema.call(self, schema, root, undefined, baseId);
      self._fragments[ref] = new SchemaObject({
        ref,
        fragment: true,
        schema,
        root,
        baseId,
        validate: v
      });
      return v;
    }
  }
  function _getSchemaObj(self, keyRef) {
    keyRef = resolve.normalizeId(keyRef);
    return (
      self._schemas[keyRef] || self._refs[keyRef] || self._fragments[keyRef]
    );
  }
  function removeSchema(schemaKeyRef) {
    if (schemaKeyRef instanceof RegExp) {
      _removeAllSchemas(this, this._schemas, schemaKeyRef);
      _removeAllSchemas(this, this._refs, schemaKeyRef);
      return this;
    }
    switch (typeof schemaKeyRef) {
      case "undefined":
        _removeAllSchemas(this, this._schemas);
        _removeAllSchemas(this, this._refs);
        this._cache.clear();
        return this;
      case "string":
        var schemaObj = _getSchemaObj(this, schemaKeyRef);
        if (schemaObj) this._cache.del(schemaObj.cacheKey);
        delete this._schemas[schemaKeyRef];
        delete this._refs[schemaKeyRef];
        return this;
      case "object":
        var serialize = this._opts.serialize;
        var cacheKey = serialize ? serialize(schemaKeyRef) : schemaKeyRef;
        this._cache.del(cacheKey);
        var id = this._getId(schemaKeyRef);
        if (id) {
          id = resolve.normalizeId(id);
          delete this._schemas[id];
          delete this._refs[id];
        }
    }
    return this;
  }
  function _removeAllSchemas(self, schemas, regex) {
    for (var keyRef in schemas) {
      var schemaObj = schemas[keyRef];
      if (!schemaObj.meta && (!regex || regex.test(keyRef))) {
        self._cache.del(schemaObj.cacheKey);
        delete schemas[keyRef];
      }
    }
  }
  function _addSchema(schema, skipValidation, meta, shouldAddSchema) {
    if (typeof schema != "object" && typeof schema != "boolean")
      throw new Error("schema should be object or boolean");
    var serialize = this._opts.serialize;
    var cacheKey = serialize ? serialize(schema) : schema;
    var cached = this._cache.get(cacheKey);
    if (cached) return cached;
    shouldAddSchema = shouldAddSchema || this._opts.addUsedSchema !== false;
    var id = resolve.normalizeId(this._getId(schema));
    if (id && shouldAddSchema) checkUnique(this, id);
    var willValidate = this._opts.validateSchema !== false && !skipValidation;
    var recursiveMeta;
    if (
      willValidate &&
      !(recursiveMeta = id && id == resolve.normalizeId(schema.$schema))
    )
      this.validateSchema(schema, true);
    var localRefs = resolve.ids.call(this, schema);
    var schemaObj = new SchemaObject({
      id,
      schema,
      localRefs,
      cacheKey,
      meta
    });
    if (id[0] != "#" && shouldAddSchema) this._refs[id] = schemaObj;
    this._cache.put(cacheKey, schemaObj);
    if (willValidate && recursiveMeta) this.validateSchema(schema, true);
    return schemaObj;
  }
  function _compile(schemaObj, root) {
    if (schemaObj.compiling) {
      schemaObj.validate = callValidate;
      callValidate.schema = schemaObj.schema;
      callValidate.errors = null;
      callValidate.root = root ? root : callValidate;
      if (schemaObj.schema.$async === true) callValidate.$async = true;
      return callValidate;
    }
    schemaObj.compiling = true;
    var currentOpts;
    if (schemaObj.meta) {
      currentOpts = this._opts;
      this._opts = this._metaOpts;
    }
    var v;
    try {
      v = compileSchema.call(this, schemaObj.schema, root, schemaObj.localRefs);
    } catch (e) {
      delete schemaObj.validate;
      throw e;
    } finally {
      schemaObj.compiling = false;
      if (schemaObj.meta) this._opts = currentOpts;
    }
    schemaObj.validate = v;
    schemaObj.refs = v.refs;
    schemaObj.refVal = v.refVal;
    schemaObj.root = v.root;
    return v;
    function callValidate() {
      var _validate = schemaObj.validate;
      var result = _validate.apply(this, arguments);
      callValidate.errors = _validate.errors;
      return result;
    }
  }
  function chooseGetId(opts) {
    switch (opts.schemaId) {
      case "auto":
        return _get$IdOrId;
      case "id":
        return _getId;
      default:
        return _get$Id;
    }
  }
  function _getId(schema) {
    if (schema.$id) this.logger.warn("schema $id ignored", schema.$id);
    return schema.id;
  }
  function _get$Id(schema) {
    if (schema.id) this.logger.warn("schema id ignored", schema.id);
    return schema.$id;
  }
  function _get$IdOrId(schema) {
    if (schema.$id && schema.id && schema.$id != schema.id)
      throw new Error("schema $id is different from id");
    return schema.$id || schema.id;
  }
  function errorsText(errors2, options) {
    errors2 = errors2 || this.errors;
    if (!errors2) return "No errors";
    options = options || {};
    var separator = options.separator === undefined ? ", " : options.separator;
    var dataVar = options.dataVar === undefined ? "data" : options.dataVar;
    var text = "";
    for (var i = 0; i < errors2.length; i++) {
      var e = errors2[i];
      if (e) text += dataVar + e.dataPath + " " + e.message + separator;
    }
    return text.slice(0, -separator.length);
  }
  function addFormat(name, format) {
    if (typeof format == "string") format = new RegExp(format);
    this._formats[name] = format;
    return this;
  }
  function addDefaultMetaSchema(self) {
    var $dataSchema;
    if (self._opts.$data) {
      $dataSchema = require_data2();
      self.addMetaSchema($dataSchema, $dataSchema.$id, true);
    }
    if (self._opts.meta === false) return;
    var metaSchema = require_json_schema_draft_07();
    if (self._opts.$data)
      metaSchema = $dataMetaSchema(metaSchema, META_SUPPORT_DATA);
    self.addMetaSchema(metaSchema, META_SCHEMA_ID, true);
    self._refs["http://json-schema.org/schema"] = META_SCHEMA_ID;
  }
  function addInitialSchemas(self) {
    var optsSchemas = self._opts.schemas;
    if (!optsSchemas) return;
    if (Array.isArray(optsSchemas)) self.addSchema(optsSchemas);
    else for (var key in optsSchemas) self.addSchema(optsSchemas[key], key);
  }
  function addInitialFormats(self) {
    for (var name in self._opts.formats) {
      var format = self._opts.formats[name];
      self.addFormat(name, format);
    }
  }
  function addInitialKeywords(self) {
    for (var name in self._opts.keywords) {
      var keyword = self._opts.keywords[name];
      self.addKeyword(name, keyword);
    }
  }
  function checkUnique(self, id) {
    if (self._schemas[id] || self._refs[id])
      throw new Error('schema with key or id "' + id + '" already exists');
  }
  function getMetaSchemaOptions(self) {
    var metaOpts = util3.copy(self._opts);
    for (var i = 0; i < META_IGNORE_OPTIONS.length; i++)
      delete metaOpts[META_IGNORE_OPTIONS[i]];
    return metaOpts;
  }
  function setLogger(self) {
    var logger = self._opts.logger;
    if (logger === false) {
      self.logger = { log: noop, warn: noop, error: noop };
    } else {
      if (logger === undefined) logger = console;
      if (
        !(
          typeof logger == "object" &&
          logger.log &&
          logger.warn &&
          logger.error
        )
      )
        throw new Error("logger must implement log, warn and error methods");
      self.logger = logger;
    }
  }
  function noop() {}
});

// node_modules/zod/v3/external.js
var exports_external = {};
__export(exports_external, {
  void: () => voidType,
  util: () => util,
  unknown: () => unknownType,
  union: () => unionType,
  undefined: () => undefinedType,
  tuple: () => tupleType,
  transformer: () => effectsType,
  symbol: () => symbolType,
  string: () => stringType,
  strictObject: () => strictObjectType,
  setErrorMap: () => setErrorMap,
  set: () => setType,
  record: () => recordType,
  quotelessJson: () => quotelessJson,
  promise: () => promiseType,
  preprocess: () => preprocessType,
  pipeline: () => pipelineType,
  ostring: () => ostring,
  optional: () => optionalType,
  onumber: () => onumber,
  oboolean: () => oboolean,
  objectUtil: () => objectUtil,
  object: () => objectType,
  number: () => numberType,
  nullable: () => nullableType,
  null: () => nullType,
  never: () => neverType,
  nativeEnum: () => nativeEnumType,
  nan: () => nanType,
  map: () => mapType,
  makeIssue: () => makeIssue,
  literal: () => literalType,
  lazy: () => lazyType,
  late: () => late,
  isValid: () => isValid,
  isDirty: () => isDirty,
  isAsync: () => isAsync,
  isAborted: () => isAborted,
  intersection: () => intersectionType,
  instanceof: () => instanceOfType,
  getParsedType: () => getParsedType,
  getErrorMap: () => getErrorMap,
  function: () => functionType,
  enum: () => enumType,
  effect: () => effectsType,
  discriminatedUnion: () => discriminatedUnionType,
  defaultErrorMap: () => en_default,
  datetimeRegex: () => datetimeRegex,
  date: () => dateType,
  custom: () => custom,
  coerce: () => coerce,
  boolean: () => booleanType,
  bigint: () => bigIntType,
  array: () => arrayType,
  any: () => anyType,
  addIssueToContext: () => addIssueToContext,
  ZodVoid: () => ZodVoid,
  ZodUnknown: () => ZodUnknown,
  ZodUnion: () => ZodUnion,
  ZodUndefined: () => ZodUndefined,
  ZodType: () => ZodType,
  ZodTuple: () => ZodTuple,
  ZodTransformer: () => ZodEffects,
  ZodSymbol: () => ZodSymbol,
  ZodString: () => ZodString,
  ZodSet: () => ZodSet,
  ZodSchema: () => ZodType,
  ZodRecord: () => ZodRecord,
  ZodReadonly: () => ZodReadonly,
  ZodPromise: () => ZodPromise,
  ZodPipeline: () => ZodPipeline,
  ZodParsedType: () => ZodParsedType,
  ZodOptional: () => ZodOptional,
  ZodObject: () => ZodObject,
  ZodNumber: () => ZodNumber,
  ZodNullable: () => ZodNullable,
  ZodNull: () => ZodNull,
  ZodNever: () => ZodNever,
  ZodNativeEnum: () => ZodNativeEnum,
  ZodNaN: () => ZodNaN,
  ZodMap: () => ZodMap,
  ZodLiteral: () => ZodLiteral,
  ZodLazy: () => ZodLazy,
  ZodIssueCode: () => ZodIssueCode,
  ZodIntersection: () => ZodIntersection,
  ZodFunction: () => ZodFunction,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodError: () => ZodError,
  ZodEnum: () => ZodEnum,
  ZodEffects: () => ZodEffects,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodDefault: () => ZodDefault,
  ZodDate: () => ZodDate,
  ZodCatch: () => ZodCatch,
  ZodBranded: () => ZodBranded,
  ZodBoolean: () => ZodBoolean,
  ZodBigInt: () => ZodBigInt,
  ZodArray: () => ZodArray,
  ZodAny: () => ZodAny,
  Schema: () => ZodType,
  ParseStatus: () => ParseStatus,
  OK: () => OK,
  NEVER: () => NEVER,
  INVALID: () => INVALID,
  EMPTY_PATH: () => EMPTY_PATH,
  DIRTY: () => DIRTY,
  BRAND: () => BRAND
});

// node_modules/zod/v3/helpers/util.js
var util;
(function (util2) {
  util2.assertEqual = (_) => {};
  function assertIs(_arg) {}
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error();
  }
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2
      .objectKeys(obj)
      .filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function (e) {
      return obj[e];
    });
  };
  util2.objectKeys =
    typeof Object.keys === "function"
      ? (obj) => Object.keys(obj)
      : (object) => {
          const keys = [];
          for (const key in object) {
            if (Object.prototype.hasOwnProperty.call(object, key)) {
              keys.push(key);
            }
          }
          return keys;
        };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item)) return item;
    }
    return;
  };
  util2.isInteger =
    typeof Number.isInteger === "function"
      ? (val) => Number.isInteger(val)
      : (val) =>
          typeof val === "number" &&
          Number.isFinite(val) &&
          Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array
      .map((val) => (typeof val === "string" ? `'${val}'` : val))
      .join(separator);
  }
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function (objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
var getParsedType = (data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (
        data.then &&
        typeof data.then === "function" &&
        data.catch &&
        typeof data.catch === "function"
      ) {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
};

// node_modules/zod/v3/ZodError.js
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
var quotelessJson = (obj) => {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(/"([^"]+)":/g, "$1:");
};

class ZodError extends Error {
  get errors() {
    return this.issues;
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  format(_mapper) {
    const mapper =
      _mapper ||
      function (issue) {
        return issue.message;
      };
    const fieldErrors = { _errors: [] };
    const processError = (error) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    };
    processError(this);
    return fieldErrors;
  }
  static assert(value) {
    if (!(value instanceof ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        const firstEl = sub.path[0];
        fieldErrors[firstEl] = fieldErrors[firstEl] || [];
        fieldErrors[firstEl].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
}
ZodError.create = (issues) => {
  const error = new ZodError(issues);
  return error;
};

// node_modules/zod/v3/locales/en.js
var errorMap = (issue, _ctx) => {
  let message;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "bigint")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};
var en_default = errorMap;

// node_modules/zod/v3/errors.js
var overrideErrorMap = en_default;
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}
// node_modules/zod/v3/helpers/parseUtil.js
var makeIssue = (params) => {
  const { data, path, errorMaps, issueData } = params;
  const fullPath = [...path, ...(issueData.path || [])];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== undefined) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage = "";
  const maps = errorMaps
    .filter((m) => !!m)
    .slice()
    .reverse();
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage
  };
};
var EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      ctx.schemaErrorMap,
      overrideMap,
      overrideMap === en_default ? undefined : en_default
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}

class ParseStatus {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid") this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted") this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s of results) {
      if (s.status === "aborted") return INVALID;
      if (s.status === "dirty") status.dirty();
      arrayValue.push(s.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key,
        value
      });
    }
    return ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted") return INVALID;
      if (value.status === "aborted") return INVALID;
      if (key.status === "dirty") status.dirty();
      if (value.status === "dirty") status.dirty();
      if (
        key.value !== "__proto__" &&
        (typeof value.value !== "undefined" || pair.alwaysSet)
      ) {
        finalObject[key.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
}
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = (value) => ({ status: "dirty", value });
var OK = (value) => ({ status: "valid", value });
var isAborted = (x) => x.status === "aborted";
var isDirty = (x) => x.status === "dirty";
var isValid = (x) => x.status === "valid";
var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;
// node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
(function (errorUtil2) {
  errorUtil2.errToObj = (message) =>
    typeof message === "string" ? { message } : message || {};
  errorUtil2.toString = (message) =>
    typeof message === "string" ? message : message?.message;
})(errorUtil || (errorUtil = {}));

// node_modules/zod/v3/types.js
class ParseInputLazyPath {
  constructor(parent, value, path, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (Array.isArray(this._key)) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
}
var handleResult = (ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error) return this._error;
        const error = new ZodError(ctx.common.issues);
        this._error = error;
        return this._error;
      }
    };
  }
};
function processCreateParams(params) {
  if (!params) return {};
  const {
    errorMap: errorMap2,
    invalid_type_error,
    required_error,
    description
  } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(
      `Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`
    );
  }
  if (errorMap2) return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type") return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}

class ZodType {
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return (
      ctx || {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    );
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus(),
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success) return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    const ctx = {
      common: {
        issues: [],
        async: params?.async ?? false,
        contextualErrorMap: params?.errorMap
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  "~validate"(data) {
    const ctx = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    if (!this["~standard"].async) {
      try {
        const result = this._parseSync({ data, path: [], parent: ctx });
        return isValid(result)
          ? {
              value: result.value
            }
          : {
              issues: ctx.common.issues
            };
      } catch (err) {
        if (err?.message?.toLowerCase()?.includes("encountered")) {
          this["~standard"].async = true;
        }
        ctx.common = {
          issues: [],
          async: true
        };
      }
    }
    return this._parseAsync({ data, path: [], parent: ctx }).then((result) =>
      isValid(result)
        ? {
            value: result.value
          }
        : {
            issues: ctx.common.issues
          }
    );
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success) return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params?.errorMap,
        async: true
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult)
      ? maybeAsyncResult
      : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check, message) {
    const getIssueProperties = (val) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    };
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = () =>
        ctx.addIssue({
          code: ZodIssueCode.custom,
          ...getIssueProperties(val)
        });
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(
          typeof refinementData === "function"
            ? refinementData(val, ctx)
            : refinementData
        );
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
    this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (data) => this["~validate"](data)
    };
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(undefined).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
}
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[0-9a-z]+$/;
var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var uuidRegex =
  /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var nanoidRegex = /^[a-z0-9_-]{21}$/i;
var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var durationRegex =
  /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var emailRegex =
  /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
var emojiRegex;
var ipv4Regex =
  /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv4CidrRegex =
  /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var ipv6Regex =
  /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var ipv6CidrRegex =
  /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64Regex =
  /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var base64urlRegex =
  /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
var dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset) opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt)) return false;
  try {
    const [header] = jwt.split(".");
    if (!header) return false;
    const base64 = header
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(header.length + ((4 - (header.length % 4)) % 4), "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null) return false;
    if ("typ" in decoded && decoded?.typ !== "JWT") return false;
    if (!decoded.alg) return false;
    if (alg && decoded.alg !== alg) return false;
    return true;
  } catch {
    return false;
  }
}
function isValidCidr(ip, version) {
  if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}

class ZodString extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = undefined;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "jwt") {
        if (!isValidJWT(input.data, check.alg)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "jwt",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cidr") {
        if (!isValidCidr(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cidr",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64url") {
        if (!base64urlRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message)
    });
  }
  _addCheck(check) {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  emoji(message) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  nanoid(message) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  base64(message) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
  }
  base64url(message) {
    return this._addCheck({
      kind: "base64url",
      ...errorUtil.errToObj(message)
    });
  }
  jwt(options) {
    return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  cidr(options) {
    return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision:
        typeof options?.precision === "undefined" ? null : options?.precision,
      offset: options?.offset ?? false,
      local: options?.local ?? false,
      ...errorUtil.errToObj(options?.message)
    });
  }
  date(message) {
    return this._addCheck({ kind: "date", message });
  }
  time(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options
      });
    }
    return this._addCheck({
      kind: "time",
      precision:
        typeof options?.precision === "undefined" ? null : options?.precision,
      ...errorUtil.errToObj(options?.message)
    });
  }
  duration(message) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
  }
  regex(regex, message) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message)
    });
  }
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options?.position,
      ...errorUtil.errToObj(options?.message)
    });
  }
  startsWith(value, message) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value, message) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  min(minLength, message) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message)
    });
  }
  max(maxLength, message) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message)
    });
  }
  length(len, message) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message)
    });
  }
  nonempty(message) {
    return this.min(1, errorUtil.errToObj(message));
  }
  trim() {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((ch) => ch.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((ch) => ch.kind === "base64url");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min) min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max) max = ch.value;
      }
    }
    return max;
  }
}
ZodString.create = (params) => {
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return (valInt % stepInt) / 10 ** decCount;
}

class ZodNumber extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = undefined;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive
          ? input.data < check.value
          : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive
          ? input.data > check.value
          : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message)
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  finite(message) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message)
    });
  }
  safe(message) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min) min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max) max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find(
      (ch) =>
        ch.kind === "int" ||
        (ch.kind === "multipleOf" && util.isInteger(ch.value))
    );
  }
  get isFinite() {
    let max = null;
    let min = null;
    for (const ch of this._def.checks) {
      if (
        ch.kind === "finite" ||
        ch.kind === "int" ||
        ch.kind === "multipleOf"
      ) {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min) min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max) max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
}
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};

class ZodBigInt extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      try {
        input.data = BigInt(input.data);
      } catch {
        return this._getInvalidInput(input);
      }
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      return this._getInvalidInput(input);
    }
    let ctx = undefined;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive
          ? input.data < check.value
          : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive
          ? input.data > check.value
          : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _getInvalidInput(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.bigint,
      received: ctx.parsedType
    });
    return INVALID;
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min) min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max) max = ch.value;
      }
    }
    return max;
  }
}
ZodBigInt.create = (params) => {
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};

class ZodBoolean extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};

class ZodDate extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (Number.isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = undefined;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  max(maxDate, message) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min) min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max) max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
}
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: params?.coerce || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};

class ZodSymbol extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};

class ZodUndefined extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};

class ZodNull extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};

class ZodAny extends ZodType {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
}
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};

class ZodUnknown extends ZodType {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
}
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};

class ZodNever extends ZodType {
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
}
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};

class ZodVoid extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};

class ZodArray extends ZodType {
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : undefined,
          maximum: tooBig ? def.exactLength.value : undefined,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all(
        [...ctx.data].map((item, i) => {
          return def.type._parseAsync(
            new ParseInputLazyPath(ctx, item, ctx.path, i)
          );
        })
      ).then((result2) => {
        return ParseStatus.mergeArray(status, result2);
      });
    }
    const result = [...ctx.data].map((item, i) => {
      return def.type._parseSync(
        new ParseInputLazyPath(ctx, item, ctx.path, i)
      );
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message) {
    return new ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) }
    });
  }
  max(maxLength, message) {
    return new ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) }
    });
  }
  length(len, message) {
    return new ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) }
    });
  }
  nonempty(message) {
    return this.min(1, message);
  }
}
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}

class ZodObject extends ZodType {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null) return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    this._cached = { shape, keys };
    return this._cached;
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (
      !(
        this._def.catchall instanceof ZodNever &&
        this._def.unknownKeys === "strip"
      )
    ) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(
          new ParseInputLazyPath(ctx, value, ctx.path, key)
        ),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip") {
      } else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(
            new ParseInputLazyPath(ctx, value, ctx.path, key)
          ),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve()
        .then(async () => {
          const syncPairs = [];
          for (const pair of pairs) {
            const key = await pair.key;
            const value = await pair.value;
            syncPairs.push({
              key,
              value,
              alwaysSet: pair.alwaysSet
            });
          }
          return syncPairs;
        })
        .then((syncPairs) => {
          return ParseStatus.mergeObjectSync(status, syncPairs);
        });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message) {
    errorUtil.errToObj;
    return new ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...(message !== undefined
        ? {
            errorMap: (issue, ctx) => {
              const defaultError =
                this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
              if (issue.code === "unrecognized_keys")
                return {
                  message: errorUtil.errToObj(message).message ?? defaultError
                };
              return {
                message: defaultError
              };
            }
          }
        : {})
    });
  }
  strip() {
    return new ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  extend(augmentation) {
    return new ZodObject({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...augmentation
      })
    });
  }
  merge(merging) {
    const merged = new ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  setKey(key, schema) {
    return this.augment({ [key]: schema });
  }
  catchall(index) {
    return new ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    for (const key of util.objectKeys(mask)) {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  omit(mask) {
    const shape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    }
    return new ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  required(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    }
    return new ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
}
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};

class ZodUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map(
        (result) => new ZodError(result.ctx.common.issues)
      );
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return Promise.all(
        options.map(async (option) => {
          const childCtx = {
            ...ctx,
            common: {
              ...ctx.common,
              issues: []
            },
            parent: null
          };
          return {
            result: await option._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: childCtx
            }),
            ctx: childCtx
          };
        })
      ).then(handleResults);
    } else {
      let dirty = undefined;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
}
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
var getDiscriminator = (type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return util.objectValues(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [undefined];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [undefined, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
};

class ZodDiscriminatedUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  static create(discriminator, options, params) {
    const optionsMap = new Map();
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(
          `A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`
        );
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(
            `Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`
          );
        }
        optionsMap.set(value, type);
      }
    }
    return new ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
}
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util
      .objectKeys(a)
      .filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (
    aType === ZodParsedType.date &&
    bType === ZodParsedType.date &&
    +a === +b
  ) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}

class ZodIntersection extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = (parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    };
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(
        this._def.left._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      );
    }
  }
}
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};

class ZodTuple extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data]
      .map((item, itemIndex) => {
        const schema = this._def.items[itemIndex] || this._def.rest;
        if (!schema) return null;
        return schema._parse(
          new ParseInputLazyPath(ctx, item, ctx.path, itemIndex)
        );
      })
      .filter((x) => !!x);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new ZodTuple({
      ...this._def,
      rest
    });
  }
}
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};

class ZodRecord extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(
          new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)
        ),
        alwaysSet: key in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
}

class ZodMap extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value], index) => {
      return {
        key: keyType._parse(
          new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])
        ),
        value: valueType._parse(
          new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"])
        )
      };
    });
    if (ctx.common.async) {
      const finalMap = new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = new Map();
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
}
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};

class ZodSet extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = new Set();
      for (const element of elements2) {
        if (element.status === "aborted") return INVALID;
        if (element.status === "dirty") status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    const elements = [...ctx.data.values()].map((item, i) =>
      valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i))
    );
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message) {
    return new ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) }
    });
  }
  max(maxSize, message) {
    return new ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) }
    });
  }
  size(size, message) {
    return this.min(size, message).max(size, message);
  }
  nonempty(message) {
    return this.min(1, message);
  }
}
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};

class ZodFunction extends ZodType {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [
          ctx.common.contextualErrorMap,
          ctx.schemaErrorMap,
          getErrorMap(),
          en_default
        ].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error
        }
      });
    }
    function makeReturnsIssue(returns, error) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [
          ctx.common.contextualErrorMap,
          ctx.schemaErrorMap,
          getErrorMap(),
          en_default
        ].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error
        }
      });
    }
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function (...args) {
        const error = new ZodError([]);
        const parsedArgs = await me._def.args
          .parseAsync(args, params)
          .catch((e) => {
            error.addIssue(makeArgsIssue(args, e));
            throw error;
          });
        const result = await Reflect.apply(fn, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type
          .parseAsync(result, params)
          .catch((e) => {
            error.addIssue(makeReturnsIssue(result, e));
            throw error;
          });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function (...args) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
}

class ZodLazy extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
}
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};

class ZodLiteral extends ZodType {
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
}
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}

class ZodEnum extends ZodType {
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(this._def.values);
    }
    if (!this._cache.has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values, newDef = this._def) {
    return ZodEnum.create(values, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values, newDef = this._def) {
    return ZodEnum.create(
      this.options.filter((opt) => !values.includes(opt)),
      {
        ...this._def,
        ...newDef
      }
    );
  }
}
ZodEnum.create = createZodEnum;

class ZodNativeEnum extends ZodType {
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (
      ctx.parsedType !== ZodParsedType.string &&
      ctx.parsedType !== ZodParsedType.number
    ) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(util.getValidEnumValues(this._def.values));
    }
    if (!this._cache.has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
}
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};

class ZodPromise extends ZodType {
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (
      ctx.parsedType !== ZodParsedType.promise &&
      ctx.common.async === false
    ) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified =
      ctx.parsedType === ZodParsedType.promise
        ? ctx.data
        : Promise.resolve(ctx.data);
    return OK(
      promisified.then((data) => {
        return this._def.type.parseAsync(data, {
          path: ctx.path,
          errorMap: ctx.common.contextualErrorMap
        });
      })
    );
  }
}
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};

class ZodEffects extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects
      ? this._def.schema.sourceType()
      : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: (arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      },
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed2) => {
          if (status.value === "aborted") return INVALID;
          const result = await this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted") return INVALID;
          if (result.status === "dirty") return DIRTY(result.value);
          if (status.value === "dirty") return DIRTY(result.value);
          return result;
        });
      } else {
        if (status.value === "aborted") return INVALID;
        const result = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result.status === "aborted") return INVALID;
        if (result.status === "dirty") return DIRTY(result.value);
        if (status.value === "dirty") return DIRTY(result.value);
        return result;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = (acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error(
            "Async refinement encountered during synchronous parse operation. Use .parseAsync instead."
          );
        }
        return acc;
      };
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted") return INVALID;
        if (inner.status === "dirty") status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema
          ._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx })
          .then((inner) => {
            if (inner.status === "aborted") return INVALID;
            if (inner.status === "dirty") status.dirty();
            return executeRefinement(inner.value).then(() => {
              return { status: status.value, value: inner.value };
            });
          });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base)) return INVALID;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(
            `Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`
          );
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema
          ._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx })
          .then((base) => {
            if (!isValid(base)) return INVALID;
            return Promise.resolve(effect.transform(base.value, checkCtx)).then(
              (result) => ({
                status: status.value,
                value: result
              })
            );
          });
      }
    }
    util.assertNever(effect);
  }
}
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
class ZodOptional extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(undefined);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
}
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};

class ZodNullable extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
}
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};

class ZodDefault extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
}
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue:
      typeof params.default === "function"
        ? params.default
        : () => params.default,
    ...processCreateParams(params)
  });
};

class ZodCatch extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value:
            result2.status === "valid"
              ? result2.value
              : this._def.catchValue({
                  get error() {
                    return new ZodError(newCtx.common.issues);
                  },
                  input: newCtx.data
                })
        };
      });
    } else {
      return {
        status: "valid",
        value:
          result.status === "valid"
            ? result.value
            : this._def.catchValue({
                get error() {
                  return new ZodError(newCtx.common.issues);
                },
                input: newCtx.data
              })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
}
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue:
      typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};

class ZodNaN extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
}
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
var BRAND = Symbol("zod_brand");

class ZodBranded extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
}

class ZodPipeline extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted") return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      };
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted") return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a, b) {
    return new ZodPipeline({
      in: a,
      out: b,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
}

class ZodReadonly extends ZodType {
  _parse(input) {
    const result = this._def.innerType._parse(input);
    const freeze = (data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    };
    return isAsync(result)
      ? result.then((data) => freeze(data))
      : freeze(result);
  }
  unwrap() {
    return this._def.innerType;
  }
}
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
function cleanParams(params, data) {
  const p =
    typeof params === "function"
      ? params(data)
      : typeof params === "string"
        ? { message: params }
        : params;
  const p2 = typeof p === "string" ? { message: p } : p;
  return p2;
}
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      const r = check(data);
      if (r instanceof Promise) {
        return r.then((r2) => {
          if (!r2) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r) {
        const params = cleanParams(_params, data);
        const _fatal = params.fatal ?? fatal ?? true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function (ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
var instanceOfType = (
  cls,
  params = {
    message: `Input not instance of ${cls.name}`
  }
) => custom((data) => data instanceof cls, params);
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;
var ostring = () => stringType().optional();
var onumber = () => numberType().optional();
var oboolean = () => booleanType().optional();
var coerce = {
  string: (arg) => ZodString.create({ ...arg, coerce: true }),
  number: (arg) => ZodNumber.create({ ...arg, coerce: true }),
  boolean: (arg) =>
    ZodBoolean.create({
      ...arg,
      coerce: true
    }),
  bigint: (arg) => ZodBigInt.create({ ...arg, coerce: true }),
  date: (arg) => ZodDate.create({ ...arg, coerce: true })
};
var NEVER = INVALID;
// node_modules/@modelcontextprotocol/sdk/dist/esm/types.js
var LATEST_PROTOCOL_VERSION = "2025-06-18";
var SUPPORTED_PROTOCOL_VERSIONS = [
  LATEST_PROTOCOL_VERSION,
  "2025-03-26",
  "2024-11-05",
  "2024-10-07"
];
var JSONRPC_VERSION = "2.0";
var ProgressTokenSchema = exports_external.union([
  exports_external.string(),
  exports_external.number().int()
]);
var CursorSchema = exports_external.string();
var RequestMetaSchema = exports_external
  .object({
    progressToken: exports_external.optional(ProgressTokenSchema)
  })
  .passthrough();
var BaseRequestParamsSchema = exports_external
  .object({
    _meta: exports_external.optional(RequestMetaSchema)
  })
  .passthrough();
var RequestSchema = exports_external.object({
  method: exports_external.string(),
  params: exports_external.optional(BaseRequestParamsSchema)
});
var BaseNotificationParamsSchema = exports_external
  .object({
    _meta: exports_external.optional(exports_external.object({}).passthrough())
  })
  .passthrough();
var NotificationSchema = exports_external.object({
  method: exports_external.string(),
  params: exports_external.optional(BaseNotificationParamsSchema)
});
var ResultSchema = exports_external
  .object({
    _meta: exports_external.optional(exports_external.object({}).passthrough())
  })
  .passthrough();
var RequestIdSchema = exports_external.union([
  exports_external.string(),
  exports_external.number().int()
]);
var JSONRPCRequestSchema = exports_external
  .object({
    jsonrpc: exports_external.literal(JSONRPC_VERSION),
    id: RequestIdSchema
  })
  .merge(RequestSchema)
  .strict();
var isJSONRPCRequest = (value) => JSONRPCRequestSchema.safeParse(value).success;
var JSONRPCNotificationSchema = exports_external
  .object({
    jsonrpc: exports_external.literal(JSONRPC_VERSION)
  })
  .merge(NotificationSchema)
  .strict();
var isJSONRPCNotification = (value) =>
  JSONRPCNotificationSchema.safeParse(value).success;
var JSONRPCResponseSchema = exports_external
  .object({
    jsonrpc: exports_external.literal(JSONRPC_VERSION),
    id: RequestIdSchema,
    result: ResultSchema
  })
  .strict();
var isJSONRPCResponse = (value) =>
  JSONRPCResponseSchema.safeParse(value).success;
var ErrorCode;
(function (ErrorCode2) {
  ErrorCode2[(ErrorCode2["ConnectionClosed"] = -32000)] = "ConnectionClosed";
  ErrorCode2[(ErrorCode2["RequestTimeout"] = -32001)] = "RequestTimeout";
  ErrorCode2[(ErrorCode2["ParseError"] = -32700)] = "ParseError";
  ErrorCode2[(ErrorCode2["InvalidRequest"] = -32600)] = "InvalidRequest";
  ErrorCode2[(ErrorCode2["MethodNotFound"] = -32601)] = "MethodNotFound";
  ErrorCode2[(ErrorCode2["InvalidParams"] = -32602)] = "InvalidParams";
  ErrorCode2[(ErrorCode2["InternalError"] = -32603)] = "InternalError";
})(ErrorCode || (ErrorCode = {}));
var JSONRPCErrorSchema = exports_external
  .object({
    jsonrpc: exports_external.literal(JSONRPC_VERSION),
    id: RequestIdSchema,
    error: exports_external.object({
      code: exports_external.number().int(),
      message: exports_external.string(),
      data: exports_external.optional(exports_external.unknown())
    })
  })
  .strict();
var isJSONRPCError = (value) => JSONRPCErrorSchema.safeParse(value).success;
var JSONRPCMessageSchema = exports_external.union([
  JSONRPCRequestSchema,
  JSONRPCNotificationSchema,
  JSONRPCResponseSchema,
  JSONRPCErrorSchema
]);
var EmptyResultSchema = ResultSchema.strict();
var CancelledNotificationSchema = NotificationSchema.extend({
  method: exports_external.literal("notifications/cancelled"),
  params: BaseNotificationParamsSchema.extend({
    requestId: RequestIdSchema,
    reason: exports_external.string().optional()
  })
});
var BaseMetadataSchema = exports_external
  .object({
    name: exports_external.string(),
    title: exports_external.optional(exports_external.string())
  })
  .passthrough();
var ImplementationSchema = BaseMetadataSchema.extend({
  version: exports_external.string()
});
var ClientCapabilitiesSchema = exports_external
  .object({
    experimental: exports_external.optional(
      exports_external.object({}).passthrough()
    ),
    sampling: exports_external.optional(
      exports_external.object({}).passthrough()
    ),
    elicitation: exports_external.optional(
      exports_external.object({}).passthrough()
    ),
    roots: exports_external.optional(
      exports_external
        .object({
          listChanged: exports_external.optional(exports_external.boolean())
        })
        .passthrough()
    )
  })
  .passthrough();
var InitializeRequestSchema = RequestSchema.extend({
  method: exports_external.literal("initialize"),
  params: BaseRequestParamsSchema.extend({
    protocolVersion: exports_external.string(),
    capabilities: ClientCapabilitiesSchema,
    clientInfo: ImplementationSchema
  })
});
var ServerCapabilitiesSchema = exports_external
  .object({
    experimental: exports_external.optional(
      exports_external.object({}).passthrough()
    ),
    logging: exports_external.optional(
      exports_external.object({}).passthrough()
    ),
    completions: exports_external.optional(
      exports_external.object({}).passthrough()
    ),
    prompts: exports_external.optional(
      exports_external
        .object({
          listChanged: exports_external.optional(exports_external.boolean())
        })
        .passthrough()
    ),
    resources: exports_external.optional(
      exports_external
        .object({
          subscribe: exports_external.optional(exports_external.boolean()),
          listChanged: exports_external.optional(exports_external.boolean())
        })
        .passthrough()
    ),
    tools: exports_external.optional(
      exports_external
        .object({
          listChanged: exports_external.optional(exports_external.boolean())
        })
        .passthrough()
    )
  })
  .passthrough();
var InitializeResultSchema = ResultSchema.extend({
  protocolVersion: exports_external.string(),
  capabilities: ServerCapabilitiesSchema,
  serverInfo: ImplementationSchema,
  instructions: exports_external.optional(exports_external.string())
});
var InitializedNotificationSchema = NotificationSchema.extend({
  method: exports_external.literal("notifications/initialized")
});
var PingRequestSchema = RequestSchema.extend({
  method: exports_external.literal("ping")
});
var ProgressSchema = exports_external
  .object({
    progress: exports_external.number(),
    total: exports_external.optional(exports_external.number()),
    message: exports_external.optional(exports_external.string())
  })
  .passthrough();
var ProgressNotificationSchema = NotificationSchema.extend({
  method: exports_external.literal("notifications/progress"),
  params: BaseNotificationParamsSchema.merge(ProgressSchema).extend({
    progressToken: ProgressTokenSchema
  })
});
var PaginatedRequestSchema = RequestSchema.extend({
  params: BaseRequestParamsSchema.extend({
    cursor: exports_external.optional(CursorSchema)
  }).optional()
});
var PaginatedResultSchema = ResultSchema.extend({
  nextCursor: exports_external.optional(CursorSchema)
});
var ResourceContentsSchema = exports_external
  .object({
    uri: exports_external.string(),
    mimeType: exports_external.optional(exports_external.string()),
    _meta: exports_external.optional(exports_external.object({}).passthrough())
  })
  .passthrough();
var TextResourceContentsSchema = ResourceContentsSchema.extend({
  text: exports_external.string()
});
var Base64Schema = exports_external.string().refine(
  (val) => {
    try {
      atob(val);
      return true;
    } catch (_a) {
      return false;
    }
  },
  { message: "Invalid Base64 string" }
);
var BlobResourceContentsSchema = ResourceContentsSchema.extend({
  blob: Base64Schema
});
var ResourceSchema = BaseMetadataSchema.extend({
  uri: exports_external.string(),
  description: exports_external.optional(exports_external.string()),
  mimeType: exports_external.optional(exports_external.string()),
  _meta: exports_external.optional(exports_external.object({}).passthrough())
});
var ResourceTemplateSchema = BaseMetadataSchema.extend({
  uriTemplate: exports_external.string(),
  description: exports_external.optional(exports_external.string()),
  mimeType: exports_external.optional(exports_external.string()),
  _meta: exports_external.optional(exports_external.object({}).passthrough())
});
var ListResourcesRequestSchema = PaginatedRequestSchema.extend({
  method: exports_external.literal("resources/list")
});
var ListResourcesResultSchema = PaginatedResultSchema.extend({
  resources: exports_external.array(ResourceSchema)
});
var ListResourceTemplatesRequestSchema = PaginatedRequestSchema.extend({
  method: exports_external.literal("resources/templates/list")
});
var ListResourceTemplatesResultSchema = PaginatedResultSchema.extend({
  resourceTemplates: exports_external.array(ResourceTemplateSchema)
});
var ReadResourceRequestSchema = RequestSchema.extend({
  method: exports_external.literal("resources/read"),
  params: BaseRequestParamsSchema.extend({
    uri: exports_external.string()
  })
});
var ReadResourceResultSchema = ResultSchema.extend({
  contents: exports_external.array(
    exports_external.union([
      TextResourceContentsSchema,
      BlobResourceContentsSchema
    ])
  )
});
var ResourceListChangedNotificationSchema = NotificationSchema.extend({
  method: exports_external.literal("notifications/resources/list_changed")
});
var SubscribeRequestSchema = RequestSchema.extend({
  method: exports_external.literal("resources/subscribe"),
  params: BaseRequestParamsSchema.extend({
    uri: exports_external.string()
  })
});
var UnsubscribeRequestSchema = RequestSchema.extend({
  method: exports_external.literal("resources/unsubscribe"),
  params: BaseRequestParamsSchema.extend({
    uri: exports_external.string()
  })
});
var ResourceUpdatedNotificationSchema = NotificationSchema.extend({
  method: exports_external.literal("notifications/resources/updated"),
  params: BaseNotificationParamsSchema.extend({
    uri: exports_external.string()
  })
});
var PromptArgumentSchema = exports_external
  .object({
    name: exports_external.string(),
    description: exports_external.optional(exports_external.string()),
    required: exports_external.optional(exports_external.boolean())
  })
  .passthrough();
var PromptSchema = BaseMetadataSchema.extend({
  description: exports_external.optional(exports_external.string()),
  arguments: exports_external.optional(
    exports_external.array(PromptArgumentSchema)
  ),
  _meta: exports_external.optional(exports_external.object({}).passthrough())
});
var ListPromptsRequestSchema = PaginatedRequestSchema.extend({
  method: exports_external.literal("prompts/list")
});
var ListPromptsResultSchema = PaginatedResultSchema.extend({
  prompts: exports_external.array(PromptSchema)
});
var GetPromptRequestSchema = RequestSchema.extend({
  method: exports_external.literal("prompts/get"),
  params: BaseRequestParamsSchema.extend({
    name: exports_external.string(),
    arguments: exports_external.optional(
      exports_external.record(exports_external.string())
    )
  })
});
var TextContentSchema = exports_external
  .object({
    type: exports_external.literal("text"),
    text: exports_external.string(),
    _meta: exports_external.optional(exports_external.object({}).passthrough())
  })
  .passthrough();
var ImageContentSchema = exports_external
  .object({
    type: exports_external.literal("image"),
    data: Base64Schema,
    mimeType: exports_external.string(),
    _meta: exports_external.optional(exports_external.object({}).passthrough())
  })
  .passthrough();
var AudioContentSchema = exports_external
  .object({
    type: exports_external.literal("audio"),
    data: Base64Schema,
    mimeType: exports_external.string(),
    _meta: exports_external.optional(exports_external.object({}).passthrough())
  })
  .passthrough();
var EmbeddedResourceSchema = exports_external
  .object({
    type: exports_external.literal("resource"),
    resource: exports_external.union([
      TextResourceContentsSchema,
      BlobResourceContentsSchema
    ]),
    _meta: exports_external.optional(exports_external.object({}).passthrough())
  })
  .passthrough();
var ResourceLinkSchema = ResourceSchema.extend({
  type: exports_external.literal("resource_link")
});
var ContentBlockSchema = exports_external.union([
  TextContentSchema,
  ImageContentSchema,
  AudioContentSchema,
  ResourceLinkSchema,
  EmbeddedResourceSchema
]);
var PromptMessageSchema = exports_external
  .object({
    role: exports_external.enum(["user", "assistant"]),
    content: ContentBlockSchema
  })
  .passthrough();
var GetPromptResultSchema = ResultSchema.extend({
  description: exports_external.optional(exports_external.string()),
  messages: exports_external.array(PromptMessageSchema)
});
var PromptListChangedNotificationSchema = NotificationSchema.extend({
  method: exports_external.literal("notifications/prompts/list_changed")
});
var ToolAnnotationsSchema = exports_external
  .object({
    title: exports_external.optional(exports_external.string()),
    readOnlyHint: exports_external.optional(exports_external.boolean()),
    destructiveHint: exports_external.optional(exports_external.boolean()),
    idempotentHint: exports_external.optional(exports_external.boolean()),
    openWorldHint: exports_external.optional(exports_external.boolean())
  })
  .passthrough();
var ToolSchema = BaseMetadataSchema.extend({
  description: exports_external.optional(exports_external.string()),
  inputSchema: exports_external
    .object({
      type: exports_external.literal("object"),
      properties: exports_external.optional(
        exports_external.object({}).passthrough()
      ),
      required: exports_external.optional(
        exports_external.array(exports_external.string())
      )
    })
    .passthrough(),
  outputSchema: exports_external.optional(
    exports_external
      .object({
        type: exports_external.literal("object"),
        properties: exports_external.optional(
          exports_external.object({}).passthrough()
        ),
        required: exports_external.optional(
          exports_external.array(exports_external.string())
        )
      })
      .passthrough()
  ),
  annotations: exports_external.optional(ToolAnnotationsSchema),
  _meta: exports_external.optional(exports_external.object({}).passthrough())
});
var ListToolsRequestSchema = PaginatedRequestSchema.extend({
  method: exports_external.literal("tools/list")
});
var ListToolsResultSchema = PaginatedResultSchema.extend({
  tools: exports_external.array(ToolSchema)
});
var CallToolResultSchema = ResultSchema.extend({
  content: exports_external.array(ContentBlockSchema).default([]),
  structuredContent: exports_external.object({}).passthrough().optional(),
  isError: exports_external.optional(exports_external.boolean())
});
var CompatibilityCallToolResultSchema = CallToolResultSchema.or(
  ResultSchema.extend({
    toolResult: exports_external.unknown()
  })
);
var CallToolRequestSchema = RequestSchema.extend({
  method: exports_external.literal("tools/call"),
  params: BaseRequestParamsSchema.extend({
    name: exports_external.string(),
    arguments: exports_external.optional(
      exports_external.record(exports_external.unknown())
    )
  })
});
var ToolListChangedNotificationSchema = NotificationSchema.extend({
  method: exports_external.literal("notifications/tools/list_changed")
});
var LoggingLevelSchema = exports_external.enum([
  "debug",
  "info",
  "notice",
  "warning",
  "error",
  "critical",
  "alert",
  "emergency"
]);
var SetLevelRequestSchema = RequestSchema.extend({
  method: exports_external.literal("logging/setLevel"),
  params: BaseRequestParamsSchema.extend({
    level: LoggingLevelSchema
  })
});
var LoggingMessageNotificationSchema = NotificationSchema.extend({
  method: exports_external.literal("notifications/message"),
  params: BaseNotificationParamsSchema.extend({
    level: LoggingLevelSchema,
    logger: exports_external.optional(exports_external.string()),
    data: exports_external.unknown()
  })
});
var ModelHintSchema = exports_external
  .object({
    name: exports_external.string().optional()
  })
  .passthrough();
var ModelPreferencesSchema = exports_external
  .object({
    hints: exports_external.optional(exports_external.array(ModelHintSchema)),
    costPriority: exports_external.optional(
      exports_external.number().min(0).max(1)
    ),
    speedPriority: exports_external.optional(
      exports_external.number().min(0).max(1)
    ),
    intelligencePriority: exports_external.optional(
      exports_external.number().min(0).max(1)
    )
  })
  .passthrough();
var SamplingMessageSchema = exports_external
  .object({
    role: exports_external.enum(["user", "assistant"]),
    content: exports_external.union([
      TextContentSchema,
      ImageContentSchema,
      AudioContentSchema
    ])
  })
  .passthrough();
var CreateMessageRequestSchema = RequestSchema.extend({
  method: exports_external.literal("sampling/createMessage"),
  params: BaseRequestParamsSchema.extend({
    messages: exports_external.array(SamplingMessageSchema),
    systemPrompt: exports_external.optional(exports_external.string()),
    includeContext: exports_external.optional(
      exports_external.enum(["none", "thisServer", "allServers"])
    ),
    temperature: exports_external.optional(exports_external.number()),
    maxTokens: exports_external.number().int(),
    stopSequences: exports_external.optional(
      exports_external.array(exports_external.string())
    ),
    metadata: exports_external.optional(
      exports_external.object({}).passthrough()
    ),
    modelPreferences: exports_external.optional(ModelPreferencesSchema)
  })
});
var CreateMessageResultSchema = ResultSchema.extend({
  model: exports_external.string(),
  stopReason: exports_external.optional(
    exports_external
      .enum(["endTurn", "stopSequence", "maxTokens"])
      .or(exports_external.string())
  ),
  role: exports_external.enum(["user", "assistant"]),
  content: exports_external.discriminatedUnion("type", [
    TextContentSchema,
    ImageContentSchema,
    AudioContentSchema
  ])
});
var BooleanSchemaSchema = exports_external
  .object({
    type: exports_external.literal("boolean"),
    title: exports_external.optional(exports_external.string()),
    description: exports_external.optional(exports_external.string()),
    default: exports_external.optional(exports_external.boolean())
  })
  .passthrough();
var StringSchemaSchema = exports_external
  .object({
    type: exports_external.literal("string"),
    title: exports_external.optional(exports_external.string()),
    description: exports_external.optional(exports_external.string()),
    minLength: exports_external.optional(exports_external.number()),
    maxLength: exports_external.optional(exports_external.number()),
    format: exports_external.optional(
      exports_external.enum(["email", "uri", "date", "date-time"])
    )
  })
  .passthrough();
var NumberSchemaSchema = exports_external
  .object({
    type: exports_external.enum(["number", "integer"]),
    title: exports_external.optional(exports_external.string()),
    description: exports_external.optional(exports_external.string()),
    minimum: exports_external.optional(exports_external.number()),
    maximum: exports_external.optional(exports_external.number())
  })
  .passthrough();
var EnumSchemaSchema = exports_external
  .object({
    type: exports_external.literal("string"),
    title: exports_external.optional(exports_external.string()),
    description: exports_external.optional(exports_external.string()),
    enum: exports_external.array(exports_external.string()),
    enumNames: exports_external.optional(
      exports_external.array(exports_external.string())
    )
  })
  .passthrough();
var PrimitiveSchemaDefinitionSchema = exports_external.union([
  BooleanSchemaSchema,
  StringSchemaSchema,
  NumberSchemaSchema,
  EnumSchemaSchema
]);
var ElicitRequestSchema = RequestSchema.extend({
  method: exports_external.literal("elicitation/create"),
  params: BaseRequestParamsSchema.extend({
    message: exports_external.string(),
    requestedSchema: exports_external
      .object({
        type: exports_external.literal("object"),
        properties: exports_external.record(
          exports_external.string(),
          PrimitiveSchemaDefinitionSchema
        ),
        required: exports_external.optional(
          exports_external.array(exports_external.string())
        )
      })
      .passthrough()
  })
});
var ElicitResultSchema = ResultSchema.extend({
  action: exports_external.enum(["accept", "decline", "cancel"]),
  content: exports_external.optional(
    exports_external.record(
      exports_external.string(),
      exports_external.unknown()
    )
  )
});
var ResourceTemplateReferenceSchema = exports_external
  .object({
    type: exports_external.literal("ref/resource"),
    uri: exports_external.string()
  })
  .passthrough();
var PromptReferenceSchema = exports_external
  .object({
    type: exports_external.literal("ref/prompt"),
    name: exports_external.string()
  })
  .passthrough();
var CompleteRequestSchema = RequestSchema.extend({
  method: exports_external.literal("completion/complete"),
  params: BaseRequestParamsSchema.extend({
    ref: exports_external.union([
      PromptReferenceSchema,
      ResourceTemplateReferenceSchema
    ]),
    argument: exports_external
      .object({
        name: exports_external.string(),
        value: exports_external.string()
      })
      .passthrough(),
    context: exports_external.optional(
      exports_external.object({
        arguments: exports_external.optional(
          exports_external.record(
            exports_external.string(),
            exports_external.string()
          )
        )
      })
    )
  })
});
var CompleteResultSchema = ResultSchema.extend({
  completion: exports_external
    .object({
      values: exports_external.array(exports_external.string()).max(100),
      total: exports_external.optional(exports_external.number().int()),
      hasMore: exports_external.optional(exports_external.boolean())
    })
    .passthrough()
});
var RootSchema = exports_external
  .object({
    uri: exports_external.string().startsWith("file://"),
    name: exports_external.optional(exports_external.string()),
    _meta: exports_external.optional(exports_external.object({}).passthrough())
  })
  .passthrough();
var ListRootsRequestSchema = RequestSchema.extend({
  method: exports_external.literal("roots/list")
});
var ListRootsResultSchema = ResultSchema.extend({
  roots: exports_external.array(RootSchema)
});
var RootsListChangedNotificationSchema = NotificationSchema.extend({
  method: exports_external.literal("notifications/roots/list_changed")
});
var ClientRequestSchema = exports_external.union([
  PingRequestSchema,
  InitializeRequestSchema,
  CompleteRequestSchema,
  SetLevelRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ReadResourceRequestSchema,
  SubscribeRequestSchema,
  UnsubscribeRequestSchema,
  CallToolRequestSchema,
  ListToolsRequestSchema
]);
var ClientNotificationSchema = exports_external.union([
  CancelledNotificationSchema,
  ProgressNotificationSchema,
  InitializedNotificationSchema,
  RootsListChangedNotificationSchema
]);
var ClientResultSchema = exports_external.union([
  EmptyResultSchema,
  CreateMessageResultSchema,
  ElicitResultSchema,
  ListRootsResultSchema
]);
var ServerRequestSchema = exports_external.union([
  PingRequestSchema,
  CreateMessageRequestSchema,
  ElicitRequestSchema,
  ListRootsRequestSchema
]);
var ServerNotificationSchema = exports_external.union([
  CancelledNotificationSchema,
  ProgressNotificationSchema,
  LoggingMessageNotificationSchema,
  ResourceUpdatedNotificationSchema,
  ResourceListChangedNotificationSchema,
  ToolListChangedNotificationSchema,
  PromptListChangedNotificationSchema
]);
var ServerResultSchema = exports_external.union([
  EmptyResultSchema,
  InitializeResultSchema,
  CompleteResultSchema,
  GetPromptResultSchema,
  ListPromptsResultSchema,
  ListResourcesResultSchema,
  ListResourceTemplatesResultSchema,
  ReadResourceResultSchema,
  CallToolResultSchema,
  ListToolsResultSchema
]);

class McpError extends Error {
  constructor(code, message, data) {
    super(`MCP error ${code}: ${message}`);
    this.code = code;
    this.data = data;
    this.name = "McpError";
  }
}

// node_modules/@modelcontextprotocol/sdk/dist/esm/shared/protocol.js
var DEFAULT_REQUEST_TIMEOUT_MSEC = 60000;

class Protocol {
  constructor(_options) {
    this._options = _options;
    this._requestMessageId = 0;
    this._requestHandlers = new Map();
    this._requestHandlerAbortControllers = new Map();
    this._notificationHandlers = new Map();
    this._responseHandlers = new Map();
    this._progressHandlers = new Map();
    this._timeoutInfo = new Map();
    this._pendingDebouncedNotifications = new Set();
    this.setNotificationHandler(CancelledNotificationSchema, (notification) => {
      const controller = this._requestHandlerAbortControllers.get(
        notification.params.requestId
      );
      controller === null ||
        controller === undefined ||
        controller.abort(notification.params.reason);
    });
    this.setNotificationHandler(ProgressNotificationSchema, (notification) => {
      this._onprogress(notification);
    });
    this.setRequestHandler(PingRequestSchema, (_request) => ({}));
  }
  _setupTimeout(
    messageId,
    timeout,
    maxTotalTimeout,
    onTimeout,
    resetTimeoutOnProgress = false
  ) {
    this._timeoutInfo.set(messageId, {
      timeoutId: setTimeout(onTimeout, timeout),
      startTime: Date.now(),
      timeout,
      maxTotalTimeout,
      resetTimeoutOnProgress,
      onTimeout
    });
  }
  _resetTimeout(messageId) {
    const info = this._timeoutInfo.get(messageId);
    if (!info) return false;
    const totalElapsed = Date.now() - info.startTime;
    if (info.maxTotalTimeout && totalElapsed >= info.maxTotalTimeout) {
      this._timeoutInfo.delete(messageId);
      throw new McpError(
        ErrorCode.RequestTimeout,
        "Maximum total timeout exceeded",
        { maxTotalTimeout: info.maxTotalTimeout, totalElapsed }
      );
    }
    clearTimeout(info.timeoutId);
    info.timeoutId = setTimeout(info.onTimeout, info.timeout);
    return true;
  }
  _cleanupTimeout(messageId) {
    const info = this._timeoutInfo.get(messageId);
    if (info) {
      clearTimeout(info.timeoutId);
      this._timeoutInfo.delete(messageId);
    }
  }
  async connect(transport) {
    var _a, _b, _c;
    this._transport = transport;
    const _onclose =
      (_a = this.transport) === null || _a === undefined
        ? undefined
        : _a.onclose;
    this._transport.onclose = () => {
      _onclose === null || _onclose === undefined || _onclose();
      this._onclose();
    };
    const _onerror =
      (_b = this.transport) === null || _b === undefined
        ? undefined
        : _b.onerror;
    this._transport.onerror = (error) => {
      _onerror === null || _onerror === undefined || _onerror(error);
      this._onerror(error);
    };
    const _onmessage =
      (_c = this._transport) === null || _c === undefined
        ? undefined
        : _c.onmessage;
    this._transport.onmessage = (message, extra) => {
      _onmessage === null ||
        _onmessage === undefined ||
        _onmessage(message, extra);
      if (isJSONRPCResponse(message) || isJSONRPCError(message)) {
        this._onresponse(message);
      } else if (isJSONRPCRequest(message)) {
        this._onrequest(message, extra);
      } else if (isJSONRPCNotification(message)) {
        this._onnotification(message);
      } else {
        this._onerror(
          new Error(`Unknown message type: ${JSON.stringify(message)}`)
        );
      }
    };
    await this._transport.start();
  }
  _onclose() {
    var _a;
    const responseHandlers = this._responseHandlers;
    this._responseHandlers = new Map();
    this._progressHandlers.clear();
    this._pendingDebouncedNotifications.clear();
    this._transport = undefined;
    (_a = this.onclose) === null || _a === undefined || _a.call(this);
    const error = new McpError(ErrorCode.ConnectionClosed, "Connection closed");
    for (const handler of responseHandlers.values()) {
      handler(error);
    }
  }
  _onerror(error) {
    var _a;
    (_a = this.onerror) === null || _a === undefined || _a.call(this, error);
  }
  _onnotification(notification) {
    var _a;
    const handler =
      (_a = this._notificationHandlers.get(notification.method)) !== null &&
      _a !== undefined
        ? _a
        : this.fallbackNotificationHandler;
    if (handler === undefined) {
      return;
    }
    Promise.resolve()
      .then(() => handler(notification))
      .catch((error) =>
        this._onerror(
          new Error(`Uncaught error in notification handler: ${error}`)
        )
      );
  }
  _onrequest(request, extra) {
    var _a, _b, _c, _d;
    const handler =
      (_a = this._requestHandlers.get(request.method)) !== null &&
      _a !== undefined
        ? _a
        : this.fallbackRequestHandler;
    if (handler === undefined) {
      (_b = this._transport) === null ||
        _b === undefined ||
        _b
          .send({
            jsonrpc: "2.0",
            id: request.id,
            error: {
              code: ErrorCode.MethodNotFound,
              message: "Method not found"
            }
          })
          .catch((error) =>
            this._onerror(
              new Error(`Failed to send an error response: ${error}`)
            )
          );
      return;
    }
    const abortController = new AbortController();
    this._requestHandlerAbortControllers.set(request.id, abortController);
    const fullExtra = {
      signal: abortController.signal,
      sessionId:
        (_c = this._transport) === null || _c === undefined
          ? undefined
          : _c.sessionId,
      _meta:
        (_d = request.params) === null || _d === undefined
          ? undefined
          : _d._meta,
      sendNotification: (notification) =>
        this.notification(notification, { relatedRequestId: request.id }),
      sendRequest: (r, resultSchema, options) =>
        this.request(r, resultSchema, {
          ...options,
          relatedRequestId: request.id
        }),
      authInfo:
        extra === null || extra === undefined ? undefined : extra.authInfo,
      requestId: request.id,
      requestInfo:
        extra === null || extra === undefined ? undefined : extra.requestInfo
    };
    Promise.resolve()
      .then(() => handler(request, fullExtra))
      .then(
        (result) => {
          var _a2;
          if (abortController.signal.aborted) {
            return;
          }
          return (_a2 = this._transport) === null || _a2 === undefined
            ? undefined
            : _a2.send({
                result,
                jsonrpc: "2.0",
                id: request.id
              });
        },
        (error) => {
          var _a2, _b2;
          if (abortController.signal.aborted) {
            return;
          }
          return (_a2 = this._transport) === null || _a2 === undefined
            ? undefined
            : _a2.send({
                jsonrpc: "2.0",
                id: request.id,
                error: {
                  code: Number.isSafeInteger(error["code"])
                    ? error["code"]
                    : ErrorCode.InternalError,
                  message:
                    (_b2 = error.message) !== null && _b2 !== undefined
                      ? _b2
                      : "Internal error"
                }
              });
        }
      )
      .catch((error) =>
        this._onerror(new Error(`Failed to send response: ${error}`))
      )
      .finally(() => {
        this._requestHandlerAbortControllers.delete(request.id);
      });
  }
  _onprogress(notification) {
    const { progressToken, ...params } = notification.params;
    const messageId = Number(progressToken);
    const handler = this._progressHandlers.get(messageId);
    if (!handler) {
      this._onerror(
        new Error(
          `Received a progress notification for an unknown token: ${JSON.stringify(notification)}`
        )
      );
      return;
    }
    const responseHandler = this._responseHandlers.get(messageId);
    const timeoutInfo = this._timeoutInfo.get(messageId);
    if (timeoutInfo && responseHandler && timeoutInfo.resetTimeoutOnProgress) {
      try {
        this._resetTimeout(messageId);
      } catch (error) {
        responseHandler(error);
        return;
      }
    }
    handler(params);
  }
  _onresponse(response) {
    const messageId = Number(response.id);
    const handler = this._responseHandlers.get(messageId);
    if (handler === undefined) {
      this._onerror(
        new Error(
          `Received a response for an unknown message ID: ${JSON.stringify(response)}`
        )
      );
      return;
    }
    this._responseHandlers.delete(messageId);
    this._progressHandlers.delete(messageId);
    this._cleanupTimeout(messageId);
    if (isJSONRPCResponse(response)) {
      handler(response);
    } else {
      const error = new McpError(
        response.error.code,
        response.error.message,
        response.error.data
      );
      handler(error);
    }
  }
  get transport() {
    return this._transport;
  }
  async close() {
    var _a;
    await ((_a = this._transport) === null || _a === undefined
      ? undefined
      : _a.close());
  }
  request(request, resultSchema, options) {
    const { relatedRequestId, resumptionToken, onresumptiontoken } =
      options !== null && options !== undefined ? options : {};
    return new Promise((resolve, reject) => {
      var _a, _b, _c, _d, _e, _f;
      if (!this._transport) {
        reject(new Error("Not connected"));
        return;
      }
      if (
        ((_a = this._options) === null || _a === undefined
          ? undefined
          : _a.enforceStrictCapabilities) === true
      ) {
        this.assertCapabilityForMethod(request.method);
      }
      (_b =
        options === null || options === undefined
          ? undefined
          : options.signal) === null ||
        _b === undefined ||
        _b.throwIfAborted();
      const messageId = this._requestMessageId++;
      const jsonrpcRequest = {
        ...request,
        jsonrpc: "2.0",
        id: messageId
      };
      if (
        options === null || options === undefined
          ? undefined
          : options.onprogress
      ) {
        this._progressHandlers.set(messageId, options.onprogress);
        jsonrpcRequest.params = {
          ...request.params,
          _meta: {
            ...(((_c = request.params) === null || _c === undefined
              ? undefined
              : _c._meta) || {}),
            progressToken: messageId
          }
        };
      }
      const cancel = (reason) => {
        var _a2;
        this._responseHandlers.delete(messageId);
        this._progressHandlers.delete(messageId);
        this._cleanupTimeout(messageId);
        (_a2 = this._transport) === null ||
          _a2 === undefined ||
          _a2
            .send(
              {
                jsonrpc: "2.0",
                method: "notifications/cancelled",
                params: {
                  requestId: messageId,
                  reason: String(reason)
                }
              },
              { relatedRequestId, resumptionToken, onresumptiontoken }
            )
            .catch((error) =>
              this._onerror(new Error(`Failed to send cancellation: ${error}`))
            );
        reject(reason);
      };
      this._responseHandlers.set(messageId, (response) => {
        var _a2;
        if (
          (_a2 =
            options === null || options === undefined
              ? undefined
              : options.signal) === null || _a2 === undefined
            ? undefined
            : _a2.aborted
        ) {
          return;
        }
        if (response instanceof Error) {
          return reject(response);
        }
        try {
          const result = resultSchema.parse(response.result);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      (_d =
        options === null || options === undefined
          ? undefined
          : options.signal) === null ||
        _d === undefined ||
        _d.addEventListener("abort", () => {
          var _a2;
          cancel(
            (_a2 =
              options === null || options === undefined
                ? undefined
                : options.signal) === null || _a2 === undefined
              ? undefined
              : _a2.reason
          );
        });
      const timeout =
        (_e =
          options === null || options === undefined
            ? undefined
            : options.timeout) !== null && _e !== undefined
          ? _e
          : DEFAULT_REQUEST_TIMEOUT_MSEC;
      const timeoutHandler = () =>
        cancel(
          new McpError(ErrorCode.RequestTimeout, "Request timed out", {
            timeout
          })
        );
      this._setupTimeout(
        messageId,
        timeout,
        options === null || options === undefined
          ? undefined
          : options.maxTotalTimeout,
        timeoutHandler,
        (_f =
          options === null || options === undefined
            ? undefined
            : options.resetTimeoutOnProgress) !== null && _f !== undefined
          ? _f
          : false
      );
      this._transport
        .send(jsonrpcRequest, {
          relatedRequestId,
          resumptionToken,
          onresumptiontoken
        })
        .catch((error) => {
          this._cleanupTimeout(messageId);
          reject(error);
        });
    });
  }
  async notification(notification, options) {
    var _a, _b;
    if (!this._transport) {
      throw new Error("Not connected");
    }
    this.assertNotificationCapability(notification.method);
    const debouncedMethods =
      (_b =
        (_a = this._options) === null || _a === undefined
          ? undefined
          : _a.debouncedNotificationMethods) !== null && _b !== undefined
        ? _b
        : [];
    const canDebounce =
      debouncedMethods.includes(notification.method) &&
      !notification.params &&
      !(options === null || options === undefined
        ? undefined
        : options.relatedRequestId);
    if (canDebounce) {
      if (this._pendingDebouncedNotifications.has(notification.method)) {
        return;
      }
      this._pendingDebouncedNotifications.add(notification.method);
      Promise.resolve().then(() => {
        var _a2;
        this._pendingDebouncedNotifications.delete(notification.method);
        if (!this._transport) {
          return;
        }
        const jsonrpcNotification2 = {
          ...notification,
          jsonrpc: "2.0"
        };
        (_a2 = this._transport) === null ||
          _a2 === undefined ||
          _a2
            .send(jsonrpcNotification2, options)
            .catch((error) => this._onerror(error));
      });
      return;
    }
    const jsonrpcNotification = {
      ...notification,
      jsonrpc: "2.0"
    };
    await this._transport.send(jsonrpcNotification, options);
  }
  setRequestHandler(requestSchema, handler) {
    const method = requestSchema.shape.method.value;
    this.assertRequestHandlerCapability(method);
    this._requestHandlers.set(method, (request, extra) => {
      return Promise.resolve(handler(requestSchema.parse(request), extra));
    });
  }
  removeRequestHandler(method) {
    this._requestHandlers.delete(method);
  }
  assertCanSetRequestHandler(method) {
    if (this._requestHandlers.has(method)) {
      throw new Error(
        `A request handler for ${method} already exists, which would be overridden`
      );
    }
  }
  setNotificationHandler(notificationSchema, handler) {
    this._notificationHandlers.set(
      notificationSchema.shape.method.value,
      (notification) =>
        Promise.resolve(handler(notificationSchema.parse(notification)))
    );
  }
  removeNotificationHandler(method) {
    this._notificationHandlers.delete(method);
  }
}
function mergeCapabilities(base, additional) {
  return Object.entries(additional).reduce(
    (acc, [key, value]) => {
      if (value && typeof value === "object") {
        acc[key] = acc[key] ? { ...acc[key], ...value } : value;
      } else {
        acc[key] = value;
      }
      return acc;
    },
    { ...base }
  );
}

// node_modules/@modelcontextprotocol/sdk/dist/esm/server/index.js
var import_ajv = __toESM(require_ajv(), 1);

class Server extends Protocol {
  constructor(_serverInfo, options) {
    var _a;
    super(options);
    this._serverInfo = _serverInfo;
    this._capabilities =
      (_a =
        options === null || options === undefined
          ? undefined
          : options.capabilities) !== null && _a !== undefined
        ? _a
        : {};
    this._instructions =
      options === null || options === undefined
        ? undefined
        : options.instructions;
    this.setRequestHandler(InitializeRequestSchema, (request) =>
      this._oninitialize(request)
    );
    this.setNotificationHandler(InitializedNotificationSchema, () => {
      var _a2;
      return (_a2 = this.oninitialized) === null || _a2 === undefined
        ? undefined
        : _a2.call(this);
    });
  }
  registerCapabilities(capabilities) {
    if (this.transport) {
      throw new Error(
        "Cannot register capabilities after connecting to transport"
      );
    }
    this._capabilities = mergeCapabilities(this._capabilities, capabilities);
  }
  assertCapabilityForMethod(method) {
    var _a, _b, _c;
    switch (method) {
      case "sampling/createMessage":
        if (
          !((_a = this._clientCapabilities) === null || _a === undefined
            ? undefined
            : _a.sampling)
        ) {
          throw new Error(
            `Client does not support sampling (required for ${method})`
          );
        }
        break;
      case "elicitation/create":
        if (
          !((_b = this._clientCapabilities) === null || _b === undefined
            ? undefined
            : _b.elicitation)
        ) {
          throw new Error(
            `Client does not support elicitation (required for ${method})`
          );
        }
        break;
      case "roots/list":
        if (
          !((_c = this._clientCapabilities) === null || _c === undefined
            ? undefined
            : _c.roots)
        ) {
          throw new Error(
            `Client does not support listing roots (required for ${method})`
          );
        }
        break;
      case "ping":
        break;
    }
  }
  assertNotificationCapability(method) {
    switch (method) {
      case "notifications/message":
        if (!this._capabilities.logging) {
          throw new Error(
            `Server does not support logging (required for ${method})`
          );
        }
        break;
      case "notifications/resources/updated":
      case "notifications/resources/list_changed":
        if (!this._capabilities.resources) {
          throw new Error(
            `Server does not support notifying about resources (required for ${method})`
          );
        }
        break;
      case "notifications/tools/list_changed":
        if (!this._capabilities.tools) {
          throw new Error(
            `Server does not support notifying of tool list changes (required for ${method})`
          );
        }
        break;
      case "notifications/prompts/list_changed":
        if (!this._capabilities.prompts) {
          throw new Error(
            `Server does not support notifying of prompt list changes (required for ${method})`
          );
        }
        break;
      case "notifications/cancelled":
        break;
      case "notifications/progress":
        break;
    }
  }
  assertRequestHandlerCapability(method) {
    switch (method) {
      case "sampling/createMessage":
        if (!this._capabilities.sampling) {
          throw new Error(
            `Server does not support sampling (required for ${method})`
          );
        }
        break;
      case "logging/setLevel":
        if (!this._capabilities.logging) {
          throw new Error(
            `Server does not support logging (required for ${method})`
          );
        }
        break;
      case "prompts/get":
      case "prompts/list":
        if (!this._capabilities.prompts) {
          throw new Error(
            `Server does not support prompts (required for ${method})`
          );
        }
        break;
      case "resources/list":
      case "resources/templates/list":
      case "resources/read":
        if (!this._capabilities.resources) {
          throw new Error(
            `Server does not support resources (required for ${method})`
          );
        }
        break;
      case "tools/call":
      case "tools/list":
        if (!this._capabilities.tools) {
          throw new Error(
            `Server does not support tools (required for ${method})`
          );
        }
        break;
      case "ping":
      case "initialize":
        break;
    }
  }
  async _oninitialize(request) {
    const requestedVersion = request.params.protocolVersion;
    this._clientCapabilities = request.params.capabilities;
    this._clientVersion = request.params.clientInfo;
    const protocolVersion = SUPPORTED_PROTOCOL_VERSIONS.includes(
      requestedVersion
    )
      ? requestedVersion
      : LATEST_PROTOCOL_VERSION;
    return {
      protocolVersion,
      capabilities: this.getCapabilities(),
      serverInfo: this._serverInfo,
      ...(this._instructions && { instructions: this._instructions })
    };
  }
  getClientCapabilities() {
    return this._clientCapabilities;
  }
  getClientVersion() {
    return this._clientVersion;
  }
  getCapabilities() {
    return this._capabilities;
  }
  async ping() {
    return this.request({ method: "ping" }, EmptyResultSchema);
  }
  async createMessage(params, options) {
    return this.request(
      { method: "sampling/createMessage", params },
      CreateMessageResultSchema,
      options
    );
  }
  async elicitInput(params, options) {
    const result = await this.request(
      { method: "elicitation/create", params },
      ElicitResultSchema,
      options
    );
    if (result.action === "accept" && result.content) {
      try {
        const ajv = new import_ajv.default();
        const validate = ajv.compile(params.requestedSchema);
        const isValid2 = validate(result.content);
        if (!isValid2) {
          throw new McpError(
            ErrorCode.InvalidParams,
            `Elicitation response content does not match requested schema: ${ajv.errorsText(validate.errors)}`
          );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Error validating elicitation response: ${error}`
        );
      }
    }
    return result;
  }
  async listRoots(params, options) {
    return this.request(
      { method: "roots/list", params },
      ListRootsResultSchema,
      options
    );
  }
  async sendLoggingMessage(params) {
    return this.notification({ method: "notifications/message", params });
  }
  async sendResourceUpdated(params) {
    return this.notification({
      method: "notifications/resources/updated",
      params
    });
  }
  async sendResourceListChanged() {
    return this.notification({
      method: "notifications/resources/list_changed"
    });
  }
  async sendToolListChanged() {
    return this.notification({ method: "notifications/tools/list_changed" });
  }
  async sendPromptListChanged() {
    return this.notification({ method: "notifications/prompts/list_changed" });
  }
}

// node_modules/@modelcontextprotocol/sdk/dist/esm/server/stdio.js
import process2 from "node:process";

// node_modules/@modelcontextprotocol/sdk/dist/esm/shared/stdio.js
class ReadBuffer {
  append(chunk) {
    this._buffer = this._buffer ? Buffer.concat([this._buffer, chunk]) : chunk;
  }
  readMessage() {
    if (!this._buffer) {
      return null;
    }
    const index = this._buffer.indexOf(`
`);
    if (index === -1) {
      return null;
    }
    const line = this._buffer.toString("utf8", 0, index).replace(/\r$/, "");
    this._buffer = this._buffer.subarray(index + 1);
    return deserializeMessage(line);
  }
  clear() {
    this._buffer = undefined;
  }
}
function deserializeMessage(line) {
  return JSONRPCMessageSchema.parse(JSON.parse(line));
}
function serializeMessage(message) {
  return (
    JSON.stringify(message) +
    `
`
  );
}

// node_modules/@modelcontextprotocol/sdk/dist/esm/server/stdio.js
class StdioServerTransport {
  constructor(_stdin = process2.stdin, _stdout = process2.stdout) {
    this._stdin = _stdin;
    this._stdout = _stdout;
    this._readBuffer = new ReadBuffer();
    this._started = false;
    this._ondata = (chunk) => {
      this._readBuffer.append(chunk);
      this.processReadBuffer();
    };
    this._onerror = (error) => {
      var _a;
      (_a = this.onerror) === null || _a === undefined || _a.call(this, error);
    };
  }
  async start() {
    if (this._started) {
      throw new Error(
        "StdioServerTransport already started! If using Server class, note that connect() calls start() automatically."
      );
    }
    this._started = true;
    this._stdin.on("data", this._ondata);
    this._stdin.on("error", this._onerror);
  }
  processReadBuffer() {
    var _a, _b;
    while (true) {
      try {
        const message = this._readBuffer.readMessage();
        if (message === null) {
          break;
        }
        (_a = this.onmessage) === null ||
          _a === undefined ||
          _a.call(this, message);
      } catch (error) {
        (_b = this.onerror) === null ||
          _b === undefined ||
          _b.call(this, error);
      }
    }
  }
  async close() {
    var _a;
    this._stdin.off("data", this._ondata);
    this._stdin.off("error", this._onerror);
    const remainingDataListeners = this._stdin.listenerCount("data");
    if (remainingDataListeners === 0) {
      this._stdin.pause();
    }
    this._readBuffer.clear();
    (_a = this.onclose) === null || _a === undefined || _a.call(this);
  }
  send(message) {
    return new Promise((resolve) => {
      const json = serializeMessage(message);
      if (this._stdout.write(json)) {
        resolve();
      } else {
        this._stdout.once("drain", resolve);
      }
    });
  }
}

// node_modules/chalk/source/vendor/ansi-styles/index.js
var ANSI_BACKGROUND_OFFSET = 10;
var wrapAnsi16 =
  (offset = 0) =>
  (code) =>
    `\x1B[${code + offset}m`;
var wrapAnsi256 =
  (offset = 0) =>
  (code) =>
    `\x1B[${38 + offset};5;${code}m`;
var wrapAnsi16m =
  (offset = 0) =>
  (red, green, blue) =>
    `\x1B[${38 + offset};2;${red};${green};${blue}m`;
var styles = {
  modifier: {
    reset: [0, 0],
    bold: [1, 22],
    dim: [2, 22],
    italic: [3, 23],
    underline: [4, 24],
    overline: [53, 55],
    inverse: [7, 27],
    hidden: [8, 28],
    strikethrough: [9, 29]
  },
  color: {
    black: [30, 39],
    red: [31, 39],
    green: [32, 39],
    yellow: [33, 39],
    blue: [34, 39],
    magenta: [35, 39],
    cyan: [36, 39],
    white: [37, 39],
    blackBright: [90, 39],
    gray: [90, 39],
    grey: [90, 39],
    redBright: [91, 39],
    greenBright: [92, 39],
    yellowBright: [93, 39],
    blueBright: [94, 39],
    magentaBright: [95, 39],
    cyanBright: [96, 39],
    whiteBright: [97, 39]
  },
  bgColor: {
    bgBlack: [40, 49],
    bgRed: [41, 49],
    bgGreen: [42, 49],
    bgYellow: [43, 49],
    bgBlue: [44, 49],
    bgMagenta: [45, 49],
    bgCyan: [46, 49],
    bgWhite: [47, 49],
    bgBlackBright: [100, 49],
    bgGray: [100, 49],
    bgGrey: [100, 49],
    bgRedBright: [101, 49],
    bgGreenBright: [102, 49],
    bgYellowBright: [103, 49],
    bgBlueBright: [104, 49],
    bgMagentaBright: [105, 49],
    bgCyanBright: [106, 49],
    bgWhiteBright: [107, 49]
  }
};
var modifierNames = Object.keys(styles.modifier);
var foregroundColorNames = Object.keys(styles.color);
var backgroundColorNames = Object.keys(styles.bgColor);
var colorNames = [...foregroundColorNames, ...backgroundColorNames];
function assembleStyles() {
  const codes = new Map();
  for (const [groupName, group] of Object.entries(styles)) {
    for (const [styleName, style] of Object.entries(group)) {
      styles[styleName] = {
        open: `\x1B[${style[0]}m`,
        close: `\x1B[${style[1]}m`
      };
      group[styleName] = styles[styleName];
      codes.set(style[0], style[1]);
    }
    Object.defineProperty(styles, groupName, {
      value: group,
      enumerable: false
    });
  }
  Object.defineProperty(styles, "codes", {
    value: codes,
    enumerable: false
  });
  styles.color.close = "\x1B[39m";
  styles.bgColor.close = "\x1B[49m";
  styles.color.ansi = wrapAnsi16();
  styles.color.ansi256 = wrapAnsi256();
  styles.color.ansi16m = wrapAnsi16m();
  styles.bgColor.ansi = wrapAnsi16(ANSI_BACKGROUND_OFFSET);
  styles.bgColor.ansi256 = wrapAnsi256(ANSI_BACKGROUND_OFFSET);
  styles.bgColor.ansi16m = wrapAnsi16m(ANSI_BACKGROUND_OFFSET);
  Object.defineProperties(styles, {
    rgbToAnsi256: {
      value(red, green, blue) {
        if (red === green && green === blue) {
          if (red < 8) {
            return 16;
          }
          if (red > 248) {
            return 231;
          }
          return Math.round(((red - 8) / 247) * 24) + 232;
        }
        return (
          16 +
          36 * Math.round((red / 255) * 5) +
          6 * Math.round((green / 255) * 5) +
          Math.round((blue / 255) * 5)
        );
      },
      enumerable: false
    },
    hexToRgb: {
      value(hex) {
        const matches = /[a-f\d]{6}|[a-f\d]{3}/i.exec(hex.toString(16));
        if (!matches) {
          return [0, 0, 0];
        }
        let [colorString] = matches;
        if (colorString.length === 3) {
          colorString = [...colorString]
            .map((character) => character + character)
            .join("");
        }
        const integer = Number.parseInt(colorString, 16);
        return [(integer >> 16) & 255, (integer >> 8) & 255, integer & 255];
      },
      enumerable: false
    },
    hexToAnsi256: {
      value: (hex) => styles.rgbToAnsi256(...styles.hexToRgb(hex)),
      enumerable: false
    },
    ansi256ToAnsi: {
      value(code) {
        if (code < 8) {
          return 30 + code;
        }
        if (code < 16) {
          return 90 + (code - 8);
        }
        let red;
        let green;
        let blue;
        if (code >= 232) {
          red = ((code - 232) * 10 + 8) / 255;
          green = red;
          blue = red;
        } else {
          code -= 16;
          const remainder = code % 36;
          red = Math.floor(code / 36) / 5;
          green = Math.floor(remainder / 6) / 5;
          blue = (remainder % 6) / 5;
        }
        const value = Math.max(red, green, blue) * 2;
        if (value === 0) {
          return 30;
        }
        let result =
          30 +
          ((Math.round(blue) << 2) |
            (Math.round(green) << 1) |
            Math.round(red));
        if (value === 2) {
          result += 60;
        }
        return result;
      },
      enumerable: false
    },
    rgbToAnsi: {
      value: (red, green, blue) =>
        styles.ansi256ToAnsi(styles.rgbToAnsi256(red, green, blue)),
      enumerable: false
    },
    hexToAnsi: {
      value: (hex) => styles.ansi256ToAnsi(styles.hexToAnsi256(hex)),
      enumerable: false
    }
  });
  return styles;
}
var ansiStyles = assembleStyles();
var ansi_styles_default = ansiStyles;

// node_modules/chalk/source/vendor/supports-color/index.js
import process3 from "node:process";
import os from "node:os";
import tty from "node:tty";
function hasFlag(
  flag,
  argv = globalThis.Deno ? globalThis.Deno.args : process3.argv
) {
  const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
  const position = argv.indexOf(prefix + flag);
  const terminatorPosition = argv.indexOf("--");
  return (
    position !== -1 &&
    (terminatorPosition === -1 || position < terminatorPosition)
  );
}
var { env } = process3;
var flagForceColor;
if (
  hasFlag("no-color") ||
  hasFlag("no-colors") ||
  hasFlag("color=false") ||
  hasFlag("color=never")
) {
  flagForceColor = 0;
} else if (
  hasFlag("color") ||
  hasFlag("colors") ||
  hasFlag("color=true") ||
  hasFlag("color=always")
) {
  flagForceColor = 1;
}
function envForceColor() {
  if ("FORCE_COLOR" in env) {
    if (env.FORCE_COLOR === "true") {
      return 1;
    }
    if (env.FORCE_COLOR === "false") {
      return 0;
    }
    return env.FORCE_COLOR.length === 0
      ? 1
      : Math.min(Number.parseInt(env.FORCE_COLOR, 10), 3);
  }
}
function translateLevel(level) {
  if (level === 0) {
    return false;
  }
  return {
    level,
    hasBasic: true,
    has256: level >= 2,
    has16m: level >= 3
  };
}
function _supportsColor(haveStream, { streamIsTTY, sniffFlags = true } = {}) {
  const noFlagForceColor = envForceColor();
  if (noFlagForceColor !== undefined) {
    flagForceColor = noFlagForceColor;
  }
  const forceColor = sniffFlags ? flagForceColor : noFlagForceColor;
  if (forceColor === 0) {
    return 0;
  }
  if (sniffFlags) {
    if (
      hasFlag("color=16m") ||
      hasFlag("color=full") ||
      hasFlag("color=truecolor")
    ) {
      return 3;
    }
    if (hasFlag("color=256")) {
      return 2;
    }
  }
  if ("TF_BUILD" in env && "AGENT_NAME" in env) {
    return 1;
  }
  if (haveStream && !streamIsTTY && forceColor === undefined) {
    return 0;
  }
  const min = forceColor || 0;
  if (env.TERM === "dumb") {
    return min;
  }
  if (process3.platform === "win32") {
    const osRelease = os.release().split(".");
    if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
      return Number(osRelease[2]) >= 14931 ? 3 : 2;
    }
    return 1;
  }
  if ("CI" in env) {
    if (
      ["GITHUB_ACTIONS", "GITEA_ACTIONS", "CIRCLECI"].some((key) => key in env)
    ) {
      return 3;
    }
    if (
      ["TRAVIS", "APPVEYOR", "GITLAB_CI", "BUILDKITE", "DRONE"].some(
        (sign) => sign in env
      ) ||
      env.CI_NAME === "codeship"
    ) {
      return 1;
    }
    return min;
  }
  if ("TEAMCITY_VERSION" in env) {
    return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
  }
  if (env.COLORTERM === "truecolor") {
    return 3;
  }
  if (env.TERM === "xterm-kitty") {
    return 3;
  }
  if ("TERM_PROGRAM" in env) {
    const version = Number.parseInt(
      (env.TERM_PROGRAM_VERSION || "").split(".")[0],
      10
    );
    switch (env.TERM_PROGRAM) {
      case "iTerm.app": {
        return version >= 3 ? 3 : 2;
      }
      case "Apple_Terminal": {
        return 2;
      }
    }
  }
  if (/-256(color)?$/i.test(env.TERM)) {
    return 2;
  }
  if (
    /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)
  ) {
    return 1;
  }
  if ("COLORTERM" in env) {
    return 1;
  }
  return min;
}
function createSupportsColor(stream, options = {}) {
  const level = _supportsColor(stream, {
    streamIsTTY: stream && stream.isTTY,
    ...options
  });
  return translateLevel(level);
}
var supportsColor = {
  stdout: createSupportsColor({ isTTY: tty.isatty(1) }),
  stderr: createSupportsColor({ isTTY: tty.isatty(2) })
};
var supports_color_default = supportsColor;

// node_modules/chalk/source/utilities.js
function stringReplaceAll(string, substring, replacer) {
  let index = string.indexOf(substring);
  if (index === -1) {
    return string;
  }
  const substringLength = substring.length;
  let endIndex = 0;
  let returnValue = "";
  do {
    returnValue += string.slice(endIndex, index) + substring + replacer;
    endIndex = index + substringLength;
    index = string.indexOf(substring, endIndex);
  } while (index !== -1);
  returnValue += string.slice(endIndex);
  return returnValue;
}
function stringEncaseCRLFWithFirstIndex(string, prefix, postfix, index) {
  let endIndex = 0;
  let returnValue = "";
  do {
    const gotCR = string[index - 1] === "\r";
    returnValue +=
      string.slice(endIndex, gotCR ? index - 1 : index) +
      prefix +
      (gotCR
        ? `\r
`
        : `
`) +
      postfix;
    endIndex = index + 1;
    index = string.indexOf(
      `
`,
      endIndex
    );
  } while (index !== -1);
  returnValue += string.slice(endIndex);
  return returnValue;
}

// node_modules/chalk/source/index.js
var { stdout: stdoutColor, stderr: stderrColor } = supports_color_default;
var GENERATOR = Symbol("GENERATOR");
var STYLER = Symbol("STYLER");
var IS_EMPTY = Symbol("IS_EMPTY");
var levelMapping = ["ansi", "ansi", "ansi256", "ansi16m"];
var styles2 = Object.create(null);
var applyOptions = (object, options = {}) => {
  if (
    options.level &&
    !(
      Number.isInteger(options.level) &&
      options.level >= 0 &&
      options.level <= 3
    )
  ) {
    throw new Error("The `level` option should be an integer from 0 to 3");
  }
  const colorLevel = stdoutColor ? stdoutColor.level : 0;
  object.level = options.level === undefined ? colorLevel : options.level;
};
var chalkFactory = (options) => {
  const chalk = (...strings) => strings.join(" ");
  applyOptions(chalk, options);
  Object.setPrototypeOf(chalk, createChalk.prototype);
  return chalk;
};
function createChalk(options) {
  return chalkFactory(options);
}
Object.setPrototypeOf(createChalk.prototype, Function.prototype);
for (const [styleName, style] of Object.entries(ansi_styles_default)) {
  styles2[styleName] = {
    get() {
      const builder = createBuilder(
        this,
        createStyler(style.open, style.close, this[STYLER]),
        this[IS_EMPTY]
      );
      Object.defineProperty(this, styleName, { value: builder });
      return builder;
    }
  };
}
styles2.visible = {
  get() {
    const builder = createBuilder(this, this[STYLER], true);
    Object.defineProperty(this, "visible", { value: builder });
    return builder;
  }
};
var getModelAnsi = (model, level, type, ...arguments_) => {
  if (model === "rgb") {
    if (level === "ansi16m") {
      return ansi_styles_default[type].ansi16m(...arguments_);
    }
    if (level === "ansi256") {
      return ansi_styles_default[type].ansi256(
        ansi_styles_default.rgbToAnsi256(...arguments_)
      );
    }
    return ansi_styles_default[type].ansi(
      ansi_styles_default.rgbToAnsi(...arguments_)
    );
  }
  if (model === "hex") {
    return getModelAnsi(
      "rgb",
      level,
      type,
      ...ansi_styles_default.hexToRgb(...arguments_)
    );
  }
  return ansi_styles_default[type][model](...arguments_);
};
var usedModels = ["rgb", "hex", "ansi256"];
for (const model of usedModels) {
  styles2[model] = {
    get() {
      const { level } = this;
      return function (...arguments_) {
        const styler = createStyler(
          getModelAnsi(model, levelMapping[level], "color", ...arguments_),
          ansi_styles_default.color.close,
          this[STYLER]
        );
        return createBuilder(this, styler, this[IS_EMPTY]);
      };
    }
  };
  const bgModel = "bg" + model[0].toUpperCase() + model.slice(1);
  styles2[bgModel] = {
    get() {
      const { level } = this;
      return function (...arguments_) {
        const styler = createStyler(
          getModelAnsi(model, levelMapping[level], "bgColor", ...arguments_),
          ansi_styles_default.bgColor.close,
          this[STYLER]
        );
        return createBuilder(this, styler, this[IS_EMPTY]);
      };
    }
  };
}
var proto = Object.defineProperties(() => {}, {
  ...styles2,
  level: {
    enumerable: true,
    get() {
      return this[GENERATOR].level;
    },
    set(level) {
      this[GENERATOR].level = level;
    }
  }
});
var createStyler = (open, close, parent) => {
  let openAll;
  let closeAll;
  if (parent === undefined) {
    openAll = open;
    closeAll = close;
  } else {
    openAll = parent.openAll + open;
    closeAll = close + parent.closeAll;
  }
  return {
    open,
    close,
    openAll,
    closeAll,
    parent
  };
};
var createBuilder = (self, _styler, _isEmpty) => {
  const builder = (...arguments_) =>
    applyStyle(
      builder,
      arguments_.length === 1 ? "" + arguments_[0] : arguments_.join(" ")
    );
  Object.setPrototypeOf(builder, proto);
  builder[GENERATOR] = self;
  builder[STYLER] = _styler;
  builder[IS_EMPTY] = _isEmpty;
  return builder;
};
var applyStyle = (self, string) => {
  if (self.level <= 0 || !string) {
    return self[IS_EMPTY] ? "" : string;
  }
  let styler = self[STYLER];
  if (styler === undefined) {
    return string;
  }
  const { openAll, closeAll } = styler;
  if (string.includes("\x1B")) {
    while (styler !== undefined) {
      string = stringReplaceAll(string, styler.close, styler.open);
      styler = styler.parent;
    }
  }
  const lfIndex = string.indexOf(`
`);
  if (lfIndex !== -1) {
    string = stringEncaseCRLFWithFirstIndex(string, closeAll, openAll, lfIndex);
  }
  return openAll + string + closeAll;
};
Object.defineProperties(createChalk.prototype, styles2);
var chalk = createChalk();
var chalkStderr = createChalk({ level: stderrColor ? stderrColor.level : 0 });
var source_default = chalk;

// src/sequential-thinking/index.ts
class SequentialThinkingServer {
  thoughtHistory = [];
  branches = {};
  disableThoughtLogging;
  constructor() {
    this.disableThoughtLogging =
      (process.env.DISABLE_THOUGHT_LOGGING || "").toLowerCase() === "true";
  }
  validateThoughtData(input) {
    const data = input;
    if (!data.thought || typeof data.thought !== "string") {
      throw new Error("Invalid thought: must be a string");
    }
    if (!data.thoughtNumber || typeof data.thoughtNumber !== "number") {
      throw new Error("Invalid thoughtNumber: must be a number");
    }
    if (!data.totalThoughts || typeof data.totalThoughts !== "number") {
      throw new Error("Invalid totalThoughts: must be a number");
    }
    if (typeof data.nextThoughtNeeded !== "boolean") {
      throw new Error("Invalid nextThoughtNeeded: must be a boolean");
    }
    return {
      thought: data.thought,
      thoughtNumber: data.thoughtNumber,
      totalThoughts: data.totalThoughts,
      nextThoughtNeeded: data.nextThoughtNeeded,
      isRevision: data.isRevision,
      revisesThought: data.revisesThought,
      branchFromThought: data.branchFromThought,
      branchId: data.branchId,
      needsMoreThoughts: data.needsMoreThoughts
    };
  }
  formatThought(thoughtData) {
    const {
      thoughtNumber,
      totalThoughts,
      thought,
      isRevision,
      revisesThought,
      branchFromThought,
      branchId
    } = thoughtData;
    let prefix = "";
    let context = "";
    if (isRevision) {
      prefix = source_default.yellow("\uD83D\uDD04 Revision");
      context = ` (revising thought ${revisesThought})`;
    } else if (branchFromThought) {
      prefix = source_default.green("\uD83C\uDF3F Branch");
      context = ` (from thought ${branchFromThought}, ID: ${branchId})`;
    } else {
      prefix = source_default.blue("\uD83D\uDCAD Thought");
      context = "";
    }
    const header = `${prefix} ${thoughtNumber}/${totalThoughts}${context}`;
    const border = "─".repeat(Math.max(header.length, thought.length) + 4);
    return `
┌${border}┐
│ ${header} │
├${border}┤
│ ${thought.padEnd(border.length - 2)} │
└${border}┘`;
  }
  processThought(input) {
    try {
      const validatedInput = this.validateThoughtData(input);
      if (validatedInput.thoughtNumber > validatedInput.totalThoughts) {
        validatedInput.totalThoughts = validatedInput.thoughtNumber;
      }
      this.thoughtHistory.push(validatedInput);
      if (validatedInput.branchFromThought && validatedInput.branchId) {
        const branchId = validatedInput.branchId;
        if (!this.branches[branchId]) {
          this.branches[branchId] = [];
        }
        this.branches[branchId].push(validatedInput);
      }
      if (!this.disableThoughtLogging) {
        const formattedThought = this.formatThought(validatedInput);
        console.error(formattedThought);
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                thoughtNumber: validatedInput.thoughtNumber,
                totalThoughts: validatedInput.totalThoughts,
                nextThoughtNeeded: validatedInput.nextThoughtNeeded,
                branches: Object.keys(this.branches),
                thoughtHistoryLength: this.thoughtHistory.length
              },
              null,
              2
            )
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                error: error instanceof Error ? error.message : String(error),
                status: "failed"
              },
              null,
              2
            )
          }
        ],
        isError: true
      };
    }
  }
}
var SEQUENTIAL_THINKING_TOOL = {
  name: "sequentialthinking",
  description: `A detailed tool for dynamic and reflective problem-solving through thoughts.
This tool helps analyze problems through a flexible thinking process that can adapt and evolve.
Each thought can build on, question, or revise previous insights as understanding deepens.

When to use this tool:
- Breaking down complex problems into steps
- Planning and design with room for revision
- Analysis that might need course correction
- Problems where the full scope might not be clear initially
- Problems that require a multi-step solution
- Tasks that need to maintain context over multiple steps
- Situations where irrelevant information needs to be filtered out

Key features:
- You can adjust total_thoughts up or down as you progress
- You can question or revise previous thoughts
- You can add more thoughts even after reaching what seemed like the end
- You can express uncertainty and explore alternative approaches
- Not every thought needs to build linearly - you can branch or backtrack
- Generates a solution hypothesis
- Verifies the hypothesis based on the Chain of Thought steps
- Repeats the process until satisfied
- Provides a correct answer

Parameters explained:
- thought: Your current thinking step, which can include:
* Regular analytical steps
* Revisions of previous thoughts
* Questions about previous decisions
* Realizations about needing more analysis
* Changes in approach
* Hypothesis generation
* Hypothesis verification
- next_thought_needed: True if you need more thinking, even if at what seemed like the end
- thought_number: Current number in sequence (can go beyond initial total if needed)
- total_thoughts: Current estimate of thoughts needed (can be adjusted up/down)
- is_revision: A boolean indicating if this thought revises previous thinking
- revises_thought: If is_revision is true, which thought number is being reconsidered
- branch_from_thought: If branching, which thought number is the branching point
- branch_id: Identifier for the current branch (if any)
- needs_more_thoughts: If reaching end but realizing more thoughts needed

You should:
1. Start with an initial estimate of needed thoughts, but be ready to adjust
2. Feel free to question or revise previous thoughts
3. Don't hesitate to add more thoughts if needed, even at the "end"
4. Express uncertainty when present
5. Mark thoughts that revise previous thinking or branch into new paths
6. Ignore information that is irrelevant to the current step
7. Generate a solution hypothesis when appropriate
8. Verify the hypothesis based on the Chain of Thought steps
9. Repeat the process until satisfied with the solution
10. Provide a single, ideally correct answer as the final output
11. Only set next_thought_needed to false when truly done and a satisfactory answer is reached`,
  inputSchema: {
    type: "object",
    properties: {
      thought: {
        type: "string",
        description: "Your current thinking step"
      },
      nextThoughtNeeded: {
        type: "boolean",
        description: "Whether another thought step is needed"
      },
      thoughtNumber: {
        type: "integer",
        description: "Current thought number",
        minimum: 1
      },
      totalThoughts: {
        type: "integer",
        description: "Estimated total thoughts needed",
        minimum: 1
      },
      isRevision: {
        type: "boolean",
        description: "Whether this revises previous thinking"
      },
      revisesThought: {
        type: "integer",
        description: "Which thought is being reconsidered",
        minimum: 1
      },
      branchFromThought: {
        type: "integer",
        description: "Branching point thought number",
        minimum: 1
      },
      branchId: {
        type: "string",
        description: "Branch identifier"
      },
      needsMoreThoughts: {
        type: "boolean",
        description: "If more thoughts are needed"
      }
    },
    required: ["thought", "nextThoughtNeeded", "thoughtNumber", "totalThoughts"]
  }
};
var server = new Server(
  {
    name: "sequential-thinking-server",
    version: "0.2.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);
var thinkingServer = new SequentialThinkingServer();
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [SEQUENTIAL_THINKING_TOOL]
}));
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "sequentialthinking") {
    return thinkingServer.processThought(request.params.arguments);
  }
  return {
    content: [
      {
        type: "text",
        text: `Unknown tool: ${request.params.name}`
      }
    ],
    isError: true
  };
});
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Sequential Thinking MCP Server running on stdio");
}
runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
