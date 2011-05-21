/*!
 * ConnecTag
 * Copyright 2010 iCrossing, Inc
 * Released under the LGPL license, see COPYING, COPYING.LESSER and LICENSE
 *
 * ConnecTag is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License or any later version.
 * ConnecTag is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTIBILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * You have received a copy of the GNU Lesser General Public License along with ConnecTag or see http://www.gnu.org/licenses/.
 * You are not required to accept this license since you have not signed it.  However, nothing else grants you permission to modify or distribute ConnecTag or its derivative works.  These actions are prohibited by law if you do not accept this license.  Therefore, by modifying or distributing ConnecTag (or any work based on ConnecTag), you indicate your acceptance of this license to do so, and all its terms and conditions for copying, distributing or modifying ConnecTag or works based on it.
 *
 * Version 0.9-b
 */

/*global ActiveXObject: false */
/*jshint asi: false, bitwise: true, boss: true, curly: true, eqeqeq: true, evil: true, forin: false, onevar: true, undef: true, white: true */
(function (global) {
    var ConnecTag, has, slice, toString, buildMatchData, match, preloadPlugins, Plugin, typeOf, isArray, isNull, isPlainObject, isCloneable, extend, clone, toRegExp, forEach, forIn, forOwnIn;

    // Some prototype methods
    slice = function (o) {
        return Array.prototype.slice.call(o);
    };

    has = function (o, property) {
        return Object.prototype.hasOwnProperty.call(o, property);
    };

    toString = function (o) {
        return Object.prototype.toString.call(o);
    };

    // Util
    /**
     * Identify an object as safe for recursive cloning or extending
     * @param o
     * @return {Boolean}
     */
    isCloneable = function (o) {
        return (isPlainObject(o) || isArray(o));
    };

    /**
     * Identify null (using identity comparison)
     * @param o
     * @return {Boolean}
     */
    isNull = function (o) {
        return o === null;
    };

    /**
     * Identify an array (using toString)
     * @param o
     * @return {Boolean}
     */
    isArray = Array.isArray || function (o) {
        return toString(o) === "[object Array]";
    };

    /**
     * Identify a plain object (not a document node, or the window, or a non-object)
     * @param o
     * @return {Boolean}
     */
    isPlainObject = function (o) {
        // This entire function is basically borrowed from jQuery
        var key;

        // This does not check for window objects from other frames
        if (typeOf(o) !== "object" || o.nodeType || o === global) {
            return false;
        }

        if (o.constructor && has(o, 'constructor') && has(o.constructor.prototype, 'isPrototypeOf')) {
            return false;
        }

        for (key in o) {}

        return key === undefined || has(o, key);
    };

    /**
     * Native typeof with corrected values for array and null
     * @param o
     * @return {String}
     */
    typeOf = function (o) {
        return isArray(o) ? "array" : (isNull(o) ? "null" : typeof o);
    };

    /**
     * Extend an object or array with properties of the others, recursive/clones if deep is true
     * @param {Boolean} [deep]
     * @param {Object|Array} target
     * @param {Object|Array} source
     * @return {Object|Array}
     */
    extend = function (/* deep, target, source, [source] */) {
        var target, args, deep;

        args = slice(arguments);
        deep = false;

        if (typeOf(args[0]) === "boolean") {
            deep = args.shift();
        }

        target = args.shift();

        forEach(args, function (source) {
            if (isCloneable(source)) {
                forIn(source, function (prop, value) {
                    if (deep && isCloneable(value)) {
                        if (typeOf(target[prop]) === typeOf(value)) {
                            target[prop] = extend(true, target[prop], value);
                        } else {
                            target[prop] = clone(value);
                        }
                    } else {
                        target[prop] = value;
                    }
                });
            }
        });

        return target;
    };

    /**
     * Recursively clone an object or array
     * @param o
     * @return {Object|Array}
     */
    clone = function (o) {
        return isCloneable(o) ? extend(true, isArray(o) ? [] : {}, o) : o;
    };

    /**
     * Convert a string or array of string|numbers to a RegExp
     * @param {Array|String|Number} patterns
     * @return {RegExp}
     */
    toRegExp = function (patterns) {
        var regex;

        regex = /$.+^/;

        if (isArray(patterns)) {
            patterns = patterns.join("|");
        }

        if (typeOf(patterns) === "number" || typeOf(patterns) === "string") {
            try {
                regex = new RegExp(patterns);
            } catch (e) {}
        }

        return regex;
    };

    /**
     * Iterate over the elements in an array. Return false to stop iteration.
     * @param {Array} arr
     * @param {Function} handler Called with item, index
     */
    forEach = function (arr, handler) {
        var i;

        for (i = 0; i < arr.length; i++) {
            if (handler(arr[i], i, arr) === false) {
                break;
            }
        }
    };

    /**
     * Iterate over the keys in an object. Return false to stop iteration.
     * @param {Object} obj
     * @param {Function} handler Called with key, value
     */
    forIn = function (obj, handler) {
        var key;

        for (key in obj) {
            if (handler(key, obj[key]) === false) {
                break;
            }
        }
    };

    /**
     * Iterate over the non-inherited keys in an object. Return false to stop iteration.
     * @param {Object} obj
     * @param {Function} handler Called with key, value
     */
    forOwnIn = function (obj, handler) {
        var key;

        for (key in obj) {
            if (has(obj, key)) {
                if (handler(key, obj[key]) === false) {
                    break;
                }
            }
        }
    };

    // Privates
    /**
     * Build a matchData object from specified matchers/matcher data
     * @private
     * @param {Array} matchers
     * @return {Object}
     */
    buildMatchData = function (matchers) {
        var matchData;

        matchData = {};

        if (matchers.length === 0) {
            forOwnIn(ConnecTag.matchers, function (key) {
                matchData[key] = undefined;
            });
        } else if (matchers.length > 0) {
            forEach(matchers, function (matcher) {
                if (typeOf(matcher) === "string") {
                    matchData[matcher] = undefined;
                } else if (typeOf(matcher) === "object") {
                    forOwnIn(matcher, function (key) {
                        matchData[key] = matcher[key];
                        return false;
                    });
                }
            });
        }

        return matchData;
    };

    /**
     * Execute matchers against matchPatterns and matchData
     * @private
     * @param {Object} matchPatterns
     * @param {Object} matchData
     * @return {Boolean}
     */
    match = function (patterns, data) {
        var result;

        forOwnIn(data, function (key) {
            var matcher;

            matcher = ConnecTag.matchers[key];

            if (matcher && matcher(patterns[key], data[key])) {
                result = true;

                return false;
            }
        });

        return result || false;
    };

    /**
     * Load plugins and execute callback when complete
     * @private
     * @param {Function} callback
     */
    preloadPlugins = function (callback) {
        var tags, count, callbackHandler;

        callback = callback || function () {};
        tags = ConnecTag.data.tags;
        count = tags.length;

        callbackHandler = function () {
            if (--count === 0) {
                callback();
            }
        };

        forEach(tags, function (tag) {
            ConnecTag.helpers.getScript(tag.plugin.path, callbackHandler);
        });
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
            var settings, callback;

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
            params.callback = ConnecTag.track;

            ConnecTag.initialize(params);
        },

        /**
         * Track against specified matchers
         * @param {String|Object} Any number of these
         */
        track: function (/* args */) {
            var args, instances, matchData, getPluginHandler;

            args = slice(arguments);
            instances = [];
            matchData = buildMatchData(args);
            getPluginHandler = function (tag) {
                return function () {
                    var plugin;

                    plugin = ConnecTag.plugins[tag.plugin.id];

                    if (plugin) {
                        plugin.track(tag.settings, tag.instances);
                    } else {
                        setTimeout(getPluginHandler(tag), 500);
                    }
                };
            };

            forEach(ConnecTag.data.tags, function (tag, i) {
                tag = clone(tag);
                instances = [];

                forEach(tag.instances, function (instance, j) {
                    instance.id = "T" + i + "I" + j;

                    if (match(instance.match, matchData)) {
                        instances.push(instance);
                    }
                });

                tag.instances = instances;
                if (tag.instances.length) {
                    if (!ConnecTag.plugins[tag.plugin.id]) {
                        ConnecTag.helpers.getScript(tag.plugin.path, getPluginHandler(tag));
                    } else {
                        getPluginHandler(tag)();
                    }
                }
            });
        },

        /**
         * Plugin constructor
         * Methods are overridden by object passed to constructor
         * @constructor
         */
        Plugin: (function () {
            var Plugin = function (o) {
                // Optional
                this.initialized = false;
                this.initialize = function () {};

                // Required
                this.methods = {};
                this.track = function (settings, tag) {};

                extend(true, this, o);
            };

            Plugin.prototype = {
                /**
                 * Execute a command object
                 * @param {Object} command
                 * @param {String} instanceId
                 */
                executeCommand: function (command, instanceId) {
                    var method, parameters;

                    method = command.method;
                    parameters = command.parameters;

                    if (typeOf(instanceId) !== "undefined") {
                        parameters.push(instanceId);
                    }

                    forEach(parameters, function (param) {
                        if (typeOf(param) === "object" && param.method) {
                            param = this.executeCommand(param, instanceId);
                        } else if (typeOf(param) === "string") {
                            param = ConnecTag.helpers.parseTemplate(param, ConnecTag.values);
                        }
                    });

                    return this.methods[method].apply(this, parameters);
                },

                /**
                 * Iterate over commands array and execute each
                 * @param {Array} commands
                 * @param {String} instanceId
                 */
                executeCommands: function (commands, instanceId) {
                    forEach(commands, function (command) {
                        this.executeCommand(command, instanceId);
                    });
                }
            };

            return Plugin;
        })(),

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
                var pattern, regGlobal, regExact, matches;

                pattern = '\\$\\{[^\\}]+\\}';
                regGlobal = new RegExp(pattern, 'g');
                regExact = new RegExp('^' + pattern + '$');

                if (typeOf(template) === "string") {
                    matches = template.match(regGlobal);

                    if (matches) {
                        forEach(matches, function (match) {
                            var name;

                            name = match.replace(/^\$\{|\}$/g, '');

                            if (regExact.test(template)) {
                                template = context[name];
                                return false;
                            } else {
                                template = template.replace(match, context[name]);
                            }
                        });
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
                var body, script, complete;

                body = global.document.getElementsByTagName('body')[0];

                script = global.document.createElement('script');
                script.type = "text/javascript";
                script.src = url;

                complete = function () {
                    callback();
                    body.removeChild(script);
                };

                body.appendChild(script);

                if (script.readyState && (script.onload !== null || script.onload !== undefined)) {
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
                var xhr, msxmls;

                msxmls = ["Msxml2.XMLHTTP.6.0", "Msxml2.XMLHTTP.3.0", "Msxml2.XMLHTTP"];

                if (global.XMLHttpRequest) {
                    xhr = new XMLHttpRequest();
                } else if (global.ActiveXObject) {
                    forEach(msxmls, function (msxml) {
                        try {
                            xhr = new ActiveXObject(msxml);
                            return false;
                        } catch (e) {}
                    });
                }

                return xhr;
            },

            /**
             * document.write replacement
             * If you would like to preserve document.write functionality override this helper with document.write
             * before calling ConnecTag.initialize/connect. We replace document.write because we're changing the
             * conditions under which vendor tags are loading and there's a possibility that they may call
             * document.write.
             */
            documentWrite: function () {
                // Intentionally blank
            },

            /**
             * Load JSON
             * @param {String} url
             * @param {Function} callback
             */
            getJson: function (url, callback) {
                var jsonpFn, jsonpUrl, request;

                callback = callback || function () {};
                jsonpFn = "jsonp_" + new Date().getTime();
                jsonpUrl = url.replace(/([^\&\?]*=)(\?)/, "$1" + jsonpFn);

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
                        if (request.readyState === 4 && request.status === 200) {
                            callback(ConnecTag.helpers.parseJson(request.responseText));
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
                } else if (!/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(jsonString.replace(/"(\\.|[^"\\])*"/g, ''))) {
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
            var locations, getLocationHandler, m;

            locations = ['hash', 'host', 'hostname', 'href', 'pathname', 'search', 'protocol', 'port'];
            getLocationHandler = function (property) {
                return function (pattern, values) {
                    var result;

                    pattern = toRegExp(pattern);
                    values = values || global.location[property];
                    values = isArray(values) ? values : [values];

                    forEach(values, function (value) {
                        if (pattern.test(value)) {
                            result = true;
                            return false;
                        }
                    });

                    return result || false;
                };
            };

            m = {
                /**
                 * Match against an event or array of event
                 * @param {String} pattern
                 * @param {String|Array} values
                 * @return {Boolean}
                 */
                event: function (pattern, values) {
                    var result;

                    pattern = toRegExp(pattern);
                    values = isArray(values) ? values : [values];

                    forEach(values, function (value) {
                        if (pattern.test(value)) {
                            result = true;
                            return false;
                        }
                    });

                    return result || false;
                },

                /**
                 * Match against a pageId
                 * @param {String} pattern
                 * @param {String|Array} values
                 * @return {Boolean}
                 */
                pageId: function (pattern, values) {
                    var result;

                    pattern = toRegExp(pattern);
                    values = values || ConnecTag.values.pageId;
                    values = isArray(values) ? values : [values];

                    forEach(values, function (value) {
                        if (pattern.test(value)) {
                            result = true;
                            return false;
                        }
                    });

                    return result || false;
                }
            };

            forEach(locations, function (prop) {
                m[prop] = getLocationHandler(prop);
            });

            // Alias location to href
            m.location = m.href;

            return m;
        })(),

        util: {
            typeOf: typeOf,
            isArray: isArray,
            isNull: isNull,
            isPlainObject: isPlainObject,
            isCloneable: isCloneable,
            extend: extend,
            clone: clone,
            toRegExp: toRegExp,
            forEach: forEach,
            forIn: forIn,
            forOwnIn: forOwnIn
        }
    };

    global.ConnecTag = ConnecTag;
})(this);
