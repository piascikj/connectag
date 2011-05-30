(function() {
  var getMethodHandler, id, method, methods, plugin, _i, _len;
  var __slice = Array.prototype.slice;
  id = "googleAnalytics";
  methods = ['_addIgnoredOrganic', '_addIgnoredRef', '_addItem', '_addOrganic', '_addTrans', '_clearIgnoredOrganic', '_clearIgnoredRef', '_clearOrganic', '_cookiePathCopy', '_deleteCustomVar', '_getAccount', '_getClientInfo', '_getDetectFlash', '_getDetectTitle', '_getLinkerUrl', '_getLocalGifPath', '_getServiceMode', '_getVersion', '_getVisitorCustomVar', '_link', '_linkByPost', '_setAccount', '_setAllowAnchor', '_setAllowHash', '_setAllowLinker', '_setCampContentKey', '_setCampMediumKey', '_setCampNameKey', '_setCampNOKey', '_setCampSourceKey', '_setCampTermKey', '_setCampaignCookieTimeout', '_setCampaignTrack', '_setClientInfo', '_setCookiePath', '_setCustomVar', '_setDetectFlash', '_setDetectTitle', '_setDomainName', '_setLocalGifPath', '_setLocalRemoteServerMode', '_setLocalServerMode', '_setReferrerOverride', '_setRemoteServerMode', '_setSampleRate', '_setSessionCookieTimeout', '_setVisitorCookieTimeout', '_trackEvent', '_trackPageview', '_trackTrans'];
  getMethodHandler = function(m) {
    return function() {
      var args, method;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      id = args.pop();
      method = (id ? "" + id + "." : "") + m;
      args.splice(0, 0, method);
      return window._gaq.push(args);
    };
  };
  plugin = new ConnecTag.Plugin({
    initialized: false,
    initialize: function(settings, callback) {
      var url;
      url = (window.location.protocol === 'https:' ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
      ConnecTag.helpers.getScript(url);
      return this.initialized = true;
    },
    track: function(settings, instances) {
      var instance, _i, _len;
      window._gaq = window._gaq || [];
      for (_i = 0, _len = instances.length; _i < _len; _i++) {
        instance = instances[_i];
        this.executeCommand({
          method: "_setAccount",
          parameters: [settings.account]
        }, instance.id);
        this.executeCommands(instance.commands, instance.id);
      }
      if (!this.initialized) {
        return this.initialize(settings);
      }
    }
  });
  for (_i = 0, _len = methods.length; _i < _len; _i++) {
    method = methods[_i];
    plugin.methods[method] = getMethodHandler(method);
  }
  ConnecTag.plugins[id] = plugin;
}).call(this);
