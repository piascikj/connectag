/*global ConnecTag: false */
/*jslint windows: true, devel: true, browser: true, evil: true, forin: true, onevar: true */
(function (global) {
    var i, plugin,
    id = "googleAnalytics",
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
    ],
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
            this.initialized = true;
            ConnecTag.helpers.getScript((global.location.protocol == 'https:' ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js');
        },

        track: function (settings, instances) {
            var i, j, instance;

            global._gaq = global._gaq || [];

            for (i = 0; (instance = instances[i]); i++) {
                this.executeCommand({method: "_setAccount", parameters: [settings.account]}, instance.id);

                if (settings.autoCommands && settings.autoCommands.length) {
                    for (j = 0; j < settings.autoCommands.length; j++) {
                        this.executeCommand(settings.autoCommands[j]);
                    }
                }

                this.executeCommands(instance.commands, instance.id);
            }

            if (this.initialized === false) {
                this.initialize(settings);
            }
        }
    });

    // Build methods
    for (i = 0; i < methods.length; i++) {
        plugin.methods[methods[i]] = getMethodHandler(methods[i]);
    }

    ConnecTag.plugins[id] = plugin;
}(this));
