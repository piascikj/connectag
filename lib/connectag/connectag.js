/**!@preserve
 *
 * ConnecTag
 * Copyright (c) 2010 iCrossing, Inc
 * Released under the LGPL license, see COPYING, COPYING.LESSER and LICENSE
 *
 * ConnecTag is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License or any later version.
 * ConnecTag is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTIBILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * You have received a copy of the GNU Lesser General Public License along with ConnecTag or see http://www.gnu.org/licenses/.
 * You are not required to accept this license since you have not signed it.  However, nothing else grants you permission to modify or distribute ConnecTag or its derivative works.  These actions are prohibited by law if you do not accept this license.  Therefore, by modifying or distributing ConnecTag (or any work based on ConnecTag), you indicate your acceptance of this license to do so, and all its terms and conditions for copying, distributing or modifying ConnecTag or works based on it.
 *
 * Version 0.9-b
 */

/*jslint windows: true, devel: true, browser: true, evil: true, forin: true, onevar: true */
(function (global) {
    var ConnecTag,

    // Utility functions
    isArray,
    isNull,
    isPlainObject,
    isCloneable,
    typeOf,
    extend,
    clone,
    toRegExp,

    // Useful prototypes
    slice = Array.prototype.slice,
    toString = Object.prototype.toString,
    has = Object.prototype.hasOwnProperty,

    // Don't show people your privates
    /**
     * Build a matchData object from specified matchers/matcher data
     * @param {Array} matchers
     * @return {Object}
     */
    buildMatchData = function (matchers) {
        var undef, key, matchData = {};

        if (matchers.length === 0) {
            for (key in ConnecTag.matchers) { if (has.call(ConnecTag.matchers, key)) {
                matchData[key] = undef;
            }}
        } else if (matchers.length > 0) {
            for (i = 0; i < matchers.length; i++) {
                if (typeOf(matchers[i]) === "string") {
                    matchData[matchers[i]] = undef;
                } else if (typeOf(matchers[i]) === "object") {
                    for (key in matchers[i]) { if (has.call(matchers[i], key)) {
                        matchData[key] = matchers[i][key];
                        break;
                    }}
                }
            }
        }

        return matchData;
    },

    /**
     * Execute matchers against matchPatterns and matchData
     * @param {Object} matchPatterns
     * @param {Object} matchData
     * @return {Boolean}
     */
    match = function (matchPatterns, matchData) {
        var type, matcher;

        for (type in matchData) { if (has.call(matchData, type)) {
            matcher = ConnecTag.matchers[type];

            if (matcher && matcher(matchPatterns[type], matchData[type])) {
                return true;
            }
        }}

        return false;
    },

    /**
     * Load plugins and execute callback when complete
     * @param {Function} callback
     */
    preloadPlugins = function (callback) {
        var i,
        callback = callback || function () {},
        tags = ConnecTag.data.tags,
        count = tags.length;

        for (i = 0; i < tags.length; i++) {
            ConnecTag.helpers.getScript(tags[i].plugin.path, function () {
                if (--count === 0) {
                    callback();
                }
            });
        }
    };


    ConnecTag = {
        /**
         * Initialize ConnecTag
         * @param {Object} params
         * @param {String} [params.json] Path to configuration JSON or JSONP
         * @param {String} [params.script] Path to configuration script
         * @param {String} [params.data] Configuration object
         * @param {Boolean} [params.preloadPlugins] Preload plugins?
         * @param {Boolean} [params.replaceDocWrite] Replace document.write?
         * @param {Function} [params.callback] Callback function executed when initialize is complete
         */
        initialize: function (params) {
            var callback,
            settings = extend({
                data: null,
                script: null,
                json: null,
                preloadPlugins: true,
                replaceDocWrite: true,
                callback: function () {}
            }, params);

            // Set up plugin preloader call
            if (settings.preloadPlugins) {
                callback = settings.callback;

                settings.callback = function () {
                    preloadPlugins(callback);
                };
            }

            // Replace document.write in case any of the vendor code was expecting to be added DURING load
            // ConnecTag should be the last script loaded just before the close of the body tag.
            // This is not optimal, but we *are* changing the way these scripts expect to be loaded.
            // 
            // To prevent this behavior, set replaceDocWrite to false when initializing.
            // To replace this with a better document.write stand-in do this before calling initialize: ConnecTag.helpers.documentWrite = yourFunctionHere
            if (settings.replaceDocWrite) {
                document.write = ConnecTag.helpers.documentWrite;
            }

            // Load configuration based on data type
            if (settings.data) {
                ConnecTag.data = settings.data;
                settings.callback();
            } else if (settings.json) {
                ConnecTag.helpers.getJson(settings.json, function (data) {
                    ConnecTag.data = data;
                    settings.callback();
                });
            } else if (settings.script) {
                ConnecTag.data = {};
                ConnecTag.helpers.getScript(settings.script, function () {
                    settings.callback();
                });
            }
        },

        /**
         * Call initialize and then call track all when complete
         * @param {Object} params Params is passed to initialize (with the exception of callback)
         */
        connect: function (params) {
            params = params || {};
            params.callback = function () {
                ConnecTag.track();
            };

            ConnecTag.initialize(params);
        },

        /**
         * Track against specified matchers
         * @param {String|Object} Any number of these
         */
        track: function (/* arguments */) {
            var i, j, tag, instance,
            instances = [],
            args = slice.call(arguments, 0),
            matchData = buildMatchData(args),
            getPluginHandler = function (tag) {
                return function () {
                    var plugin = ConnecTag.plugins[tag.plugin.id];

                    if (plugin) {
                        plugin.track(tag.settings, tag.instances);
                    } else {
                        setTimeout(getPluginHandler(tag), 500);
                    }
                };
            };

            for (i = 0; (tag = clone(ConnecTag.data.tags[i])); i++) {
                instances = [];
                for (j = 0; (instance = tag.instances[j]); j++) {
                    instance.id = "T" + i + "I" + j;
                    if (match(instance.match, matchData)) {
                        instances.push(instance);
                    }
                }

                tag.instances = instances;
                if (tag.instances.length) {
                    if (!ConnecTag.plugins[tag.plugin.id]) {
                        ConnecTag.helpers.getScript(tag.plugin.path, getPluginHandler(tag));
                    } else {
                        (getPluginHandler(tag)());
                    }
                }
            }
        },

        /**
         * Configuration data
         * @type {Object}
         */
        data: {},

        /**
         * Object to store vendor plugins
         * @type {Object}
         */
        plugins: {},

        /**
         * Object to store dynamic values set on the page
         * @type {Object}
         */
        values: {},

        /**
         * Utility function namespace
         * @namespace
         */
        util: {},

        /**
         * Helpers namespace for helper functions
         * The helper functions can be overridden in the snippet if you have a more efficient or better implementation... and you probably do.
         * For example, you could replace getScript with a wrapper around jQuery's getScript or replace parseJson with a wrapper around Crockford's JSON.parse.
         * @namespace
         */
        helpers: {
            /**
             * Parse a string template
             * @param {String} template
             * @param {Object} context
             */
            parseTemplate: function (template, context) {
                var i, name, match, matches, 
                pattern = '\\$\\{[^\\}]+\\}',
                regGlobal = new RegExp(pattern, 'g'),
                regExact = new RegExp('^' + pattern + '$');

                if (typeof template === "string") {
                    matches = template.match(regGlobal);

                    if (matches) {
                        for (i = 0; (match = matches[i]); i++) {
                            name = match.replace(/^\$\{|\}$/g, '');

                            if (regExact.test(template)) {
                                return context[name];
                            } else {
                                template = template.replace(match, context[name]);
                            }
                        }
                    }
                }

                return template;
            },

            /**
             * Load a script
             * @param {String} url
             * @param {Function} [callback]
             */
            getScript: function (url, callback) {
                var complete,
                body = document.getElementsByTagName('body')[0],
                script = document.createElement('script');

                script.type = "text/javascript";
                script.src = url;

                callback = callback || function () {};
                complete = function () {
                    callback();
                    body.removeChild(script);
                };

                body.appendChild(script);

                if (script.readyState && script.onload !== null) {
                    script.onreadystatechange = function () {
                        if (script.readyState === "loaded" || script.readyState === "completed") {
                            complete();
                            script.onreadystatechange = null;
                        }
                    };
                } else {
                    script.onload = function () {
                        complete();
                        return;
                    };
                }
            },

            /**
             * Get an instance of XMLHttpRequest or ActiveXObject
             * @return {XMLHttpRequest|ActiveXObject}
             */
            getXMLHttpRequest: function () {
                var i, msxml, msxmls = ["Msxml2.XMLHTTP.6.0","Msxml2.XMLHTTP.3.0","Msxml2.XMLHTTP"];

                if (global.XMLHttpRequest) {
                    return new XMLHttpRequest();
                } else if (global.ActiveXObject) {
                    for (i = 0; (msxml = msxmls[i]); i++) {
                        try { 
                            return new ActiveXObject(msxml);
                        } catch (e) {}
                    }
                }
            },

            /**
             * document.write replacement
             * If you would like to preserve document.write functionality override this helper with document.write
             * before calling ConnecTag.initialize/connect. We replace document.write because we're changing the
             * conditions under which vendor tags are loading and there's a possibility that they may call
             * document.write.
             */
            documentWrite: function () {
                // This function intentionally left blank
            },

            /**
             * Load JSON
             * @param {String} url
             * @param {Function} callback
             */
            getJson: function (url, callback) {
                var request,
                jsonpFn = 'jsonp_' + new Date().getTime(),
                jsonpUrl = url.replace(/([^\&\?]*=)(\?)/, '$1' + jsonpFn);

                if (url !== jsonpUrl) {
                    global[jsonpFn] = callback;

                    ConnecTag.helpers.getScript(jsonpUrl, function () {
                        global[jsonpFn] = null;
                        try {
                            delete global[jsonpFn];
                        } catch (e) {}
                    });
                } else {
                    request = ConnecTag.helpers.getXMLHttpRequest();
                    request.open("GET", url, true);
                    request.onreadystatechange = function () {
                        if (request.readyState === 4) {
                            if (request.status === 200) {
                                callback(ConnecTag.helpers.parseJson(request.responseText));
                            }
                        }
                    };

                    request.send(null);
                }
            },

            /**
             * Parse a json string to an object
             * @param {String} jsonString
             * @return {Object|Array}
             */
            parseJson: function (jsonString) {
                if (global.JSON && global.JSON.parse) {
                    return JSON.parse(jsonString);
                } else if (!(/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(jsonString.replace(/"(\\.|[^"\\])*"/g, '')))) {
                    return eval('(' + jsonString + ')');
                } else {
                    throw new SyntaxError('JSON syntax error');
                }
            }
        },

        /**
         * Matchers namespace for functions that check whether a tag instance or transformer executes
         * @namespace
         */
        matchers: (function () {
            var i,
            matchers = {
                /**
                 * Match against an event or array of event
                 * @param {String} pattern
                 * @param {String|Array} values
                 * @return {Boolean}
                 */
                event: function (pattern, values) {
                    var i;

                    pattern = toRegExp(pattern);
                    values = isArray(values) ? values: [values];

                    for (i = 0; i < values.length; i++) {
                        if (pattern.test(values[i])) {
                            return true;
                        }
                    }

                    return false;
                },

                /**
                 * Match against a pageId
                 * @param {String} pattern
                 * @param {String|Array} values
                 * @return {Boolean}
                 */
                pageId: function (pattern, values) {
                    var i;

                    pattern = toRegExp(pattern);
                    values = values || ConnecTag.values.pageId;
                    values = isArray(values) ? values: [values];

                    for (i = 0; i < values.length; i++) {
                        if (pattern.test(values[i])) {
                            return true;
                        }
                    }

                    return false;
                }
            },
            getLocationHandler = function (property) {
                return function (pattern, values) {
                    var i;

                    values = values ? (isArray(values) ? values : [values]) : [global.location[property]];

                    for (i = 0; i < values.length; i++) {
                        if (toRegExp(pattern).test(values[i])) {
                            return true;
                        }
                    }

                    return false;
                };
            },
            locations = ['hash','host','hostname','href','pathname','search','protocol','port'];

            for (i = 0; i < locations.length; i++) {
                matchers[locations[i]] = getLocationHandler(locations[i]);
            }

            // Alias location to href
            matchers.location = matchers.href;

            return matchers;
        }())
    };

    /**
     * Plugin constructor
     * Methods are overridden by object passed to constructor
     * @constructor
     */
    ConnecTag.Plugin = function (o) {
        // Optional
        this.initialized = false;
        this.initialize = function () {};

        // Pretty much required
        this.methods = {};
        this.track = function (settings, tag) {};

        extend(true, this, o);
    };

    ConnecTag.Plugin.prototype = {
        /**
         * Execute a command object
         * @param {Object} command
         * @param {String} instanceId
         */
        executeCommand: function (command, instanceId) {
            var i,
            method = command.method,
            parameters = command.parameters;

            if (typeOf(instanceId) !== "undefined") {
                parameters.push(instanceId);
            }

            for (i = 0; i < parameters.length; i++) {
                // Is the parameter another command?
                if (typeOf(parameters[i]) === "object" && parameters[i].method) {
                    parameters[i] = this.executeCommand(parameters[i], instanceId);
                // Could the parameter contain a template?
                } else if (typeOf(parameters[i]) === "string") {
                    parameters[i] = ConnecTag.helpers.parseTemplate(parameters[i], ConnecTag.values);
                }
            }

            return this.methods[method].apply(this, parameters);
        },

        /**
         * Iterate over commands array and execute each
         * @param {Array} commands
         * @param {String} instanceId
         */
        executeCommands: function (commands, instanceId) {
            var i;

            for (i = 0; i < commands.length; i++) {
                this.executeCommand(commands[i], instanceId);
            }
        }
    };


    /**
     * Identify an object as safe for recursive cloning or extending
     * @param o
     * @return {Boolean}
     */
    ConnecTag.util.isCloneable = isCloneable = function (o) {
        return (isPlainObject(o) || isArray(o));
    };

    /**
     * Identify null (using identity comparison)
     * @param o
     * @return {Boolean}
     */
    ConnecTag.util.isNull = isNull = function (o) {
        return o === null;
    };

    /**
     * Identify an array (using toString)
     * @param o
     * @return {Boolean}
     */
    ConnecTag.util.isArray = isArray = Array.isArray || function (o) {
        return toString.call(o) === "[object Array]";
    };

    /**
     * Identify a plain object (not a document node, or the window, or a non-object)
     * @param o
     * @return {Boolean}
     */
    ConnecTag.util.isPlainObject = isPlainObject = function (o) {
        // Credit to jQuery team for this entire function
        var key;

        // This does not check for window objects from other frames
        if (typeOf(o) !== "object" || o.nodeType || o === global) {
            return false;
        }

        if (o.constructor && has.call(o, 'constructor') && has.call(o.constructor.prototype, 'isPrototypeOf')) {
            return false;
        }

        for (key in o) {}

        return key === undefined || has.call(o, key);
    };

    /**
     * Native typeof with corrected values for array and null
     * @param o
     * @return {String}
     */
    ConnecTag.util.typeOf = typeOf = function (o) {
        return isArray(o) ? "array" : (isNull(o) ? "null" : typeof o);
    };

    /**
     * Extend an object or array with properties of the others, recursive/clones if deep is true
     * @param {Boolean} [deep]
     * @param {Object|Array} target
     * @param {Object|Array} source
     * @return {Object|Array}
     */
    ConnecTag.util.extend = extend = function (/* deep, target, source, [source] */) {
        var i, prop, target, source,
        args = slice.call(arguments),
        deep = false;

        if (typeOf(args[0]) === "boolean") {
            deep = args.shift();
        }

        target = args.shift();

        for (i = 0; (source = args[i]); i++) {
            if (isCloneable(source)) {
                for (prop in source) {
                    if (deep && isCloneable(source[prop])) {
                        if (typeOf(target[prop]) === typeOf(source[prop])) {
                            target[prop] = extend(true, target[prop], source[prop]);
                        } else {
                            target[prop] = clone(source[prop]);
                        }
                    } else {
                        target[prop] = source[prop];
                    }
                }
            }
        }

        return target;
    };

    /**
     * Recursively clone an object or array
     * @param o
     * @return {Object|Array}
     */
    ConnecTag.util.clone = clone = function (o) {
        return isCloneable(o) ? extend(true, isArray(o) ? [] : {}, o) : o;
    };

    /**
     * Convert a string or array of string|numbers to a RegExp
     * @param {Array|String|Number} patterns
     * @return {RegExp}
     */
    ConnecTag.util.toRegExp = toRegExp = function (patterns) {
        var regex = /$.+^/; 

        if (isArray(patterns)) {
            patterns = patterns.join("|");
        }

        if (typeOf(patterns) in {"number":0, "string":0}) {
            try {
                regex = new RegExp(patterns);
            } catch (e) {}
        }

        return regex;
    };

    global.ConnecTag = ConnecTag;
}(this));
