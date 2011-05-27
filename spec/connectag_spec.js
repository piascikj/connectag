describe("ConnecTag.exit/track", function () {
    beforeEach(function () {
        spyOn(ConnecTag, "track");
    });

    it("should return an object with a track method", function () {
        var result;

        result = ConnecTag.exit("/123");

        expect(typeof result).toEqual("object");
        expect(typeof result.track).toEqual("function");
    });

    it("should pass a callback to setTimeout with the default delay", function () {
        var args;

        args = [];
        spyOn(window, "setTimeout");

        ConnecTag.exit(null).track(args);

        expect(window.setTimeout).toHaveBeenCalled();
        expect(typeof window.setTimeout.mostRecentCall.args[0]).toEqual("function");
        expect(window.setTimeout.mostRecentCall.args[1]).toEqual(500);
        expect(ConnecTag.track).toHaveBeenCalledWith(args);
    });

    it("should allow override of default delay", function () {
        var expected, result;

        expected = 100;
        spyOn(window, "setTimeout").andCallFake(function (fn, delay) { result = delay; });

        ConnecTag.exit('/blah', expected).track();
        expect(expected).toEqual(result);
    });

    describe("redirection", function () {
        var url;

        beforeEach(function () {
            spyOn(window, "setTimeout").andCallFake(function (f) {f();});

            window.location.hash = "#";
            url = window.location.href + "#/" + new Date().getTime();
        });

        it("should set the location to the given url", function () {
            ConnecTag.exit(url).track();
            expect(window.location.href).toEqual(url);
        });

        it("should set the location given an anchor", function () {
            var a;

            a = document.createElement('a');
            a.href = url;

            ConnecTag.exit(a).track();
            expect(window.location.href).toEqual(url);
        });

        it("should set the location given an event", function () {
            var a, evt;

            a = document.createElement('a');
            a.href = url;
            evt = {target: a};

            ConnecTag.exit(evt).track();
            expect(window.location.href).toEqual(url);
        });
    });
});

describe("ConnecTag.track", function () {
    var plugin;

    beforeEach(function () {
        ConnecTag.data = {
            tags: [
                {
                    plugin: {id: "plugin"},
                    settings: {},
                    instances: [
                        {match: {pageId: "^1$"}, commands: [{method: "a_method", parameters: []}]}
                    ]
                }
            ]
        };

        ConnecTag.plugins["plugin"] = plugin = new ConnecTag.Plugin({id: "plugin", track: jasmine.createSpy()});
    });

    it("should call a plugin's track method if there is a match", function () {
        ConnecTag.values.pageId = "1";
        ConnecTag.track('pageId');

        // TODO Make this better!!
        expect(plugin.track).toHaveBeenCalled();
    });
});

describe("ConnecTag.connect", function () {
    it("should call initialize with params and set track as callback", function () {
        var params;

        params = {};

        spyOn(ConnecTag, "initialize");

        ConnecTag.connect(params);

        expect(params.callback).toBe(ConnecTag.track);
        expect(ConnecTag.initialize).toHaveBeenCalledWith(params);
    });
});

describe("ConnecTag.initialize", function () {
    it("should call getScript if given script and store the result", function () {
        var url, callback;

        url = "/path/to/config.js";
        callback = jasmine.createSpy();

        spyOn(ConnecTag.helpers, 'getScript').andCallFake(function (url, handler) { handler(); });

        ConnecTag.initialize({
            preloadPlugins: false,
            script: url,
            callback: callback
        });

        expect(ConnecTag.helpers.getScript.argsForCall[0][0]).toEqual(url);
        expect(callback).toHaveBeenCalled();
    });

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

    it("should call getJson if given json and store the result", function () {
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


describe("ConnecTag.initialize", function () {
    it("should assign data directly and call callback if data is passed", function () {
        var data;

        data = { tags: [] };

        ConnecTag.initialize({ data: data });
        expect(ConnecTag.data).toBe(data);
    });

    it("should retrieve json and call callback if json path is given", function () {
        var data, params;

        data = { tags: [] };
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
        var params;

        params = {
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
        var params

        params = {
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
        var params;

        params = {
            data: {
                tags: []
            },
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
    var data;

    data = {
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
