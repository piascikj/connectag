id = "i2a"

properties = [
    'pageAction'
    'price'
    'sku'
    'order_code'
    'user_defined1'
    'user_defined2'
    'user_defined3'
    'user_defined4'
    'currency_id'
    'ic_bu'
    'ic_bc'
    'ic_ch'
    'ic_nso'
    'altid'
    'ic_cat'
    'ic_type'
]

getPropertyHandler = (property) ->
    return (value) ->
        if typeof value is "string"
            value = "'#{value}'"

        # Evaluate in the global scope
        new Function("#{property} = #{value}")()

plugin = new ConnecTag.Plugin {
    track: (settings, instances) ->
        instance = instances[0]    # There should only be one
        @executeCommands(instance.commands, instance.id)

        if typeof pixel isnt "function"
            ConnecTag.helpers.getScript(settings.path)
}

# Build methods
for property in properties
    plugin.methods[property] = getPropertyHandler(property)

plugin.methods.pixel_conversion = (pageAction) ->
    window.pixel_conversion(pageAction)

ConnecTag.plugins[id] = plugin
