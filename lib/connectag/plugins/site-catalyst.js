(function() {
  var SiteCatalyst;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __slice = Array.prototype.slice;
  SiteCatalyst = (function() {
    __extends(SiteCatalyst, ConnecTag.classes.Plugin);
    SiteCatalyst.id = "SiteCatalyst";
    function SiteCatalyst() {
      this.initialized = false;
      this.instanceNames = {};
    }
    SiteCatalyst.prototype.initialize = function(settings, callback) {
      if (callback == null) {
        callback = function() {};
      }
      window.s_account = settings.s_account;
      return this.helpers.getScript(settings.path, callback);
    };
    SiteCatalyst.prototype.track = function(settings, instances) {
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
        this.instanceNames[instance.id] = instanceName = settings.instanceName || "s";
        _results.push(this.executeCommands(instance.commands, instanceName));
      }
      return _results;
    };
    SiteCatalyst.prototype.methods = (function() {
      var handlers, method, methodNames, methods, num, type, _i, _len;
      methodNames = {
        calls: ['t', 'sa', 'tl', 'setupFormAnalysis', 'sendFormEvent', 'getAndPersistValue', 'getCookieCount', 'getCookieSize', 'getCustomPagePath', 'getDaysSinceLastVisit', 'getNamedAttribute', 'getNewRepeat', 'getPBD', 'getPreviousValue', 'getQueryParam', 'getTimeParting', 'getTimeToComplete', 'getValOnce', 'getVisitStart', 'linkHandler', 'downloadLinkHandler', 'exitLinkHandler', 'getPageName', 'setClickMapEmail', 'getYahooPurchaseID', 'getYahooEvent', 'getYahooProducts'],
        globals: ['s_account', 's_objectID'],
        accessors: ['campaign', 'channel', 'charSet', 'cookieDomainPeriods', 'cookieLifetime', 'currencyCode', 'dc', 'doPlugins', 'dynamicAccountList', 'dynamicAccountMatch', 'dynamicAccountSelection', 'events', 'fpCookieDomainPeriods', 'linkDownloadFileTypes', 'linkExternalFilters', 'linkInternalFilters', 'linkLeaveQueryString', 'linkName', 'linkTrackEvents', 'linkTrackVars', 'linkType', 'pageName', 'pageType', 'pageURL', 'products', 'purchaseID', 'referrer', 'server', 'state', 'trackDownloadLinks', 'trackExternalLinks', 'trackingServer', 'trackingServerSecure', 'trackInlineStats', 'transactionID', 'usePlugins', 'visitorID', 'visitorNamespace', 'zip', 'eventList', 'formList', 'trackFormList', 'trackPageName', 'useCommerce', 'varUsed', 'siteID', 'defaultPage', 'queryVarsList', 'pathConcatDelim', 'pathExcludeDelim'],
        readers: ['plugins', 'browserHeight', 'browserWidth', 'colorDepth', 'connectionType', 'cookiesEnabled', 'homepage', 'javaEnabled', 'javascriptVersion', 'resolution']
      };
      handlers = {
        calls: function(method) {
          return function() {
            var args, id;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            id = args.pop();
            return window[id][method].apply(window[id], args);
          };
        },
        accessors: function(property) {
          return function() {
            var args, id;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            id = args.pop();
            if (args.length > 0) {
              return window[id][property] = args[0];
            } else {
              return window[id][property];
            }
          };
        },
        readers: function(property) {
          return function() {
            var args, id;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            id = args.pop();
            return window[id][property];
          };
        },
        globals: function(property) {
          return function() {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            if (args.length > 1) {
              return window[property] = args[0];
            } else {
              return window[property];
            }
          };
        }
      };
      for (type in methodNames) {
        if (!__hasProp.call(methodNames, type)) continue;
        methods = methodNames[type];
        for (_i = 0, _len = methods.length; _i < _len; _i++) {
          method = methods[_i];
          methods[method] = handlers[type](method);
        }
      }
      for (num = 1; num <= 50; num++) {
        methods["eVar" + num] = handlers.accessors("eVar" + num);
        methods["prop" + num] = handlers.accessors("prop" + num);
        if (num <= 5) {
          methods["hier" + num] = handlers.accessors("hier" + num);
        }
      }
      return methods;
    })();
    return SiteCatalyst;
  })();
  ConnecTag.classes.plugins.SiteCatalyst = SiteCatalyst;
}).call(this);
