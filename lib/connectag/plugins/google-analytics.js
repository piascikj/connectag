/*global ConnecTag: false */
/*jshint asi: false, bitwise: false, boss: true, curly: true, debug: false, eqeqeq: true, eqnull: false, evil: false, forin: false, immed: true, noarg: true, noempty: false, nonew: false, onevar: false, undef: true, sub: true, white: true */
(function (global) {
    var plugin, id, methods, getMethodHandler;

    id = "googleAnalytics";

    methods = [
        '_addIgnoredOrganic',
        '_addIgnoredRef',
        '_addItem',
        '_addOrganic',
        '_addTrans',
        '_clearIgnoredOrganic',
        '_clearIgnoredRef',
        '_clearOrganic',
        '_cookiePathCopy',
        '_deleteCustomVar',
        '_getAccount',
        '_getClientInfo',
        '_getDetectFlash',
        '_getDetectTitle',
        '_getLinkerUrl',
        '_getLocalGifPath',
        '_getServiceMode',
        '_getVersion',
        '_getVisitorCustomVar',
        '_link',
        '_linkByPost',
        '_setAccount',
        '_setAllowAnchor',
        '_setAllowHash',
        '_setAllowLinker',
        '_setCampContentKey',
        '_setCampMediumKey',
        '_setCampNameKey',
        '_setCampNOKey',
        '_setCampSourceKey',
        '_setCampTermKey',
        '_setCampaignCookieTimeout',
        '_setCampaignTrack',
        '_setClientInfo',
        '_setCookiePath',
        '_setCustomVar',
        '_setDetectFlash',
        '_setDetectTitle',
        '_setDomainName',
        '_setLocalGifPath',
        '_setLocalRemoteServerMode',
        '_setLocalServerMode',
        '_setReferrerOverride',
        '_setRemoteServerMode',
        '_setSampleRate',
        '_setSessionCookieTimeout',
        '_setVisitorCookieTimeout',
        '_trackEvent',
        '_trackPageview',
        '_trackTrans'
    ];

    getMethodHandler = function (m) {
        return function () {
            var id, args, method;

            // Remove id, prepend to method, add method to args
            args = Array.prototype.slice.call(arguments, 0);
            id = args.pop();
            method = (id ? id + "." : "") + m;
            args.splice(0, 0, method);

            return global._gaq.push(args);
        };
    };

    plugin = new ConnecTag.Plugin({
        initialized: false,

        initialize: function (settings, callback) {
            var url;

            url = (global.location.protocol === 'https:' ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';

            // Build methods
            ConnecTag.util.forEach(methods, function (method) {
                plugin.methods[method] = getMethodHandler(method);
            });

            ConnecTag.helpers.getScript(url);

            this.initialized = true;
        },

        track: function (settings, instances) {
            global._gaq = global._gaq || [];

            ConnecTag.util.forEach(instances, function (instance) {
                this.executeCommand({
                    method: "_setAccount",
                    parameters: [settings.account]
                }, instance.id);

                if (settings.autoCommands && settings.autoCommands.length) {
                    this.executeCommands(settings.autoCommands, instance.id);
                }

                this.executeCommands(instance.commands, instance.id);
            });

            if (this.initialized === false) {
                this.initialize(settings);
            }
        }
    });

    ConnecTag.plugins[id] = plugin;
}(this));
