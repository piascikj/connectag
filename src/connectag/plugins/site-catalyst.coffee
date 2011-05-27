global = this

id = "siteCatalyst"

methods =
    calls: [
        't'
        'sa'
        'tl'
        'setupFormAnalysis'
        'sendFormEvent'
        'getAndPersistValue'
        'getCookieCount'
        'getCookieSize'
        'getCustomPagePath'
        'getDaysSinceLastVisit'
        'getNamedAttribute'
        'getNewRepeat'
        'getPBD'
        'getPreviousValue'
        'getQueryParam'
        'getTimeParting'
        'getTimeToComplete'
        'getValOnce'
        'getVisitStart'
        'linkHandler'
        'downloadLinkHandler'
        'exitLinkHandler'
        'getPageName'
        'setClickMapEmail'
        'getYahooPurchaseID'
        'getYahooEvent'
        'getYahooProducts'
    ]
    globals: [
        's_account'
        's_objectID'
    ]
    accessors: [
        'campaign'
        'channel'
        'charSet'
        'cookieDomainPeriods'
        'cookieLifetime'
        'currencyCode'
        'dc'
        'doPlugins'
        'dynamicAccountList'
        'dynamicAccountMatch'
        'dynamicAccountSelection'
        'events'
        'fpCookieDomainPeriods'
        'linkDownloadFileTypes'
        'linkExternalFilters'
        'linkInternalFilters'
        'linkLeaveQueryString'
        'linkName'
        'linkTrackEvents'
        'linkTrackVars'
        'linkType'
        'pageName'
        'pageType'
        'pageURL'
        'products'
        'purchaseID'
        'referrer'
        'server'
        'state'
        'trackDownloadLinks'
        'trackExternalLinks'
        'trackingServer'
        'trackingServerSecure'
        'trackInlineStats'
        'transactionID'
        'usePlugins'
        'visitorID'
        'visitorNamespace'
        'zip'
        'eventList'
        'formList'
        'trackFormList'
        'trackPageName'
        'useCommerce'
        'varUsed'
        'siteID'
        'defaultPage'
        'queryVarsList'
        'pathConcatDelim'
        'pathExcludeDelim'
    ]
    readers: [
        'plugins'
        'browserHeight'
        'browserWidth'
        'colorDepth'
        'connectionType'
        'cookiesEnabled'
        'homepage'
        'javaEnabled'
        'javascriptVersion'
        'resolution'
    ]


handlers =
    calls: (method) ->
        (args...) ->
            id = args.pop()
            global[id][method].apply(global[id], args)

    accessors: (property) ->
        (args...) ->
            id = args.pop()

            if args.length > 0
                global[id][property] = args[0]
            else
                global[id][property]

    readers: (property) ->
        (args...) ->
            id = args.pop()
            global[id][property]

    globals: (property) ->
        (args...) ->
            if args.length > 1
                global[property] = args[0]
            else
                global[property]

instanceNames = {}

plugin = new ConnecTag.Plugin {
    initialized: false

    initialize: (settings, callback = () ->) ->
        global.s_account = settings.s_account
        ConnecTag.helpers.getScript(settings.path, callback)

    track: (settings, instances) ->
        if not @initialized
            @initialize settings, ()  ->
                @initialized = true
                @track(settings, instances)

            return

        for instance in instances
            instanceNames[instance.id] = instanceName = (settings.instanceName || "s")
            @executeCommands(instance.commands, instanceName)
}

# Build methods
for own type, methods of methods
    for method in methods
        plugin.methods[method] = handlers[type](method)

for num in [1..50]
    plugin.methods["eVar#{num}"] = handlers.accessors("eVar#{num}")
    plugin.methods["prop#{num}"] = handlers.accessors("prop#{num}")

    if num <= 5
        plugin.methods["hier#{num}"] = handlers.accessors("hier#{num}")

ConnecTag.plugins[id] = plugin
