(function() {
  describe("ConnecTag.modifiers", function() {
    describe("ConnecTag.modifiers.before", function() {
      it("should do nothing if the ID is not found", function() {
        var commands, expected, modifier;
        commands = [
          {
            method: "blah",
            parameters: []
          }
        ];
        modifier = {
          A: {
            method: "WHOA",
            parameters: []
          }
        };
        expected = commands;
        return expect(ConnecTag.modifiers.before(commands, modifier)).toEqual(expected);
      });
      return it("should insert a command or command array before the specified ID", function() {
        var commands, expected, modifiers;
        commands = [
          {
            id: "A",
            method: "blah",
            parameters: []
          }, {
            id: "B",
            method: "blahblah",
            parameters: []
          }
        ];
        modifiers = [
          {
            B: [
              {
                method: "whoa",
                parameters: []
              }, {
                method: "whoawhoa",
                parameters: []
              }
            ]
          }, {
            A: {
              method: "blah",
              parameters: []
            }
          }
        ];
        expected = [
          [
            {
              id: "A",
              method: "blah",
              parameters: []
            }, {
              method: "whoa",
              parameters: []
            }, {
              method: "whoawhoa",
              parameters: []
            }, {
              id: "B",
              method: "blahblah",
              parameters: []
            }
          ], [
            {
              method: "blah",
              parameters: []
            }, {
              id: "A",
              method: "blah",
              parameters: []
            }, {
              id: "B",
              method: "blahblah",
              parameters: []
            }
          ]
        ];
        expect(ConnecTag.modifiers.before(commands, modifiers[0])).toEqual(expected[0]);
        return expect(ConnecTag.modifiers.before(commands, modifiers[1])).toEqual(expected[1]);
      });
    });
    describe("ConnecTag.modifiers.after", function() {
      it("should do nothing if the ID is not found", function() {
        var commands, expected, modifier;
        commands = [
          {
            id: "F",
            method: "hi",
            parameters: []
          }
        ];
        modifier = {
          A: {
            method: "nuhuh",
            parameters: []
          }
        };
        expected = commands;
        return expect(ConnecTag.modifiers.after(commands, modifier)).toEqual(expected);
      });
      return it("should insert a command or command array after the specified ID", function() {
        var commands, expected, modifiers;
        commands = [
          {
            id: "A",
            method: "blah",
            parameters: []
          }, {
            id: "B",
            method: "blahblah",
            parameters: []
          }
        ];
        modifiers = [
          {
            B: [
              {
                method: "whoa",
                parameters: []
              }, {
                method: "whoawhoa",
                parameters: []
              }
            ]
          }, {
            A: {
              method: "blah",
              parameters: []
            }
          }
        ];
        expected = [
          [
            {
              id: "A",
              method: "blah",
              parameters: []
            }, {
              id: "B",
              method: "blahblah",
              parameters: []
            }, {
              method: "whoa",
              parameters: []
            }, {
              method: "whoawhoa",
              parameters: []
            }
          ], [
            {
              id: "A",
              method: "blah",
              parameters: []
            }, {
              method: "blah",
              parameters: []
            }, {
              id: "B",
              method: "blahblah",
              parameters: []
            }
          ]
        ];
        expect(ConnecTag.modifiers.after(commands, modifiers[0])).toEqual(expected[0]);
        return expect(ConnecTag.modifiers.after(commands, modifiers[1])).toEqual(expected[1]);
      });
    });
    describe("ConnecTag.modifiers.enable", function() {
      return it("should set disabled:false on a command by ID or ID array", function() {
        var commands, expected, modifiers;
        commands = [
          {
            id: "A"
          }, {
            id: "B"
          }, {
            id: "C"
          }
        ];
        modifiers = [["A", "B"], "C"];
        expected = [
          [
            {
              id: "A",
              disabled: false
            }, {
              id: "B",
              disabled: false
            }, {
              id: "C"
            }
          ], [
            {
              id: "A",
              disabled: false
            }, {
              id: "B",
              disabled: false
            }, {
              id: "C",
              disabled: false
            }
          ]
        ];
        expect(ConnecTag.modifiers.enable(commands, modifiers[0])).toEqual(expected[0]);
        return expect(ConnecTag.modifiers.enable(commands, modifiers[1])).toEqual(expected[1]);
      });
    });
    describe("ConnecTag.modifiers.disable", function() {
      return it("should set disabled:true on a command by ID or ID array", function() {
        var commands, expected, modifiers;
        commands = [
          {
            id: "A"
          }, {
            id: "B"
          }, {
            id: "C"
          }
        ];
        modifiers = [["A", "B"], "C"];
        expected = [
          [
            {
              id: "A",
              disabled: true
            }, {
              id: "B",
              disabled: true
            }, {
              id: "C"
            }
          ], [
            {
              id: "A",
              disabled: true
            }, {
              id: "B",
              disabled: true
            }, {
              id: "C",
              disabled: true
            }
          ]
        ];
        expect(ConnecTag.modifiers.disable(commands, modifiers[0])).toEqual(expected[0]);
        return expect(ConnecTag.modifiers.disable(commands, modifiers[1])).toEqual(expected[1]);
      });
    });
    describe("ConnecTag.modifiers.prepend", function() {
      return it("should set add a command or command array to the beginning of the commands", function() {
        var commands, expected, modifiers;
        commands = [
          {
            id: "A"
          }, {
            id: "B"
          }
        ];
        modifiers = [
          {
            method: "hi"
          }, [
            {
              method: "hey"
            }, {
              method: "ho"
            }
          ]
        ];
        expected = [
          [
            {
              method: "hi"
            }, {
              id: "A"
            }, {
              id: "B"
            }
          ], [
            {
              method: "hey"
            }, {
              method: "ho"
            }, {
              id: "A"
            }, {
              id: "B"
            }
          ]
        ];
        expect(ConnecTag.modifiers.prepend(commands, modifiers[0])).toEqual(expected[0]);
        return expect(ConnecTag.modifiers.prepend(commands, modifiers[1])).toEqual(expected[1]);
      });
    });
    return describe("ConnecTag.modifiers.append", function() {
      return it("should set add a command or command array to the end of the commands", function() {
        var commands, expected, modifiers;
        commands = [
          {
            id: "A"
          }, {
            id: "B"
          }, {
            id: "C"
          }
        ];
        modifiers = [["A", "B"], "C"];
        expected = [
          [
            {
              id: "A",
              disabled: true
            }, {
              id: "B",
              disabled: true
            }, {
              id: "C"
            }
          ], [
            {
              id: "A",
              disabled: true
            }, {
              id: "B",
              disabled: true
            }, {
              id: "C",
              disabled: true
            }
          ]
        ];
        expect(ConnecTag.modifiers.disable(commands, modifiers[0])).toEqual(expected[0]);
        return expect(ConnecTag.modifiers.disable(commands, modifiers[1])).toEqual(expected[1]);
      });
    });
  });
}).call(this);
