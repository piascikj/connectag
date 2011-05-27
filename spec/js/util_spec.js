(function() {
  var __hasProp = Object.prototype.hasOwnProperty;
  describe("ConnecTag.util", function() {
    var types;
    types = {
      "object": {},
      "array": [],
      "number": 100,
      "boolean": true,
      "undefined": void 0,
      "nan": NaN,
      "function": function() {},
      "string": ""
    };
    describe("ConnecTag.util.isArray", function() {
      it("should delegate to Array.isArray if present", function() {
        Array.isArray = Array.isArray || function() {};
        spyOn(Array, 'isArray');
        ConnecTag.util.isArray([]);
        return expect(Array.isArray).toHaveBeenCalled();
      });
      return it("should identify an array", function() {
        var type, value, _ref, _results;
        _results = [];
        for (type in types) {
          if (!__hasProp.call(types, type)) continue;
          value = types[type];
          _results.push(expect(ConnecTag.util.isArray(value)).toEqual((_ref = type === "array") != null ? _ref : {
            "true": false
          }));
        }
        return _results;
      });
    });
    describe("ConnecTag.util.toRegExp", function() {
      it("should return a RegExp given a valid regex string", function() {
        var regexString;
        regexString = "^hello$";
        return expect(ConnecTag.util.toRegExp(regexString).toString()).toEqual("/" + regexString + "/");
      });
      it("should return a RegExp given an array of valid regex strings", function() {
        var expected, regexArray;
        regexArray = ["^hello$", "yo$"];
        expected = "/" + (regexArray.join('|')) + "/";
        return expect(ConnecTag.util.toRegExp(regexArray).toString()).toEqual(expected);
      });
      return it("should return an always fail RegExp given an invalid regex string", function() {
        var expected, regexString;
        regexString = "^((";
        expected = '/$.+^/';
        return expect(ConnecTag.util.toRegExp(regexString).toString()).toEqual(expected);
      });
    });
    describe("ConnecTag.util.isNull", function() {
      return it("should identify null", function() {
        var type, value, _ref, _results;
        _results = [];
        for (type in types) {
          if (!__hasProp.call(types, type)) continue;
          value = types[type];
          _results.push(expect(ConnecTag.util.isNull(value)).toEqual((_ref = type === "null") != null ? _ref : {
            "true": false
          }));
        }
        return _results;
      });
    });
    describe("ConnecTag.util.typeOf", function() {
      return it("should correctly identify array, null, and other native types", function() {
        var type, value, _results;
        _results = [];
        for (type in types) {
          if (!__hasProp.call(types, type)) continue;
          value = types[type];
          _results.push(type === "array" ? expect(ConnecTag.util.typeOf(value)).toEqual('array') : type === "null" ? expect(ConnecTag.util.typeOf(value)).toEqual('null') : expect(ConnecTag.util.typeOf(value)).toEqual(typeof value));
        }
        return _results;
      });
    });
    describe("ConnecTag.util.extend", function() {
      it("should copy properties from a source object to the target", function() {
        var expected, source, target;
        target = {};
        source = {
          a: null,
          b: "whatever",
          c: []
        };
        expected = {
          a: null,
          b: "whatever",
          c: []
        };
        ConnecTag.util.extend(target, source);
        return expect(target).toEqual(expected);
      });
      it("should overwrite properties on the target object if property names match", function() {
        var expected, source, target;
        target = {
          a: "NOO",
          c: null
        };
        source = {
          a: "YES",
          b: null
        };
        expected = {
          a: "YES",
          b: null,
          c: null
        };
        ConnecTag.util.extend(target, source);
        return expect(target).toEqual(expected);
      });
      it("should recursively copy properties if performing a deep copy", function() {
        var expected, source, target;
        target = {
          a: {
            a1: "NOO",
            a2: "YES"
          },
          b: "YES"
        };
        source = {
          a: {
            a1: "YES",
            a3: "YES"
          }
        };
        expected = {
          a: {
            a1: "YES",
            a2: "YES",
            a3: "YES"
          },
          b: "YES"
        };
        ConnecTag.util.extend(true, target, source);
        return expect(target).toEqual(expected);
      });
      it("should perform a clone if matching source property is clonable and not the same type", function() {
        var expected, source, target;
        target = {
          a: {
            a1: "NO"
          }
        };
        source = {
          a: ["YES"]
        };
        expected = {
          a: ["YES"]
        };
        ConnecTag.util.extend(true, target, source);
        expect(target).toEqual(expected);
        return expect(target.a).not.toBe(source.a);
      });
      it("should extend arrays", function() {
        var expected, source, target;
        target = [
          100, 200, {
            a: "NOO"
          }, 400, 500
        ];
        source = [
          "A", "B", {
            a: "YES",
            b: "YES"
          }
        ];
        expected = [
          "A", "B", {
            a: "YES",
            b: "YES"
          }, 400, 500
        ];
        ConnecTag.util.extend(true, target, source);
        expect(target).toEqual(expected);
        return expect(target[2]).not.toBe(source[2]);
      });
      it("should perform a simple copy for properties that are not cloneable", function() {
        var source, target;
        target = {
          div: document.createElement('div'),
          win: window
        };
        source = {
          div: document.createElement('div'),
          win: window
        };
        ConnecTag.util.extend(true, target, source);
        return expect(target.div).toBe(source.div);
      });
      return it("should ignore parameters that are not cloneable", function() {
        var source, target;
        target = {};
        source = document.createElement('div');
        ConnecTag.util.extend(true, target, source);
        return expect(target).toEqual({});
      });
    });
    return describe("ConnecTag.util.clone", function() {
      it("should return a deep copy of an object or array", function() {
        var expected, result, target, typeOf;
        typeOf = ConnecTag.util.typeOf;
        target = {
          obj: {
            a: "",
            b: {
              c: ""
            }
          },
          arr: ["a", "b", "c"]
        };
        expected = {
          obj: {
            a: "",
            b: {
              c: ""
            }
          },
          arr: ["a", "b", "c"]
        };
        result = {};
        result.obj = ConnecTag.util.clone(target.obj);
        expect(result.obj).toEqual(expected.obj);
        expect(typeOf(result.obj)).toEqual(typeOf(expected.obj));
        expect(result.obj).not.toBe(target.obj);
        result.arr = ConnecTag.util.clone(target.arr);
        expect(result.arr).toEqual(expected.arr);
        expect(typeOf(result.arr)).toEqual(typeOf(expected.arr));
        return expect(result.arr).not.toBe(target.arr);
      });
      return it("should not attempt to clone an 'uncloneable' object", function() {
        var div, result;
        div = document.createElement('div');
        result = ConnecTag.util.clone(div);
        return expect(result).toBe(div);
      });
    });
  });
}).call(this);
