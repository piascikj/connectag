describe("ConnecTag.util", function () {
    var types = {
        "object": {},
        "array": [],
        "number": 100,
        "boolean": true,
        "undefined": undefined,
        "nan": NaN,
        "function": function () {},
        "string": ""
    };

    describe("ConnecTag.util.forEach", function () {
        it("should call the callback for each item with item, index, and array as parameters", function () {
            var array, callback;

            array = ['hi', 'hey', 'yo'];
            callback = jasmine.createSpy();

            ConnecTag.util.forEach(array, callback);

            expect(callback.callCount).toEqual(3);
            expect(callback.argsForCall[0]).toEqual(['hi', 0, array]);
            expect(callback.argsForCall[1]).toEqual(['hey', 1, array]);
            expect(callback.argsForCall[2]).toEqual(['yo', 2, array]);
        });
    });

    describe("ConnecTag.util.forIn", function () {
        it("should call the callback with a key and value for each key in the object", function () {
            var K, k, handler;

            K = function () {
                this.someProperty = "yes";
            };
            K.prototype.someOtherProperty = "yessssss";

            k = new K();
            handler = jasmine.createSpy();

            ConnecTag.util.forIn(k, handler);

            expect(handler).toHaveBeenCalledWith('someProperty', 'yes');
            expect(handler).toHaveBeenCalledWith('someOtherProperty', 'yessssss');
        });
    });

    describe("ConnecTag.util.forOwnIn", function () {
        it("should call the callback with a key and value for only the hasOwn properties", function () {
            var K, k, handler;

            K = function () {
                this.someProperty = "yes";
            };
            K.prototype.someOtherProperty = "yesss";

            k = new K();
            handler = jasmine.createSpy();

            ConnecTag.util.forOwnIn(k, handler);

            expect(handler).toHaveBeenCalledWith('someProperty', 'yes');
            expect(handler).not.toHaveBeenCalledWith('someOtherProperty', 'yesss');
        });
    });

    describe("ConnecTag.util.isArray", function () {
        it("should identify an array", function () {
            var type;

            for (type in types) {
                if (types.hasOwnProperty(type)) {
                    expect(ConnecTag.util.isArray(types[type])).toEqual(type === "array" ? true : false);
                }
            }
        });
    });

    describe("ConnecTag.util.toRegExp", function () {
        it("should return a RegExp given a valid regex string", function () {
            var regexString = "^hello$";

            expect(ConnecTag.util.toRegExp(regexString).toString()).toEqual('/' + regexString + '/');
        });

        it("should return a RegExp given an array of valid regex strings", function () {
            var regexArray = ["^hello$", "yo$"],
            expected = '/' + regexArray.join('|') + '/';

            expect(ConnecTag.util.toRegExp(regexArray).toString()).toEqual(expected);
        });

        it("should return an always fail RegExp given an invalid regex string", function () {
            var regexString = "^((",
            expected = '/$.+^/';

            expect(ConnecTag.util.toRegExp(regexString).toString()).toEqual(expected);
        });
    });

    describe("ConnecTag.util.isNull", function () {
        it("should identify null", function () {
            for (var type in types) {
                if (types.hasOwnProperty(type)) {
                    expect(ConnecTag.util.isNull(types[type])).toEqual(type === "null" ? true : false);
                }
            }
        });
    });

    describe("ConnecTag.util.typeOf", function () {
        it("should correctly identify array, null, and other native types", function () {
            for (var type in types) {
                if (types.hasOwnProperty(type)) {
                    if (type === "array") {
                        expect(ConnecTag.util.typeOf(types[type])).toEqual('array');
                    } else if (type === "null") {
                        expect(ConnecTag.util.typeOf(types[type])).toEqual('null');
                    } else {
                        expect(ConnecTag.util.typeOf(types[type])).toEqual(typeof types[type]);
                    }
                }
            }
        });
    });

    describe("ConnecTag.util.extend", function () {
        it("should copy properties from a source object to the target", function () {
            var target, source, expected;

            target = {};
            source = { a: null, b: "whatever", c: [] };
            expected = { a: null, b: "whatever", c: [] };

            ConnecTag.util.extend(target, source);
            expect(target).toEqual(expected);
        });

        it("should overwrite properties on the target object if property names match", function () {
            var target, source, expected;

            target = { a: "NOO", c: null };
            source = { a: "YES", b: null };
            expected = { a: "YES", b: null, c: null };

            ConnecTag.util.extend(target, source);
            expect(target).toEqual(expected);
        });

        it("should recursively copy properties if performing a deep copy", function () {
            var target, source, expected;

            target = { a: { a1: "NOO", a2: "YES" }, b: "YES" };
            source = { a: { a1: "YES", a3: "YES" } };
            expected = { a: { a1: "YES", a2: "YES", a3: "YES" }, b: "YES" };

            ConnecTag.util.extend(true, target, source);
            expect(target).toEqual(expected);
        });

        it("should perform a clone if matching source property is clonable and not the same type", function () {
            var target, source, expected;

            target =    { a: { a1: "NO" } };
            source =    { a: ["YES"] };
            expected =  { a: ["YES"] };

            ConnecTag.util.extend(true, target, source);
            expect(target).toEqual(expected);
            expect(target.a).not.toBe(source.a);
        });

        it("should extend arrays", function () {
            var target, source, expected;

            target = [100, 200, { a: "NOO" }, 400, 500];
            source = ["A", "B", { a: "YES", b: "YES" }];
            expected = ["A", "B", { a: "YES", b: "YES" }, 400, 500];

            ConnecTag.util.extend(true, target, source);
            expect(target).toEqual(expected);
            expect(target[2]).not.toBe(source[2]);
        });

        it("should perform a simple copy for properties that are not cloneable", function () {
            var target, source;

            target = { div: document.createElement('div'), win: window };
            source = { div: document.createElement('div'), win: window };

            ConnecTag.util.extend(true, target, source);
            expect(target.div).toBe(source.div);
        });

        it("should ignore parameters that are not cloneable", function () {
            var target, source;

            target = {};
            source = document.createElement('div');

            ConnecTag.util.extend(true, target, source);
            expect(target).toEqual({});
        });
    });

    describe("ConnecTag.util.clone", function () {
        it("should return a deep copy of an object or array", function () {
            var typeOf, target, expected, result;

            typeOf = ConnecTag.util.typeOf;
            target = { obj: { a: "", b: { c: "" } }, arr: ["a", "b", "c"] };
            expected = { obj: { a: "", b: { c: "" } }, arr: ["a", "b", "c"] };
            result = {};

            result.obj = ConnecTag.util.clone(target.obj);

            expect(result.obj).toEqual(expected.obj);
            expect(typeOf(result.obj)).toEqual(typeOf(expected.obj));
            expect(result.obj).not.toBe(target.obj);

            result.arr = ConnecTag.util.clone(target.arr);

            expect(result.arr).toEqual(expected.arr);
            expect(typeOf(result.arr)).toEqual(typeOf(expected.arr));
            expect(result.arr).not.toBe(target.arr);
        });

        it("should not attempt to clone an 'uncloneable' object", function () {
            var result, div;
            
            div = document.createElement('div');

            result = ConnecTag.util.clone(div);
            expect(result).toBe(div);
        });
    });
});
