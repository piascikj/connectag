/*global ConnecTag: false, pixel: false */
/*jshint asi: false, bitwise: false, boss: true, curly: true, debug: false, eqeqeq: true, eqnull: false, evil: true, forin: false, immed: true, noarg: true, noempty: false, nonew: false, onevar: false, undef: true, sub: true, white: true */
(function (global) {
    var plugin, id, properties, getPropertyHandler;

    id = "i2a";

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
    ];

    getPropertyHandler = function (property) {
        return function (value) {
            if (typeof value === "string") {
                value = "'" + value + "'";
            }

            // Evaluate in the global scope
            new Function(property + " = " + value + ";")();
        };
    };

    plugin = new ConnecTag.Plugin({
        track: function (settings, instances) {
            var instance;

            instance = instances[0];    // There should only be one

            this.executeCommands(instance.commands, instance.id);

            if (typeof pixel !== "function") {
                ConnecTag.helpers.getScript(settings.path);
            }
        }
    });

    // Build methods
    ConnecTag.util.forEach(properties, function (property) {
        plugin.methods[property] = getPropertyHandler(property);
    });

    plugin.methods.pixel_conversion = function (pageAction) {
        global.pixel_conversion(pageAction);
    };

    ConnecTag.plugins[id] = plugin;
}(this));
