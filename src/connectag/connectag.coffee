###*
ConnecTag
Copyright 2010 iCrossing, Inc
Released under the LGPL license, see COPYING, COPYING.LESSER and LICENSE

ConnecTag is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License or any later version.
ConnecTag is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTIBILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
You have received a copy of the GNU Lesser General Public License along with ConnecTag or see http://www.gnu.org/licenses/.
You are not required to accept this license since you have not signed it.  However, nothing else grants you permission to modify or distribute ConnecTag or its derivative works.  These actions are prohibited by law if you do not accept this license.  Therefore, by modifying or distributing ConnecTag (or any work based on ConnecTag), you indicate your acceptance of this license to do so, and all its terms and conditions for copying, distributing or modifying ConnecTag or works based on it.

Version 0.9.3
###

has = (object, property) ->
    Object.prototype.hasOwnProperty.call(object, property)

toString = (object) ->
    Object.prototype.toString.call(object)


# Util

###*
Identify an object as safe for recursive cloning
@param object Object to test
@return {boolean}
###
isCloneable = (object) ->
    isPlainObject(object) || isArray(object)

###*
Identify null (using identity comparison)
@param object Object to test
@return {boolean}
###
isNull = (object) ->
    object is null

###*
Identify an array (using toString or native isArray)
@param object Object to test
@return {boolean}
###
isArray = (object) ->
    if Array.isArray then Array.isArray(object) else (toString(object) is "[object Array]")

###*
Identify a plain object (not an html element, window, or a non-object)
@param object Object to test
@return {boolean}
###
isPlainObject = (object) ->
    return false if typeOf(object) isnt "object" or object.nodeType? or object is window
    return false if object.constructor and has(object, "constructor") and has(object.constructor.prototype, "isPrototypeOf")

    for key of object
        key

    key is undefined or has(object, key)

###*
Native typeof with "corrected" values for array and null
@param object Object to test
@return {string}
###
typeOf = (object) ->
    if isArray(object)
        "array"
    else
        if isNull(object)
            "null"
        else
            typeof object

###*
Extend an object or array with properties of the others, recursive/clones if deep is true
@param {boolean} [deep]
@param {object|array} target
@param {object|array} source
@return {object|array}
###
extend = (args...) ->
    deep = if typeOf(args[0]) is "boolean" then args.shift() else false
    target = args.shift()

    for source in args
        if isCloneable(source)
            for prop, value of source
                if deep and isCloneable(value)
                    if typeOf(target[prop]) is typeOf(value)
                        target[prop] = extend(true, target[prop], value)
                    else
                        target[prop] = clone(value)
                else
                    target[prop] = value

    target

###*
Recursively clone an object or array
@param object
@return {object|array}
###
clone = (object) ->
    if isCloneable(object)
        target = if isArray(object) then [] else {}
        extend(true, target, object)
    else
        object

###*
Convert a string or array of string|numbers to a RegExp
@param {array|string|number} patterns
@return {RegExp}
###
toRegExp = (patterns) ->
    regex = /$.+^/ # Always fail
    patterns = if isArray(patterns) then patterns.join("|") else patterns

    if typeOf(patterns) in ["number", "string"]
        try regex = new RegExp(patterns)

    regex

# Privates

###*
Build a matchData object from specified matchers/matcher data
@private
@param {array} matchers
@return {object}
###
buildMatchData = (matchers) ->
    matchData = {}

    if matchers.length is 0
        for own key of ConnecTag.matchers
            matchData[key] = undefined
    else if matchers.length > 0
        for matcher in matchers
            if typeOf(matcher) is "string"
                matchData[matcher] = undefined
            else if typeOf(matcher) is "object"
                for own key of matcher
                    matchData[key] = matcher[key]

    matchData

###*
Recursivly process matching nested instances
@param {array} commands Array of command objects
@param {object} matchData MatchData object from buildMatchData
@param {object} instance Tag instance
@return {array}
###
buildCommands = (commands, matchData, instance) ->
    if match(instance.match, matchData)
        commands = modifyCommands(commands, instance.commands)

        if instance.instances
            for inst in instance.instances
                commands = buildCommands(commands, matchData, inst)

    commands

###*
Alter the given commands array by applying modifier methods and data to it
@param {array} commands Array of command objects
@param {object} modifiers Command modifier object
@return {array}
###
modifyCommands = (commands, modifiers) ->
    return modifiers if isArray(modifiers)

    for own modifier, data in modifiers
        if ConnecTag.modifiers[modifier]
            commands = ConnecTag.modifiers[modifier](commands, data)

    commands

###*
Execute matchers against matchPatterns and matchData
@private
@param {object} matchPatterns
@param {object} matchData
@return {boolean}
###
match = (patterns, data) ->
    for own key of data
        matcher = ConnecTag.matchers[key]

        if matcher and matcher(patterns[key], data[key])
            return true

    false

