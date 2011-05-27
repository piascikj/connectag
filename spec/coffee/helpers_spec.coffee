describe "ConnecTag.helpers", ->
    describe "ConnecTag.helpers.parseJson", ->
        it "should throw a syntax error if the json is invalid", ->
            thrower = -> ConnecTag.helpers.parseJson('{"key":{{}}}')
            expect(thrower).toThrow()

        it "should return an object or an array", ->
            expect(ConnecTag.helpers.parseJson('[]')).toEqual([])
            expect(ConnecTag.helpers.parseJson('{}')).toEqual({})

        it "should use JSON.parse if it exists", ->
            json = "{}"
            window.JSON = window.JSON || {parse: ->}
            spyOn(window.JSON, "parse")

            ConnecTag.helpers.parseJson(json)

            expect(window.JSON.parse).toHaveBeenCalledWith(json)

        it "should use eval if JSON.parse is not available and JSON is valid", ->
            json = "{}"
            _JSON = window.JSON
            window.JSON = null

            spyOn(window, "eval")

            ConnecTag.helpers.parseJson(json)

            expect(window.eval).toHaveBeenCalledWith("(#{json})")
            window.JSON = _JSON

    describe "ConnecTag.helpers.parseTemplate", ->
        it "should parse a string template using a value from the context object", ->
            template = "${dodge} ${dodge} ${attack}"
            context = {dodge: "duck", attack: "face-punch!"}
            expected = "duck duck face-punch!"

            expect(ConnecTag.helpers.parseTemplate(template, context)).toEqual(expected)

        it "should return the context value as its original type if the template is the entire string", ->
            template1 = "${key}"
            template2 = "To string: ${key}"
            context = {key: {}}

            expect(ConnecTag.helpers.parseTemplate(template1, context)).toEqual({})
            expect(ConnecTag.helpers.parseTemplate(template2, context)).toEqual("To string: [object Object]")

    describe "ConnecTag.helpers.getJson", ->
        it "should call getScript if url is jsonp", ->
            url = "http://xdomain/people.json?jsonp=?"
            spyOn(ConnecTag.helpers, "getScript")

            ConnecTag.helpers.getJson(url, ->)

            # TODO Need better way to make sure getScript got the right URL
            expect(ConnecTag.helpers.getScript).toHaveBeenCalled()

        it "should make an ajax request for json and pass parsed result to the callback", ->
            request =
                readyState: 4
                status: 200
                open: ->
                send: ->
                    this.onreadystatechange()
            data = {}
            params =
                url: "http://domain/people.json"
                callback: ->

            spyOn(ConnecTag.helpers, "getXMLHttpRequest").andReturn(request)
            spyOn(request, "open").andCallThrough()
            spyOn(params, "callback").andCallThrough()
            spyOn(ConnecTag.helpers, "parseJson").andCallFake -> return data

            ConnecTag.helpers.getJson(params.url, params.callback)

            expect(ConnecTag.helpers.getXMLHttpRequest).toHaveBeenCalled()
            expect(request.open).toHaveBeenCalledWith("GET", params.url, true)
            expect(params.callback).toHaveBeenCalledWith(data)

    describe "ConnecTag.helpers.getScript", ->
