describe "ConnecTag.util", () ->
    types =
        "object": {},
        "array": [],
        "number": 100,
        "boolean": true,
        "undefined": undefined,
        "nan": NaN,
        "function": () ->,
        "string": ""

    describe "ConnecTag.util.isArray", () ->
        it "should delegate to Array.isArray if present", () ->
            Array.isArray = Array.isArray || () ->
            spyOn(Array, 'isArray')

            ConnecTag.util.isArray([])
            expect(Array.isArray).toHaveBeenCalled()

        it "should identify an array", () ->
            for own type, value of types
                expect(ConnecTag.util.isArray(value)).toEqual(type is "array" ? true : false)

    describe "ConnecTag.util.toRegExp", () ->
        it "should return a RegExp given a valid regex string", () ->
            regexString = "^hello$"
            expect(ConnecTag.util.toRegExp(regexString).toString()).toEqual("/#{regexString}/")

        it "should return a RegExp given an array of valid regex strings", () ->
            regexArray = ["^hello$", "yo$"]
            expected = "/#{regexArray.join('|')}/"

            expect(ConnecTag.util.toRegExp(regexArray).toString()).toEqual(expected)

        it "should return an always fail RegExp given an invalid regex string", () ->
            regexString = "^(("
            expected = '/$.+^/'

            expect(ConnecTag.util.toRegExp(regexString).toString()).toEqual(expected)

    describe "ConnecTag.util.isNull", () ->
        it "should identify null", () ->
            for own type, value of types
                expect(ConnecTag.util.isNull(value)).toEqual(type is "null" ? true : false)


    describe "ConnecTag.util.typeOf", () ->
        it "should correctly identify array, null, and other native types", () ->
            for own type, value of types
                if type is "array"
                    expect(ConnecTag.util.typeOf(value)).toEqual('array')
                else if type is "null"
                  expect(ConnecTag.util.typeOf(value)).toEqual('null')
                else
                  expect(ConnecTag.util.typeOf(value)).toEqual(typeof value)

    describe "ConnecTag.util.extend", () ->
        it "should copy properties from a source object to the target", () ->
            target = {}
            source = {a: null, b: "whatever", c: []}
            expected = {a: null, b: "whatever", c: []}

            ConnecTag.util.extend(target, source)
            expect(target).toEqual(expected)

        it "should overwrite properties on the target object if property names match", () ->
            target = {a: "NOO", c: null}
            source = {a: "YES", b: null}
            expected = {a: "YES", b: null, c: null}

            ConnecTag.util.extend(target, source)
            expect(target).toEqual(expected)

        it "should recursively copy properties if performing a deep copy", () ->
            target = {a: {a1: "NOO", a2: "YES"}, b: "YES"}
            source = {a: {a1: "YES", a3: "YES"}}
            expected = {a: {a1: "YES", a2: "YES", a3: "YES"}, b: "YES"}

            ConnecTag.util.extend(true, target, source)
            expect(target).toEqual(expected)

        it "should perform a clone if matching source property is clonable and not the same type", () ->
            target =    {a: { a1: "NO" }}
            source =    {a: ["YES"]}
            expected =  {a: ["YES"]}

            ConnecTag.util.extend(true, target, source)
            expect(target).toEqual(expected)
            expect(target.a).not.toBe(source.a)

        it "should extend arrays", () ->
            target = [100, 200, {a: "NOO"}, 400, 500]
            source = ["A", "B", {a: "YES", b: "YES" }]
            expected = ["A", "B", {a: "YES", b: "YES"}, 400, 500]

            ConnecTag.util.extend(true, target, source)
            expect(target).toEqual(expected)
            expect(target[2]).not.toBe(source[2])

        it "should perform a simple copy for properties that are not cloneable", () ->
            target = { div: document.createElement('div'), win: window }
            source = { div: document.createElement('div'), win: window }

            ConnecTag.util.extend(true, target, source)
            expect(target.div).toBe(source.div)

        it "should ignore parameters that are not cloneable", () ->
            target = {}
            source = document.createElement('div')

            ConnecTag.util.extend(true, target, source)
            expect(target).toEqual({})

    describe "ConnecTag.util.clone", () ->
        it "should return a deep copy of an object or array", () ->
            typeOf = ConnecTag.util.typeOf
            target = {obj: {a: "", b: {c: ""}}, arr: ["a", "b", "c"]}
            expected = {obj: {a: "", b: {c: ""}}, arr: ["a", "b", "c"]}
            result = {}

            result.obj = ConnecTag.util.clone(target.obj)

            expect(result.obj).toEqual(expected.obj)
            expect(typeOf(result.obj)).toEqual(typeOf(expected.obj))
            expect(result.obj).not.toBe(target.obj)

            result.arr = ConnecTag.util.clone(target.arr)

            expect(result.arr).toEqual(expected.arr)
            expect(typeOf(result.arr)).toEqual(typeOf(expected.arr))
            expect(result.arr).not.toBe(target.arr)

        it "should not attempt to clone an 'uncloneable' object", () ->
            div = document.createElement('div')

            result = ConnecTag.util.clone(div)
            expect(result).toBe(div)
