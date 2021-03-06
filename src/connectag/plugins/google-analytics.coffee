class GoogleAnalytics extends ConnecTag.classes.Plugin
    @id = "GoogleAnalytics"

    constructor: () ->
        @initialized = false

    initialize: (settings, callback) ->
        url = "#{if window.location.protocol is 'https:' then 'https://ssl' else 'http://www'}.google-analytics.com/ga.js"
        @helpers.getScript(url)
        @initialized = true

    track: (settings, instances) ->
        window._gaq = window._gaq || []

        for instance in instances
            if settings.account?
                @executeCommand({id: "settings_account", method: "_setAccount", parameters: [settings.account]}, instance.id)

            @executeCommands(instance.commands, instance.id)

        @initialize(settings) if not @initialized

    methods: (() ->
        names = [
            '_addIgnoredOrganic'
            '_addIgnoredRef'
            '_addItem'
            '_addOrganic'
            '_addTrans'
            '_clearIgnoredOrganic'
            '_clearIgnoredRef'
            '_clearOrganic'
            '_cookiePathCopy'
            '_deleteCustomVar'
            '_getAccount'
            '_getClientInfo'
            '_getDetectFlash'
            '_getDetectTitle'
            '_getLinkerUrl'
            '_getLocalGifPath'
            '_getServiceMode'
            '_getVersion'
            '_getVisitorCustomVar'
            '_link'
            '_linkByPost'
            '_setAccount'
            '_setAllowAnchor'
            '_setAllowHash'
            '_setAllowLinker'
            '_setCampContentKey'
            '_setCampMediumKey'
            '_setCampNameKey'
            '_setCampNOKey'
            '_setCampSourceKey'
            '_setCampTermKey'
            '_setCampaignCookieTimeout'
            '_setCampaignTrack'
            '_setClientInfo'
            '_setCookiePath'
            '_setCustomVar'
            '_setDetectFlash'
            '_setDetectTitle'
            '_setDomainName'
            '_setLocalGifPath'
            '_setLocalRemoteServerMode'
            '_setLocalServerMode'
            '_setReferrerOverride'
            '_setRemoteServerMode'
            '_setSampleRate'
            '_setSessionCookieTimeout'
            '_setVisitorCookieTimeout'
            '_trackEvent'
            '_trackPageview'
            '_trackTrans'
        ]

        getMethodHandler = (m) ->
            return (args...) ->
                # Remove id, prepend to method, add method to args
                id = args.pop()
                method = (if id then "#{id}." else "") + m
                args.splice(0, 0, method)

                window._gaq.push(args)

        methods = {}
        for name in names
            methods[name] = getMethodHandler(name)

        methods
    )()

ConnecTag.classes.plugins.GoogleAnalytics = GoogleAnalytics
