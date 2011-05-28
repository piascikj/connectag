describe "ConnecTag.modifiers", () ->
    describe "ConnecTag.modifiers.before", () ->
        it "should do nothing if the ID is not found", () ->
            commands = [{method: "blah", parameters: []}]
            modifier = {A: {method: "WHOA", parameters: []}}
            expected = commands

            expect(ConnecTag.modifiers.before(commands, modifier)).toEqual(expected)

        it "should insert a command or command array before the specified ID", () ->
            commands = [
                {id: "A", method: "blah", parameters: []}
                {id: "B", method: "blahblah", parameters: []}
            ]

            modifiers = [
                {
                    B: [
                        {method: "whoa", parameters: []}
                        {method: "whoawhoa", parameters: []}
                    ]
                }
                {A: {method: "blah", parameters: []}}
            ]

            expected = [
                [
                    {id: "A", method: "blah", parameters: []}
                    {method: "whoa", parameters: []}
                    {method: "whoawhoa", parameters: []}
                    {id: "B", method: "blahblah", parameters: []}
                ]
                [
                    {method: "blah", parameters: []}
                    {id: "A", method: "blah", parameters: []}
                    {id: "B", method: "blahblah", parameters: []}
                ]
            ]

            expect(ConnecTag.modifiers.before(commands, modifiers[0])).toEqual(expected[0])
            expect(ConnecTag.modifiers.before(commands, modifiers[1])).toEqual(expected[1])

    describe "ConnecTag.modifiers.after", () ->
        it "should do nothing if the ID is not found", () ->
            commands = [{id: "F", method: "hi", parameters: []}]
            modifier = {A: {method: "nuhuh", parameters: []}}
            expected = commands

            expect(ConnecTag.modifiers.after(commands, modifier)).toEqual(expected)

        it "should insert a command or command array after the specified ID", () ->
            commands = [
                {id: "A", method: "blah", parameters: []}
                {id: "B", method: "blahblah", parameters: []}
            ]

            modifiers = [
                {
                    B: [
                        {method: "whoa", parameters: []}
                        {method: "whoawhoa", parameters: []}
                    ]
                }
                {A: {method: "blah", parameters: []}}
            ]

            expected = [
                [
                    {id: "A", method: "blah", parameters: []}
                    {id: "B", method: "blahblah", parameters: []}
                    {method: "whoa", parameters: []}
                    {method: "whoawhoa", parameters: []}
                ]
                [
                    {id: "A", method: "blah", parameters: []}
                    {method: "blah", parameters: []}
                    {id: "B", method: "blahblah", parameters: []}
                ]
            ]

            expect(ConnecTag.modifiers.after(commands, modifiers[0])).toEqual(expected[0])
            expect(ConnecTag.modifiers.after(commands, modifiers[1])).toEqual(expected[1])

    describe "ConnecTag.modifiers.enable", () ->
        it "should set disabled:false on a command by ID or ID array", () ->
            commands = [{id: "A"}, {id: "B"}, {id: "C"}]
            modifiers = [["A", "B"], "C"]
            expected = [
                [{id: "A", disabled: false}, {id: "B", disabled: false}, {id: "C"}]
                [{id: "A", disabled: false}, {id: "B", disabled: false}, {id: "C", disabled: false}]
            ]

            expect(ConnecTag.modifiers.enable(commands, modifiers[0])).toEqual(expected[0])
            expect(ConnecTag.modifiers.enable(commands, modifiers[1])).toEqual(expected[1])

    describe "ConnecTag.modifiers.disable", () ->
        it "should set disabled:true on a command by ID or ID array", () ->
            commands = [{id: "A"}, {id: "B"}, {id: "C"}]
            modifiers = [["A", "B"], "C"]
            expected = [
                [{id: "A", disabled: true}, {id: "B", disabled: true}, {id: "C"}]
                [{id: "A", disabled: true}, {id: "B", disabled: true}, {id: "C", disabled: true}]
            ]

            expect(ConnecTag.modifiers.disable(commands, modifiers[0])).toEqual(expected[0])
            expect(ConnecTag.modifiers.disable(commands, modifiers[1])).toEqual(expected[1])

    describe "ConnecTag.modifiers.prepend", () ->
        it "should set add a command or command array to the beginning of the commands", () ->
            commands = [{id: "A"}, {id: "B"}]
            modifiers = [
                {method: "hi"}
                [{method: "hey"}, {method: "ho"}]
            ]
            expected = [
                [{method: "hi"}, {id: "A"}, {id: "B"}]
                [{method: "hey"}, {method: "ho"}, {id: "A"}, {id: "B"}]
            ]

            expect(ConnecTag.modifiers.prepend(commands, modifiers[0])).toEqual(expected[0])
            expect(ConnecTag.modifiers.prepend(commands, modifiers[1])).toEqual(expected[1])

    describe "ConnecTag.modifiers.append", () ->
        it "should set add a command or command array to the end of the commands", () ->
            commands = [{id: "A"}, {id: "B"}, {id: "C"}]
            modifiers = [["A", "B"], "C"]
            expected = [
                [{id: "A", disabled: true}, {id: "B", disabled: true}, {id: "C"}]
                [{id: "A", disabled: true}, {id: "B", disabled: true}, {id: "C", disabled: true}]
            ]

            expect(ConnecTag.modifiers.disable(commands, modifiers[0])).toEqual(expected[0])
            expect(ConnecTag.modifiers.disable(commands, modifiers[1])).toEqual(expected[1])
