describe "ConnecTag.classes.Plugin", () ->
    describe "ConnecTag.classes.Plugin.executeCommand", () ->
        getPlugin = () ->
            plugin = new ConnecTag.classes.Plugin
            plugin.methods.spyMethod = jasmine.createSpy()
            plugin

        it "should not execute disabled commands", () ->
            plugin = getPlugin()

            plugin.executeCommand({disabled: true, method: "spyMethod", parameters: []})
            expect(plugin.methods.spyMethod).not.toHaveBeenCalled()

            plugin.executeCommand({disabled: false, method: "spyMethod", parameters: []})
            expect(plugin.methods.spyMethod).toHaveBeenCalled()

        it "should execute commands when they are found in command parameters", () ->
            plugin = getPlugin()
            plugin.methods.nestedCommand = () -> "hooray"
            plugin.executeCommand {
                method: "spyMethod",
                parameters: [{method: "nestedCommand", parameters: []}]
            }

            expect(plugin.methods.spyMethod).toHaveBeenCalledWith("hooray")

        it "should parse string templates in command parameters", () ->
            plugin = getPlugin()
            ConnecTag.values.whatevers = "Hello"
            plugin.executeCommand({method: "spyMethod", parameters: ["${whatevers}"]})

            expect(plugin.methods.spyMethod).toHaveBeenCalledWith("Hello")

        it "should not attempt to parse instanceIds", () ->
            plugin = getPlugin()
            ConnecTag.values.whatevers = "Hello"
            plugin.executeCommand({method: "spyMethod", parameters: []}, "${whatevers}")

            expect(plugin.methods.spyMethod).toHaveBeenCalledWith("${whatevers}")
