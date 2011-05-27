(function() {
  var global, handlers, id, instanceNames, method, methods, num, plugin, type, _i, _len;
  var __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty;
  global = this;
  id = "siteCatalyst";
  methods = {
    calls: ['t', 'sa', 'tl', 'setupFormAnalysis', 'sendFormEvent', 'getAndPersistValue', 'getCookieCount', 'getCookieSize', 'getCustomPagePath', 'getDaysSinceLastVisit', 'getNamedAttribute', 'getNewRepeat', 'getPBD', 'getPreviousValue', 'getQueryParam', 'getTimeParting', 'getTimeToComplete', 'getValOnce', 'getVisitStart', 'linkHandler', 'downloadLinkHandler', 'exitLinkHandler', 'getPageName', 'setClickMapEmail', 'getYahooPurchaseID', 'getYahooEvent', 'getYahooProducts'],
    globals: ['s_account', 's_objectID'],
    accessors: ['campaign', 'channel', 'charSet', 'cookieDomainPeriods', 'cookieLifetime', 'currencyCode', 'dc', 'doPlugins', 'dynamicAccountList', 'dynamicAccountMatch', 'dynamicAccountSelection', 'events', 'fpCookieDomainPeriods', 'linkDownloadFileTypes', 'linkExternalFilters', 'linkInternalFilters', 'linkLeaveQueryString', 'linkName', 'linkTrackEvents', 'linkTrackVars', 'linkType', 'pageName', 'pageType', 'pageURL', 'products', 'purchaseID', 'referrer', 'server', 'state', 'trackDownloadLinks', 'trackExternalLinks', 'trackingServer', 'trackingServerSecure', 'trackInlineStats', 'transactionID', 'usePlugins', 'visitorID', 'visitorNamespace', 'zip', 'eventList', 'formList', 'trackFormList', 'trackPageName', 'useCommerce', 'varUsed', 'siteID', 'defaultPage', 'queryVarsList', 'pathConcatDelim', 'pathExcludeDelim'],
    readers: ['plugins', 'browserHeight', 'browserWidth', 'colorDepth', 'connectionType', 'cookiesEnabled', 'homepage', 'javaEnabled', 'javascriptVersion', 'resolution']
  };
  handlers = {
    calls: function(method) {
      return function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        id = args.pop();
        return global[id][method].apply(global[id], args);
      };
    },
    accessors: function(property) {
      return function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        id = args.pop();
        if (args.length > 0) {
          return global[id][property] = args[0];
        } else {
          return global[id][property];
        }
      };
    },
    readers: function(property) {
      return function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        id = args.pop();
        return global[id][property];
      };
    },
    globals: function(property) {
      return function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (args.length > 1) {
          return global[property] = args[0];
        } else {
          return global[property];
        }
      };
    }
  };
  instanceNames = {};
  plugin = new ConnecTag.Plugin({
    initialized: false,
    initialize: function(settings, callback) {
      if (callback == null) {
        callback = function() {};
      }
      global.s_account = settings.s_account;
      return ConnecTag.helpers.getScript(settings.path, callback);
    },
    track: function(settings, instances) {
      var instance, instanceName, _i, _len, _results;
      if (!this.initialized) {
        this.initialize(settings, function() {
          this.initialized = true;
          return this.track(settings, instances);
        });
        return;
      }
      _results = [];
      for (_i = 0, _len = instances.length; _i < _len; _i++) {
        instance = instances[_i];
        instanceNames[instance.id] = instanceName = settings.instanceName || "s";
        _results.push(this.executeCommands(instance.commands, instanceName));
      }
      return _results;
    }
  });
  for (type in methods) {
    if (!__hasProp.call(methods, type)) continue;
    methods = methods[type];
    for (_i = 0, _len = methods.length; _i < _len; _i++) {
      method = methods[_i];
      plugin.methods[method] = handlers[type](method);
    }
  }
  for (num = 1; num <= 50; num++) {
    plugin.methods["eVar" + num] = handlers.accessors("eVar" + num);
    plugin.methods["prop" + num] = handlers.accessors("prop" + num);
    if (num <= 5) {
      plugin.methods["hier" + num] = handlers.accessors("hier" + num);
    }
  }
  ConnecTag.plugins[id] = plugin;
}).call(this);
