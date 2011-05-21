describe("ConnecTag.matchers", function () {
    // All the location matchers are pretty much the same...
    // so I'm just going to test this one because it's easy to manipulate.
    describe("ConnecTag.matchers.hash", function () {
        it("should match patterns against given values or window.location.hash", function () {
            var patterns;

            patterns = ['^#yo$', '^#hey$'];

            expect(ConnecTag.matchers.hash(patterns, '#hey')).toEqual(true);
            expect(ConnecTag.matchers.hash(patterns, '#hello')).toEqual(false);

            window.location.hash = "hey";
            expect(ConnecTag.matchers.hash(patterns)).toEqual(true);

            window.location.hash = "bye";
            expect(ConnecTag.matchers.hash(patterns)).toEqual(false);

            window.location.hash = "";
        });
    });

    describe("ConnecTag.matchers.pageId", function () {
        it("should match patterns against given values or ConnecTag.values.pageId", function () {
            var patterns
            
            patterns = ['^74$','^1000$','^homepage$'];

            expect(ConnecTag.matchers.pageId(patterns, "homepage")).toEqual(true);
            expect(ConnecTag.matchers.pageId(patterns, "hopage")).toEqual(false);
            expect(ConnecTag.matchers.pageId(patterns, ['ADLKJASD', '74'])).toEqual(true);

            ConnecTag.values.pageId = 1000;
            expect(ConnecTag.matchers.pageId(patterns)).toEqual(true);

            ConnecTag.values.pageId = 0;
            expect(ConnecTag.matchers.pageId(patterns)).toEqual(false);

            ConnecTag.values.pageId = [0, 2000, 'homepage'];
            expect(ConnecTag.matchers.pageId(patterns)).toEqual(true);
        });
    });

    describe("ConnecTag.matchers.event", function () {
        it("should match patterns against given values", function () {
            var patterns;

            patterns = ['^someClickEvent$','^anotherClick$'];

            expect(ConnecTag.matchers.event(patterns, 'someClickEvent')).toEqual(true);
            expect(ConnecTag.matchers.event(patterns, 'AGHSDLFKSJF')).toEqual(false);
            expect(ConnecTag.matchers.event(patterns, ['skfjs', 'lkajslkfjsf'])).toEqual(false);
            expect(ConnecTag.matchers.event(patterns, ['anotherClick', 'AHWLKWJLKJSLKJSDF'])).toEqual(true);
        });
    });
});
