(function() {
  describe("ConnecTag.classes.Plugin", function() {
    return describe("ConnecTag.classes.Plugin.executeCommand", function() {
      var getPlugin;
      getPlugin = function() {
        var plugin;
        plugin = new ConnecTag.classes.Plugin;
        plugin.methods.spyMethod = jasmine.createSpy();
        return plugin;
      };
      it("should not execute disabled commands", function() {
        var plugin;
        plugin = getPlugin();
        plugin.executeCommand({
          disabled: true,
          method: "spyMethod",
          parameters: []
        });
        expect(plugin.methods.spyMethod).not.toHaveBeenCalled();
        plugin.executeCommand({
          disabled: false,
          method: "spyMethod",
          parameters: []
        });
        return expect(plugin.methods.spyMethod).toHaveBeenCalled();
      });
      it("should execute commands when they are found in command parameters", function() {
        var plugin;
        plugin = getPlugin();
        plugin.methods.nestedCommand = function() {
          return "hooray";
        };
        plugin.executeCommand({
          method: "spyMethod",
          parameters: [
            {
              method: "nestedCommand",
              parameters: []
            }
          ]
        });
        return expect(plugin.methods.spyMethod).toHaveBeenCalledWith("hooray");
      });
      it("should parse string templates in command parameters", function() {
        var plugin;
        plugin = getPlugin();
        ConnecTag.values.whatevers = "Hello";
        plugin.executeCommand({
          method: "spyMethod",
          parameters: ["${whatevers}"]
        });
        return expect(plugin.methods.spyMethod).toHaveBeenCalledWith("Hello");
      });
      return it("should not attempt to parse instanceIds", function() {
        var plugin;
        plugin = getPlugin();
        ConnecTag.values.whatevers = "Hello";
        plugin.executeCommand({
          method: "spyMethod",
          parameters: []
        }, "${whatevers}");
        return expect(plugin.methods.spyMethod).toHaveBeenCalledWith("${whatevers}");
      });
    });
  });
}).call(this);