###*
Load plugins and execute callback when complete
@private
@param {Function} callback
###
preloadPlugins = (callback = () ->) ->
    tags = ConnecTag.data.tags
    count = tags.length

    callbackHandler = () ->
        callback() if --count is 0

    for tag in tags
        ConnecTag.helpers.getScript(tag.plugin.path, callbackHandler)

###*
Plugin class
Methods are overridden by object passed to constructor
@constructor
###
class Plugin
    constructor: (object) ->
        @initialized = false
        @initialize = () ->
        @methods = {}
        @track = (settings, tag) ->

        extend(true, @, object)

    ###*
    Execute a command object
    @param {object} command
    @param {string} instanceId
    ###
    executeCommand: (command, instanceId) ->
        method = command.method
        parameters = command.parameters

        parameters.push(instanceId) if instanceId?

        for param in parameters
            if typeOf(param) is "string" and param.method?
                param = @executeCommand(param, instanceId)
            else if typeOf(param) is "string"
                param = ConnecTag.helpers.parseTemplate(param, ConnecTag.values)

        @methods[method].apply(@, parameters)

    ###*
    Iterate over commands array and execute each
    @param {array} commands
    @param {string} instanceId
    ###
    executeCommands: (commands, instanceId) ->
        for command in commands
            @executeCommand(command, instanceId)

        return

