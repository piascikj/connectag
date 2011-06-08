(function() {
  var GoogleAnalytics;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __slice = Array.prototype.slice;
  GoogleAnalytics = (function() {
    __extends(GoogleAnalytics, ConnecTag.classes.Plugin);
    GoogleAnalytics.id = "GoogleAnalytics";
    function GoogleAnalytics() {
      this.initialized = false;
    }
    GoogleAnalytics.prototype.initialize = function(settings, callback) {
      var url;
      url = "" + (window.location.protocol === 'https:' ? 'https://ssl' : 'http://www') + ".google-analytics.com/ga.js";
      this.helpers.getScript(url);
      return this.initialized = true;
    };
    GoogleAnalytics.prototype.track = function(settings, instances) {
      var instance, _i, _len;
      window._gaq = window._gaq || [];
      for (_i = 0, _len = instances.length; _i < _len; _i++) {
        instance = instances[_i];
        if (settings.account != null) {
          this.executeCommand({
            id: "settings_account",
            method: "_setAccount",
            parameters: [settings.account]
          }, instance.id);
        }
        this.executeCommands(instance.commands, instance.id);
      }
      if (!this.initialized) {
        return this.initialize(settings);
      }
    };
    GoogleAnalytics.prototype.methods = (function() {
      var getMethodHandler, methods, name, names, _i, _len;
      names = ['_addIgnoredOrganic', '_addIgnoredRef', '_addItem', '_addOrganic', '_addTrans', '_clearIgnoredOrganic', '_clearIgnoredRef', '_clearOrganic', '_cookiePathCopy', '_deleteCustomVar', '_getAccount', '_getClientInfo', '_getDetectFlash', '_getDetectTitle', '_getLinkerUrl', '_getLocalGifPath', '_getServiceMode', '_getVersion', '_getVisitorCustomVar', '_link', '_linkByPost', '_setAccount', '_setAllowAnchor', '_setAllowHash', '_setAllowLinker', '_setCampContentKey', '_setCampMediumKey', '_setCampNameKey', '_setCampNOKey', '_setCampSourceKey', '_setCampTermKey', '_setCampaignCookieTimeout', '_setCampaignTrack', '_setClientInfo', '_setCookiePath', '_setCustomVar', '_setDetectFlash', '_setDetectTitle', '_setDomainName', '_setLocalGifPath', '_setLocalRemoteServerMode', '_setLocalServerMode', '_setReferrerOverride', '_setRemoteServerMode', '_setSampleRate', '_setSessionCookieTimeout', '_setVisitorCookieTimeout', '_trackEvent', '_trackPageview', '_trackTrans'];
      getMethodHandler = function(m) {
        return function() {
          var args, id, method;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          id = args.pop();
          method = (id ? "" + id + "." : "") + m;
          args.splice(0, 0, method);
          return window._gaq.push(args);
        };
      };
      methods = {};
      for (_i = 0, _len = names.length; _i < _len; _i++) {
        name = names[_i];
        methods[name] = getMethodHandler(name);
      }
      return methods;
    })();
    return GoogleAnalytics;
  })();
  ConnecTag.classes.plugins.GoogleAnalytics = GoogleAnalytics;
}).call(this);
