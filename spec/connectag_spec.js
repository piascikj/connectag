describe("ConnecTag.track", function () {
    var plugin1, plugin2, data;

    beforeEach(function () {
        data = {
            tags: [
                {
                    plugin: {id: "plugin1", path: ""},
                    settings: {},
                    instances: [
                        {
                            match: {pageId: "^100$"},
                            commands: [{method: "hello", parameters: []}],
                            instances: [
                                {
                                    match: {pageId: "^200$"},
                                    commands: [{method: "whllkjsdf", parameters: ["LKJL"]}]
                                },
                                {
                                    match: {pageId: "^100$"},
                                    commands: [{method: "hi", parameters: ["Hello"]}]
                                }
                            ]
                        },
                        {
                            match: {pageId: "^200$"},
                            commands: [{id: "A", method: "whatever", parameters: []}],
                            instances: [
                                {
                                    match: {pageId: "^200$"},
                                    commands: {
                                        disable: ['A'],
                                        enable: ['A'],
                                        before: {
                                            "A": [
                                                {method: 'whoa!', parameters: []}
                                            ]
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    plugin: {id: "plugin2", path: ""},
                    settings: {},
                    instances: [
                        {
                            match: {pageId: "^BLAH$"},
                            commands: [{method: "hello", parameters: []}],
                        }
                    ]
                }
            ]
        };

        plugin1 = new ConnecTag.Plugin({id: "plugin1", track: function () {}});
        plugin2 = new ConnecTag.Plugin({id: "plugin2", track: function () {}});

        ConnecTag.plugins['plugin1'] = plugin1;
        ConnecTag.plugins['plugin2'] = plugin2;
        ConnecTag.data = data;
    });

    it("should call track for each matching plugin", function () {
        ConnecTag.values.pageId = "100";
        spyOn(ConnecTag.matchers, 'pageId').andCallThrough();
        spyOn(ConnecTag.plugins.plugin1, 'track');
        spyOn(ConnecTag.plugins.plugin2, 'track');

        ConnecTag.track('pageId');

        expect(ConnecTag.matchers.pageId).toHaveBeenCalled();
        expect(ConnecTag.plugins.plugin1.track).toHaveBeenCalled();
        expect(ConnecTag.plugins.plugin2.track).not.toHaveBeenCalled();
    });

    it("should match against multiple arguments if given", function () {
        spyOn(ConnecTag.matchers, 'pageId');
        spyOn(ConnecTag.matchers, 'hash');
        spyOn(ConnecTag.matchers, 'protocol');

        ConnecTag.track('hash', {pageId: '1000'}, 'protocol');

        expect(ConnecTag.matchers.pageId).toHaveBeenCalledWith('^100$','1000');
        expect(ConnecTag.matchers.hash).toHaveBeenCalled();
        expect(ConnecTag.matchers.protocol).toHaveBeenCalled();
    });

    it("should replace the root commands if nested commands are an array and has a match", function () {
        var commands;

        ConnecTag.values.pageId = "100";
        spyOn(plugin1, 'track').andCallFake(function (settings, instances) {
            commands = instances[0].commands;
        });

        ConnecTag.track('pageId');

        expect(commands).toEqual(data.tags[0].instances[0].instances[1].commands);
    });

    it("should apply specified modifiers", function () {
        ConnecTag.values.pageId = "200";
        spyOn(ConnecTag.modifiers, 'disable').andCallThrough();
        spyOn(ConnecTag.modifiers, 'enable').andCallThrough();
        spyOn(ConnecTag.modifiers, 'before').andCallThrough();

        ConnecTag.track('pageId');

        expect(ConnecTag.modifiers.disable).toHaveBeenCalled();
        expect(ConnecTag.modifiers.enable).toHaveBeenCalled();
        expect(ConnecTag.modifiers.before).toHaveBeenCalled();
    });
});

describe("ConnecTag.connect", function () {
    it("should call initialize with params and set track as callback", function () {
        var params

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
