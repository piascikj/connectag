(function() {
  var getPropertyHandler, id, plugin, properties, property, _i, _len;
  id = "i2a";
  properties = ['pageAction', 'price', 'sku', 'order_code', 'user_defined1', 'user_defined2', 'user_defined3', 'user_defined4', 'currency_id', 'ic_bu', 'ic_bc', 'ic_ch', 'ic_nso', 'altid', 'ic_cat', 'ic_type'];
  getPropertyHandler = function(property) {
    return function(value) {
      if (typeof value === "string") {
        value = "'" + value + "'";
      }
      return new Function("" + property + " = " + value)();
    };
  };
  plugin = new ConnecTag.Plugin({
    track: function(settings, instances) {
      var instance;
      instance = instances[0];
      this.executeCommands(instance.commands, instance.id);
      if (typeof pixel !== "function") {
        return ConnecTag.helpers.getScript(settings.path);
      }
    }
  });
  for (_i = 0, _len = properties.length; _i < _len; _i++) {
    property = properties[_i];
    plugin.methods[property] = getPropertyHandler(property);
  }
  plugin.methods.pixel_conversion = function(pageAction) {
    return window.pixel_conversion(pageAction);
  };
  ConnecTag.plugins[id] = plugin;
}).call(this);
