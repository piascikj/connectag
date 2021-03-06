class SiteCatalyst extends ConnecTag.classes.Plugin
    @id = "SiteCatalyst"

    constructor: () ->
        @initialized = false
        @instanceNames = {}

    initialize: (settings, callback = () ->) ->
        window.s_account = settings.s_account
        @helpers.getScript(settings.path, callback)

    track: (settings, instances) ->
        if not @initialized
            @initialize settings, ()  ->
                @initialized = true
                @track(settings, instances)

            return

        for instance in instances
            @instanceNames[instance.id] = instanceName = (settings.instanceName || "s")
            @executeCommands(instance.commands, instanceName)

    methods: (() ->
        methodNames =
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
                    window[id][method].apply(window[id], args)

            accessors: (property) ->
                (args...) ->
                    id = args.pop()

                    if args.length > 0
                        window[id][property] = args[0]
                    else
                        window[id][property]

            readers: (property) ->
                (args...) ->
                    id = args.pop()
                    window[id][property]

            globals: (property) ->
                (args...) ->
                    if args.length > 1
                        window[property] = args[0]
                    else
                        window[property]

        # Build methods
        for own type, methods of methodNames
            for method in methods
                methods[method] = handlers[type](method)

        for num in [1..50]
            methods["eVar#{num}"] = handlers.accessors("eVar#{num}")
            methods["prop#{num}"] = handlers.accessors("prop#{num}")

            if num <= 5
                methods["hier#{num}"] = handlers.accessors("hier#{num}")

        methods
    )()

ConnecTag.classes.plugins.SiteCatalyst = SiteCatalyst