ConnecTag =
    ###*
    @param {object} params
    @param {string} [params.json] Path to configuration JSON or JSONP
    @param {string} [params.script] Path to configuration script
    @param {string} [params.data] Configuration object
    @param {boolean} [params.preloadPlugins] Preload plugins?
    @param {boolean} [params.replaceDocWrite] Replace document.write?
    @param {function} [params.callback] Callback function executed when initialize is complete
    ###
    initialize: (params) ->
        settings = extend({
            data: null
            script: null
            json: null
            preloadPlugins: true
            replaceDocWrite: true
            callback: () ->
        }, params)

        if settings.preloadPlugins
            callback = settings.callback
            settings.callback = () -> preloadPlugins(callback)

        # Replace document.write in case any of the vendor code was expecting to be added DURING load
        # ConnecTag should be the last script loaded just before the close of the body tag.
        # This is not optimal, but we *are* changing the way these scripts expect to be loaded.
        # To prevent this behavior, set replaceDocWrite to false when initializing.
        # To replace this with a better document.write stand-in do this before calling initialize: ConnecTag.helpers.documentWrite = yourFunctionHere
        if settings.replaceDocWrite
            window.document.write = ConnecTag.helpers.documentWrite

        # Load configuration based on data type
        if settings.data
            ConnecTag.data = settings.data
            settings.callback()
        else if settings.json
            ConnecTag.helpers.getJson settings.json, (data) ->
                ConnecTag.data = data
                settings.callback()
        else if settings.script
            ConnecTag.data = {}
            ConnecTag.helpers.getScript settings.script, () ->
                settings.callback()

        return

    ###*
    Call initialize and then call track all when complete
    @param {object} params Params is passed to initialize (with the exception of callback)
    ###
    connect: (params = {}) ->
        params.callback = ConnecTag.track
        ConnecTag.initialize(params)

    ###*
    Track against specified matchers
    @param {string|object} Any number of these
    ###
    track: (args...) ->
        instances = []
        matchData = buildMatchData(args)
        getPluginHandler = (tag) ->
            () ->
                plugin = ConnecTag.plugins[tag.plugin.id]

                if plugin
                    plugin.track(tag.settings, tag.instances)
                else
                    setTimeout(getPluginHandler(tag), 500)

        for tag, i in ConnecTag.data.tags
            tag = clone(tag)
            instances = []

            for instance, j in tag.instances
                instance.id = "T#{i}I#{j}"

                if match(instance.match, matchData)
                    instance.commands = buildCommands(instance.commands, matchData, instance)
                    instances.push(instance)

            tag.instances = instances
            if tag.instances.length
                if not ConnecTag.plugins[tag.plugin.id]?
                    ConnecTag.helpers.getScript(tag.plugin.path, getPluginHandler(tag))
                else
                    getPluginHandler(tag)()

    ###*
    Set up a callback/timeout for exit links
    @param {string|object} object
    @param {number} delay
    @return {object}
    ###
    exit: (object, delay = 500) ->
        if object
            if typeOf(object) is "string"
                url = object
            else if object.target?.href
                url = object.target.href
            else if object.href
                url = object.href

        callback = if url then () -> window.location = url else () ->

        return {
            track: () ->
                ConnecTag.track.apply(ConnecTag, arguments)
                window.setTimeout(callback, delay)

                false
        }

    Plugin: Plugin

    ###*
    Configuration data
    @type {object}
    ###
    data: {}

    ###*
    Object to store vendor plugins
    @type {object}
    ###
    plugins: {}

    ###*
    Object to store dynamic variables set on the page
    @type {object}
    ###
    values: {}

    ###*
    Helpers namespace for helper functions
    The helper functions can be overridden in the snippet if you have a more efficient or better implementation... and you probably do.
    For example, you could replace getScript with a wrapper around jQuery's getScript or replace parseJson with a wrapper around Crockford's JSON.parse.
    @namespace
    ###
    helpers:
        ###*
        Parse a string template
        @param {string} template
        @param {object} context
        ###
        parseTemplate: (template, context) ->
            pattern = '\\$\\{[^\\}]+\\}'
            regGlobal = new RegExp(pattern, 'g')
            regExact = new RegExp('^' + pattern + '$')

            if typeOf(template) is "string"
                matches = template.match(regGlobal)

                if matches
                    for match in matches
                        name = match.replace(/^\$\{|\}$/g, '')

                        if regExact.test(template)
                            template = context[name]
                            break
                        else
                            template = template.replace(match, context[name])

            template

        ###*
        Load a script
        @param {string} url
        @param {function} [callback]
        ###
        getScript: (url, callback = () ->) ->
            body = window.document.getElementsByTagName('body')[0]

            script = window.document.createElement('script')
            script.type = "text/javascript"
            script.src = url

            complete = () ->
                callback()
                body.removeChild(script)

            body.appendChild(script)

            if script.readyState and script.onload?
                script.onreadystatechange = () ->
                    if script.readyState is "loaded" or script.readyState is "completed"
                        complete()
                        script.onreadystatechange = null
            else
                script.onload = () ->
                    complete()
                    return

        ###*
        Get an instance of XMLHttpRequest or ActiveXObject
        @return {XMLHttpRequest|ActiveXObject}
        ###
        getXMLHttpRequest: () ->
            msxmls = ["Msxml2.XMLHTTP.6.0", "Msxml2.XMLHTTP.3.0", "Msxml2.XMLHTTP"]

            if window.XMLHttpRequest
                xhr = new XMLHttpRequest()
            else if window.ActiveXObject
                for msxml in msxmls
                    try xhr = new ActiveXObject(msxml)

            xhr

        ###*
        document.write replacement
        If you would like to preserve document.write functionality override this helper with document.write
        before calling ConnecTag.initialize/connect. We replace document.write because we're changing the
        conditions under which vendor tags are loading and there's a possibility that they may call
        document.write.
        ###
        documentWrite: () -> # Intentionally blank

        ###*
        Load JSON
        @param {string} url
        @param {function} callback
        ###
        getJson: (url, callback = () ->) ->
            jsonpFn = "jsonp_#{new Date().getTime()}"
            jsonpUrl = url.replace(/([^\&\?]*=)(\?)/, "$1" + jsonpFn)

            if url isnt jsonpUrl
                window[jsonpFn] = callback

                ConnecTag.helpers.getScript jsonpUrl, () ->
                    window[jsonpFn] = null
                    try delete window[jsonpFn]
            else
                request = ConnecTag.helpers.getXMLHttpRequest()
                request.open("GET", url, true)
                request.onreadystatechange = () ->
                    if request.readyState is 4 and request.status is 200
                        callback(ConnecTag.helpers.parseJson(request.responseText))

                request.send(null)

        ###*
        Parse a json string to an object
        @param {string} jsonString
        @return {object|array}
        ###
        parseJson: (jsonString) ->
            if window.JSON and window.JSON.parse
                JSON.parse(jsonString)
            else if !/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(jsonString.replace(/"(\\.|[^"\\])*"/g, ''))
                eval('(' + jsonString + ')')
            else
                throw new SyntaxError('JSON syntax error')

    ###*
    Matchers namespace for functions that check whether a tag instance or transformer executes
    @namespace
    ###
    matchers: (() ->
        locations = ['hash', 'host', 'hostname', 'href', 'pathname', 'search', 'protocol', 'port']
        getLocationHandler = (property) ->
            (pattern, values) ->
                pattern = toRegExp(pattern)
                values ||= window.location[property]
                values = if isArray(values) then values else [values]

                for value in values
                    return true if pattern.test(value)

                false

        matchers =
            ###*
            Match against an event or array of event
            @param {string} pattern
            @param {string|array} values
            @return {boolean}
            ###
            event: (pattern, values) ->
                pattern = toRegExp(pattern)
                values = if isArray(values) then values else [values]

                for value in values
                    return true if pattern.test(value)

                false

            ###*
            Match against a pageId
            @param {string} pattern
            @param {string|array} values
            @return {boolean}
            ###
            pageId: (pattern, values) ->
                pattern = toRegExp(pattern)
                values ||= ConnecTag.values.pageId
                values = if isArray(values) then values else [values]

                for value in values
                    return true if pattern.test(value)

                false

        for loc in locations
            matchers[loc] = getLocationHandler(loc)

        # Alias location to href
        matchers.location = matchers.href

        matchers
    )()

    ###*
    Namespace for utility methods
    @namespace
    ###
    util:
        typeOf: typeOf
        isArray: isArray
        isNull: isNull
        isPlainObject: isPlainObject
        isCloneable: isCloneable
        extend: extend
        clone: clone
        toRegExp: toRegExp

window.ConnecTag = ConnecTag
