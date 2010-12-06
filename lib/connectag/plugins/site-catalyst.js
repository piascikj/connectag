/*global ConnecTag: false */
/*jslint windows: true, devel: true, browser: true, evil: true, forin: true, onevar: true */
(function (global) {
    var i, plugin, type,
    id = "siteCatalyst",
    methods = {
        calls: [
            't',
            'sa',
            'tl',
            'setupFormAnalysis',
            'sendFormEvent',
            'getAndPersistValue',
            'getCookieCount',
            'getCookieSize',
            'getCustomPagePath',
            'getDaysSinceLastVisit',
            'getNamedAttribute',
            'getNewRepeat',
            'getPBD',
            'getPreviousValue',
            'getQueryParam',
            'getTimeParting',
            'getTimeToComplete',
            'getValOnce',
            'getVisitStart',
            'linkHandler',
            'downloadLinkHandler',
            'exitLinkHandler',
            'getPageName',
            'setClickMapEmail',
            'getYahooPurchaseID',
            'getYahooEvent',
            'getYahooProducts'
        ],
        globals: [
            's_account',
            's_objectID'
        ],
        accessors: [
            'campaign',
            'channel',
            'charSet',
            'cookieDomainPeriods',
            'cookieLifetime',
            'currencyCode',
            'dc',
            'doPlugins',
            'dynamicAccountList',
            'dynamicAccountMatch',
            'dynamicAccountSelection',
            'events',
            'fpCookieDomainPeriods',
            'linkDownloadFileTypes',
            'linkExternalFilters',
            'linkInternalFilters',
            'linkLeaveQueryString',
            'linkName',
            'linkTrackEvents',
            'linkTrackVars',
            'linkType',
            'pageName',
            'pageType',
            'pageURL',
            'products',
            'purchaseID',
            'referrer',
            'server',
            'state',
            'trackDownloadLinks',
            'trackExternalLinks',
            'trackingServer',
            'trackingServerSecure',
            'trackInlineStats',
            'transactionID',
            'usePlugins',
            'visitorID',
            'visitorNamespace',
            'zip',
            'eventList',
            'formList',
            'trackFormList',
            'trackPageName',
            'useCommerce',
            'varUsed',
            'siteID',
            'defaultPage',
            'queryVarsList',
            'pathConcatDelim',
            'pathExcludeDelim'
        ],
        readers: [
            'plugins',
            'browserHeight',
            'browserWidth',
            'colorDepth',
            'connectionType',
            'cookiesEnabled',
            'homepage',
            'javaEnabled',
            'javascriptVersion',
            'resolution'
        ]
    },
    handlers = {
        calls: function (method) {
            return function () {
                var id, args;

                args = Array.prototype.slice.call(arguments, 0);
                id = args.pop();

                return global[id][method].apply(global[id], args);
            };
        },
        accessors: function (property) {
            return function () {
                var id, args;

                args = Array.prototype.slice.call(arguments, 0);
                id = args.pop();

                if (args.length > 0) {
                    global[id][property] = args[0];
                } else {
                    return global[id][property];
                }
            };
        },
        readers: function (property) {
            return function () {
                var id, args;

                args = Array.prototype.slice.call(arguments, 0);
                id = args.pop();

                return global[id][property];
            };
        },
        globals: function (property) {
            return function () {
                var args = Array.prototype.slice.call(arguments, 0);

                if (args.length > 1) {
                    global[property] = args[0];
                } else {
                    return global[property];
                }
            };
        }
    },
    instanceNames = {};


    plugin = new ConnecTag.Plugin({
        initialized: false,

        initialize: function (settings, callback) {
            global.s_account = settings.s_account;
            ConnecTag.helpers.getScript(settings.path, callback);
        },

        track: function (settings, instances) {
            var i, instance, instanceName, self = this;

            if (this.initialized === false) {
                this.initialize(settings, function () {
                    self.initialized = true;
                    self.track(settings, instances);
                });

                return;
            }

            for (i = 0; (instance = instances[i]); i++) {
                instanceNames[instance.id] = instanceName = (settings.instanceName || "s");
                this.executeCommands(instance.commands, instanceName);
            }
        }
    });

    // Build methods
    for (type in methods) { if (methods.hasOwnProperty(type)) {
        for (i = 0; i < methods[type].length; i++) {
            plugin.methods[methods[type][i]] = handlers[type](methods[type][i]);
        }
    }}

    for (i = 1; i <= 50; i++) {
        plugin.methods['eVar' + i] = handlers.accessors('eVar' + i);
        plugin.methods['prop' + i] = handlers.accessors('prop' + i);

        if (i <= 5) {
            plugin.methods['hier' + i] = handlers.accessors('hier' + i);
        }
    }

    ConnecTag.plugins[id] = plugin;
}(this));
