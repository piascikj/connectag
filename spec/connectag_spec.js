describe("ConnecTag", function () {
    beforeEach(function () {
        spyOn(ConnecTag.helpers, "getXMLHttpRequest").andCallFake(function () {
            var xhr;
            
            xhr = {
                readyState: 4,
                status: 200,
                open: function () {},
                send: function () {
                    xhr.onreadystatechange();
                }
            };

            return xhr;
        });
    });

    describe("ConnecTag.connect", function () {
        it("should call initialize with the params and set track as the callback", function () {
            var params = {};

            spyOn(ConnecTag, "initialize");

            ConnecTag.connect(params);

            expect(params.callback).toBe(ConnecTag.track);
            expect(ConnecTag.initialize).toHaveBeenCalledWith(params);
        });
    });

    describe("ConnecTag.initialize", function () {
        it("should override document.write by default", function () {
            ConnecTag.initialize({
                preloadPlugins: false
            });

            expect(document.write).toBe(ConnecTag.helpers.documentWrite);
        });

        it("should not override document.write when replaceDocWrite is false", function () {
            var docWrite;

            docWrite = document.write;

            ConnecTag.initialize({
                preloadPlugins: false,
                replaceDocWrite: false
            });

            expect(document.write).toBe(docWrite);
        });

        it("should call getScript when given script and store the result as ConnecTag.data", function () {
            
        });

        it("should call getJson when given json and store the result as ConnecTag.data", function () {
            var data, params;

            data = {};
            params = {
                json: "/some/path/to.json",
                preloadPlugins: false
            };

            // Ignoring responseText for purposes of this test and return data from above
            spyOn(ConnecTag.helpers, "parseJson").andCallFake(function (responseText) { return data; });
            spyOn(ConnecTag.helpers, "getJson").andCallFake(function (url, callback) { callback(data); });

            ConnecTag.initialize(params);

            expect(ConnecTag.helpers.getJson).toHaveBeenCalled();
            expect(ConnecTag.data).toBe(data);
        });
    });

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

        describe("ConnecTag.util.isArray", function () {
            it("should identify an array", function () {
                for (var type in types) {
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
                var
                target =    {},
                source =    { a: null, b: "whatever", c: [] },
                expected =  { a: null, b: "whatever", c: [] };

                ConnecTag.util.extend(target, source);
                expect(target).toEqual(expected);
            });

            it("should overwrite properties on the target object if property names match", function () {
                var
                target =    { a: "NOO", c: null },
                source =    { a: "YES", b: null },
                expected =  { a: "YES", b: null, c: null };

                ConnecTag.util.extend(target, source);
                expect(target).toEqual(expected);
            });

            it("should recursively copy properties if performing a deep copy", function () {
                var
                target =    { a: { a1: "NOO", a2: "YES" }, b: "YES" },
                source =    { a: { a1: "YES", a3: "YES" } },
                expected =  { a: { a1: "YES", a2: "YES", a3: "YES" }, b: "YES" };

                ConnecTag.util.extend(true, target, source);
                expect(target).toEqual(expected);
            });

            it("should perform a clone if matching source property is clonable and not the same type", function () {
                var
                target =    { a: { a1: "NO" } },
                source =    { a: ["YES"] },
                expected =  { a: ["YES"] };

                ConnecTag.util.extend(true, target, source);
                expect(target).toEqual(expected);
                expect(target.a).not.toBe(source.a);
            });

            it("should extend arrays", function () {
                var
                target =    [100, 200, { a: "NOO" }, 400, 500],
                source =    ["A", "B", { a: "YES", b: "YES" }],
                expected =  ["A", "B", { a: "YES", b: "YES" }, 400, 500];

                ConnecTag.util.extend(true, target, source);
                expect(target).toEqual(expected);
                expect(target[2]).not.toBe(source[2]);
            });

            it("should perform a simple copy for properties that are not cloneable", function () {
                var
                target = { div: document.createElement('div'), win: window },
                source = { div: document.createElement('div'), win: window };

                ConnecTag.util.extend(true, target, source);
                expect(target.div).toBe(source.div);
            });

            it("should ignore parameters that are not cloneable", function () {
                var
                target = {},
                source = document.createElement('div');

                ConnecTag.util.extend(true, target, source);
                expect(target).toEqual({});
            });
        });

        describe("ConnecTag.util.clone", function () {
            it("should return a deep copy of an object or array", function () {
                var
                typeOf = ConnecTag.util.typeOf,
                target =    { obj: { a: "", b: { c: "" } }, arr: ["a", "b", "c"] },
                expected =  { obj: { a: "", b: { c: "" } }, arr: ["a", "b", "c"] },
                result =    {};

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
                var result, div = document.createElement('div');

                result = ConnecTag.util.clone(div);
                expect(result).toBe(div);
            });
        });
    });

    describe("ConnecTag.helpers", function () {
        var helpers = ConnecTag.helpers;

        describe("ConnecTag.helpers.parseJson", function () {
            var parseJson = helpers.parseJson;

            it("should throw a syntax error if the json is invalid", function () {
                var thrower = function () {
                    parseJson('{"key":{{}}}');
                };

                expect(thrower).toThrow();
            });

            it("should return an object or an array", function () {
                expect(parseJson('[]')).toEqual([]);
                expect(parseJson('{}')).toEqual({});
            });
        });

        describe("ConnecTag.helpers.parseTemplate", function () {
            var parseTemplate = helpers.parseTemplate;

            it("should parse a string template using a value from the context object", function () {
                var template = "${dodge} ${dodge} ${attack}",
                context = { dodge: "duck", attack: "face-punch!" },
                expected = "duck duck face-punch!";

                expect(parseTemplate(template, context)).toEqual(expected);
            });

            it("should return the context value as its original type if the template is the entire string", function () {
                var template1 = "${key}",
                template2 = "To string: ${key}",
                context = { key: {} };

                expect(parseTemplate(template1, context)).toEqual({});
                expect(parseTemplate(template2, context)).toEqual("To string: [object Object]");
            });
        });
    });

    describe("ConnecTag.matchers", function () {
        var matchers = ConnecTag.matchers;

        // All the location matchers are pretty much the same...
        // so I'm just going to test this one because it's easy to manipulate.
        describe("ConnecTag.matchers.hash", function () {
            var hash = matchers.hash;

            it("should match patterns against given values or window.location.hash", function () {
                var patterns = ['^#yo$', '^#hey$'];

                expect(hash(patterns, '#hey')).toEqual(true);
                expect(hash(patterns, '#hello')).toEqual(false);

                window.location.hash = "hey";
                expect(hash(patterns)).toEqual(true);

                window.location.hash = "bye";
                expect(hash(patterns)).toEqual(false);

                window.location.hash = "";
            });
        });

        describe("ConnecTag.matchers.pageId", function () {
            var pageId = matchers.pageId;

            it("should match patterns against given values or ConnecTag.values.pageId", function () {
                var patterns = ['^74$','^1000$','^homepage$'];

                expect(pageId(patterns, "homepage")).toEqual(true);
                expect(pageId(patterns, "hopage")).toEqual(false);
                expect(pageId(patterns, ['ADLKJASD', '74'])).toEqual(true);

                ConnecTag.values.pageId = 1000;
                expect(pageId(patterns)).toEqual(true);

                ConnecTag.values.pageId = 0;
                expect(pageId(patterns)).toEqual(false);

                ConnecTag.values.pageId = [0, 2000, 'homepage'];
                expect(pageId(patterns)).toEqual(true);
            });
        });

        describe("ConnecTag.matchers.event", function () {
            var event = matchers.event;

            it("should match patterns against given values", function () {
                var patterns = ['^someClickEvent$','^anotherClick$'];

                expect(event(patterns, 'someClickEvent')).toEqual(true);
                expect(event(patterns, 'AGHSDLFKSJF')).toEqual(false);
                expect(event(patterns, ['skfjs', 'lkajslkfjsf'])).toEqual(false);
                expect(event(patterns, ['anotherClick', 'AHWLKWJLKJSLKJSDF'])).toEqual(true);
            });
        });
    });

    describe("ConnecTag.initialize", function () {
        it("should assign data directly and call callback if data is passed", function () {
            var data = { tags: [] };

            ConnecTag.initialize({ data: data });
            expect(ConnecTag.data).toBe(data);
        });

        it("should retrieve json and call callback if json path is given", function () {
            var data = { tags: [] },
            params = {
                json: "/path/to/some.json",
                preloadPlugins: false,
                callback: function () {}
            };

            spyOn(params, 'callback');
            spyOn(ConnecTag.helpers, 'getJson').andCallFake(function (json, callback) {
                // We're just testing the callback that initialize builds
                callback(data);
            });

            ConnecTag.initialize(params);

            expect(ConnecTag.helpers.getJson).toHaveBeenCalled();
            expect(params.callback).toHaveBeenCalled();
            expect(ConnecTag.data).toBe(data);
        });

        it("should load script and execute callback if given script path", function () {
            var params = {
                preloadPlugins: false,
                script: "/path/to/script.js",
                callback: function () {}
            };

            spyOn(params, 'callback');
            spyOn(ConnecTag.helpers, 'getScript').andCallFake(function (json, callback) {
                // We're just testing the callback that initialize builds
                callback();
            });

            ConnecTag.initialize(params);

            expect(ConnecTag.helpers.getScript).toHaveBeenCalled();
            expect(params.callback).toHaveBeenCalled();
        });

        it("should preload plugins if preload is true and fire the callback after they are done", function () {
            var params = {
                preloadPlugins: true,
                data: {
                    tags: [
                        { plugin: { path: "/plugins/plugin1.js" } },
                        { plugin: { path: "/plugins/plugin2.js" } },
                        { plugin: { path: "/plugins/plugin3.js" } }
                    ]
                },
                callback: function () {}
            };

            spyOn(ConnecTag.helpers, 'getScript').andCallFake(function (path, callback) {
                callback();
            });
            spyOn(params, 'callback');

            ConnecTag.initialize(params);

            expect(ConnecTag.helpers.getScript).toHaveBeenCalled();
            expect(ConnecTag.helpers.getScript.callCount).toEqual(params.data.tags.length);

            expect(params.callback).toHaveBeenCalled();
            expect(params.callback.callCount).toEqual(1);
        });
    });

    describe("ConnecTag.connect", function () {
        it("should call initialize with given parameters, and set up track() as the callback", function () {
            var params = {
                data: { tags: [] },
                preloadPlugins: false
            };

            spyOn(ConnecTag, 'initialize').andCallThrough();
            spyOn(ConnecTag, 'track');

            ConnecTag.connect(params);

            expect(ConnecTag.initialize).toHaveBeenCalledWith(params);
            expect(ConnecTag.track).toHaveBeenCalled();
        });
    });

    describe("ConnecTag.track", function () {
        var data = {
            tags: [
                {
                    plugin: {id: "plugin1", path: "/plugin1.js"},
                    settings: {},
                    instances: [{match: {pageId: "^100$"}, commands: []}]
                },
                {
                    plugin: {id: "plugin2", path: "/plugin2.js"},
                    settings: {},
                    instances: [{match: {pageId: ["^0$", "^hello$"]}, commands: []}]
                }
            ]
        };

        it("should call plugin.track for each matching plugin", function () {
            ConnecTag.plugins = {
                'plugin1': { track: function () {} },
                'plugin2': { track: function () {} }
            };

            spyOn(ConnecTag.matchers, 'pageId').andCallThrough();
            spyOn(ConnecTag.plugins.plugin1, 'track');
            spyOn(ConnecTag.plugins.plugin2, 'track');

            ConnecTag.initialize({data: ConnecTag.util.clone(data), preloadPlugins: false, callback: function () {
                ConnecTag.track({'pageId':'100'});
            }});

            expect(ConnecTag.matchers.pageId).toHaveBeenCalled();
            expect(ConnecTag.plugins.plugin1.track).toHaveBeenCalled();
            expect(ConnecTag.plugins.plugin2.track).not.toHaveBeenCalled();
        });

        it("should match against multiple arguments if given", function () {
            spyOn(ConnecTag.matchers, 'pageId');
            spyOn(ConnecTag.matchers, 'hash');
            spyOn(ConnecTag.matchers, 'protocol');

            ConnecTag.initialize({data: ConnecTag.util.clone(data), preloadPlugins: false, callback: function () {
                ConnecTag.data.tags.pop();
                ConnecTag.track('hash', {pageId: '1000'}, 'protocol');
            }});

            expect(ConnecTag.matchers.pageId).toHaveBeenCalledWith('^100$','1000');
            expect(ConnecTag.matchers.hash).toHaveBeenCalled();
            expect(ConnecTag.matchers.protocol).toHaveBeenCalled();
        });
    });
});
