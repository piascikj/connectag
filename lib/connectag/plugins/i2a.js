/*global ConnecTag: false */
/*jslint windows: true, devel: true, browser: true, evil: true, forin: true, onevar: true */
(function (global) {
    var i, plugin,
    id = "i2a",
    properties = [
        'pageAction',
        'price',
        'sku',
        'order_code',
        'user_defined1',
        'user_defined2',
        'user_defined3',
        'user_defined4',
        'currency_id',
        'ic_bu',
        'ic_bc',
        'ic_ch',
        'ic_nso',
        'altid',
        'ic_cat',
        'ic_type'
    ],
    getPropertyHandler = function (property) {
        return function (value) {
            if (typeof value === "string") {
                value = "'"+ value +"'";
            }
            // Evaluate in the global scope
            new Function(property + " = "+ value +";")();
        };
    };

    plugin = new ConnecTag.Plugin({
        track: function (settings, instances) {
            var instance = instances[0];    // There should only be one

            this.executeCommands(instance.commands, instance.id);
            if (typeof pixel !== "function") {
                ConnecTag.helpers.getScript(settings.path);
            }
        }
    });

    // Build methods
    for (i = 0; i < properties.length; i++) {
        plugin.methods[properties[i]] = getPropertyHandler(properties[i]);
    }
    
    plugin.methods.pixel_conversion = function (pageAction) {
        global.pixel_conversion(pageAction);
    };

    ConnecTag.plugins[id] = plugin;
}(this));
